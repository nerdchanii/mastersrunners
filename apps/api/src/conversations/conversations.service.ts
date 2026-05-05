import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { BlockRepository } from "../block/repositories/block.repository.js";
import { RealtimeEventsService } from "../realtime/realtime-events.service.js";

import { ConversationsRepository } from "./repositories/conversations.repository.js";

type ConversationType = "DIRECT" | "CREW" | "ACTIVITY";

interface ConversationUser {
  id: string;
  name: string;
  profileImage: string | null;
}

interface ConversationCrewContext {
  id: string;
  name: string;
  imageUrl: string | null;
}

interface ConversationActivityContext {
  id: string;
  title: string;
  crewId: string;
  status: string;
  crew: ConversationCrewContext | null;
}

interface ConversationParticipant {
  userId: string;
  lastReadAt: Date | null;
  leftAt: Date | null;
  joinedAt: Date;
  user: ConversationUser;
}

interface ConversationSummaryMessage {
  id: string;
  conversationId: string;
  deletedAt: Date | null;
  content: string;
  senderId: string;
  createdAt: Date;
}

interface ConversationMessage extends ConversationSummaryMessage {
  conversationId: string;
  deletedAt: Date | null;
  sender: ConversationUser;
}

export interface ConversationResponse {
  id: string;
  type: ConversationType;
  name: string | null;
  crewId: string | null;
  activityId: string | null;
  crew: ConversationCrewContext | null;
  activity: ConversationActivityContext | null;
  updatedAt: Date;
  participants: ConversationParticipant[];
}

export interface ConversationListItemResponse extends ConversationResponse {
  messages: ConversationSummaryMessage[];
  unreadCount: number;
}

export interface ConversationListResponse {
  data: ConversationListItemResponse[];
  nextCursor: string | null;
}

interface ConversationUnreadCountResponse {
  count: number;
}

export interface ConversationDetailResponse {
  conversation: ConversationResponse;
  messages: ConversationMessage[];
  olderCursor: string | null;
  newerCursor: string | null;
  firstUnreadMessageId: string | null;
}

function mapConversationUser(user: {
  id: string;
  name: string;
  profileImage: string | null;
}): ConversationUser {
  return {
    id: user.id,
    name: user.name,
    profileImage: user.profileImage,
  };
}

function mapConversationCrewContext(
  crew: { id: string; name: string; imageUrl: string | null } | null,
): ConversationCrewContext | null {
  if (!crew) {
    return null;
  }

  return {
    id: crew.id,
    name: crew.name,
    imageUrl: crew.imageUrl,
  };
}

function mapConversationActivityContext(
  activity: {
    id: string;
    title: string;
    crewId: string;
    status: string;
    crew: { id: string; name: string; imageUrl: string | null } | null;
  } | null,
): ConversationActivityContext | null {
  if (!activity) {
    return null;
  }

  return {
    id: activity.id,
    title: activity.title,
    crewId: activity.crewId,
    status: activity.status,
    crew: mapConversationCrewContext(activity.crew),
  };
}

function mapConversationParticipants(
  participants: Array<{
    userId: string;
    lastReadAt?: Date | null;
    leftAt?: Date | null;
    joinedAt: Date;
    user: { id: string; name: string; profileImage: string | null };
  }>,
): ConversationParticipant[] {
  return participants.map((participant) => ({
    userId: participant.userId,
    lastReadAt: participant.lastReadAt ?? null,
    leftAt: participant.leftAt ?? null,
    joinedAt: participant.joinedAt,
    user: mapConversationUser(participant.user),
  }));
}

function mapConversationResponse(conversation: {
  id: string;
  type: ConversationType;
  name: string | null;
  crewId: string | null;
  activityId: string | null;
  crew: { id: string; name: string; imageUrl: string | null } | null;
  activity: {
    id: string;
    title: string;
    crewId: string;
    status: string;
    crew: { id: string; name: string; imageUrl: string | null } | null;
  } | null;
  updatedAt: Date;
  participants: Array<{
    userId: string;
    lastReadAt?: Date | null;
    leftAt?: Date | null;
    joinedAt: Date;
    user: { id: string; name: string; profileImage: string | null };
  }>;
}): ConversationResponse {
  return {
    id: conversation.id,
    type: conversation.type,
    name: conversation.name,
    crewId: conversation.crewId,
    activityId: conversation.activityId,
    crew: mapConversationCrewContext(conversation.crew),
    activity: mapConversationActivityContext(conversation.activity),
    updatedAt: conversation.updatedAt,
    participants: mapConversationParticipants(conversation.participants),
  };
}

function mapConversationSummaryMessage(message: {
  id: string;
  conversationId: string;
  deletedAt: Date | null;
  content: string;
  senderId: string;
  createdAt: Date;
}): ConversationSummaryMessage {
  return {
    id: message.id,
    conversationId: message.conversationId,
    deletedAt: message.deletedAt,
    content: message.content,
    senderId: message.senderId,
    createdAt: message.createdAt,
  };
}

function mapConversationMessage(message: {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  deletedAt: Date | null;
  createdAt: Date;
  sender: { id: string; name: string; profileImage: string | null };
}): ConversationMessage {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    content: message.content,
    deletedAt: message.deletedAt,
    createdAt: message.createdAt,
    sender: mapConversationUser(message.sender),
  };
}

@Injectable()
export class ConversationsService {
  constructor(
    private readonly conversationsRepo: ConversationsRepository,
    private readonly blockRepo: BlockRepository,
    private readonly realtimeEvents: RealtimeEventsService,
  ) {}

  async startConversation(userId: string, participantId: string) {
    // Prevent self-conversation
    if (userId === participantId) {
      throw new BadRequestException("자기 자신에게 메시지를 보낼 수 없습니다.");
    }

    // Check block relationship
    const blocked = await this.blockRepo.isBlocked(userId, participantId);
    if (blocked) {
      throw new ForbiddenException("차단된 사용자와 대화를 시작할 수 없습니다.");
    }

    // Find or create conversation
    return this.conversationsRepo.findOrCreateDirect(userId, participantId);
  }

  async getConversations(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<ConversationListResponse> {
    const conversations = await this.conversationsRepo.findByUserId(userId, cursor, limit);

    // Check if there are more items
    const hasMore = conversations.length > limit;
    const items = hasMore ? conversations.slice(0, limit) : conversations;

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      items.map(async (conv: (typeof items)[number]) => {
        const unreadCount = await this.conversationsRepo.getUnreadCount(conv.id, userId);
        return {
          ...mapConversationResponse(conv),
          messages: conv.messages.map(mapConversationSummaryMessage),
          unreadCount,
        };
      }),
    );

    return {
      data: conversationsWithUnread,
      nextCursor: hasMore ? items[items.length - 1].id : null,
    };
  }

  async getUnreadCount(userId: string): Promise<ConversationUnreadCountResponse> {
    return {
      count: await this.conversationsRepo.getTotalUnreadCount(userId),
    };
  }

  async getConversation(
    conversationId: string,
    userId: string,
    options: {
      cursor?: string;
      direction?: "older" | "newer";
      entry?: "latest" | "unread";
      historyLimit?: number;
      unreadLimit?: number;
      limit?: number;
    } = {},
  ): Promise<ConversationDetailResponse> {
    const conversation = await this.conversationsRepo.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException("대화를 찾을 수 없습니다.");
    }

    // Verify participant
    const isParticipant = await this.conversationsRepo.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new ForbiddenException("이 대화에 참여할 권한이 없습니다.");
    }

    // Only direct conversations inherit user block boundaries.
    const otherParticipant =
      conversation.type === "DIRECT"
        ? conversation.participants.find(
            (p: (typeof conversation.participants)[number]) => p.userId !== userId,
          )
        : undefined;
    if (otherParticipant) {
      const blocked = await this.blockRepo.isBlocked(userId, otherParticipant.userId);
      if (blocked) {
        throw new ForbiddenException("차단 관계로 인해 대화를 볼 수 없습니다.");
      }
    }

    const messageWindow = await this.conversationsRepo.getConversationWindow(
      conversationId,
      userId,
      options,
    );

    const selfParticipant = conversation.participants.find(
      (participant: (typeof conversation.participants)[number]) => participant.userId === userId,
    );
    if (
      conversation.type === "DIRECT" &&
      selfParticipant?.leftAt &&
      messageWindow.messages.length === 0
    ) {
      throw new NotFoundException("대화를 찾을 수 없습니다.");
    }

    await this.conversationsRepo.updateLastRead(conversationId, userId).catch(() => {});

    return {
      conversation: mapConversationResponse(conversation),
      messages: messageWindow.messages.map(mapConversationMessage),
      olderCursor: messageWindow.olderCursor,
      newerCursor: messageWindow.newerCursor,
      firstUnreadMessageId: messageWindow.firstUnreadMessageId,
    };
  }

  async sendMessage(conversationId: string, userId: string, content: string) {
    // Verify participant
    const isParticipant = await this.conversationsRepo.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new ForbiddenException("이 대화에 참여할 권한이 없습니다.");
    }

    // Get conversation to find other participant
    const conversation = await this.conversationsRepo.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException("대화를 찾을 수 없습니다.");
    }

    // Only direct conversations inherit user block boundaries.
    const otherParticipant =
      conversation.type === "DIRECT"
        ? conversation.participants.find(
            (p: (typeof conversation.participants)[number]) => p.userId !== userId,
          )
        : undefined;
    if (otherParticipant) {
      const blocked = await this.blockRepo.isBlocked(userId, otherParticipant.userId);
      if (blocked) {
        throw new ForbiddenException("차단된 사용자에게 메시지를 보낼 수 없습니다.");
      }
    }

    // Create message + update conversation updatedAt
    const message = await this.conversationsRepo.createMessage(conversationId, userId, content);

    this.realtimeEvents.emitChatMessage(
      conversationId,
      conversation.participants.map(
        (participant: (typeof conversation.participants)[number]) => participant.userId,
      ),
      message,
    );

    return message;
  }

  async markAsRead(conversationId: string, userId: string) {
    // Verify participant
    const isParticipant = await this.conversationsRepo.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new ForbiddenException("이 대화에 참여할 권한이 없습니다.");
    }

    const result = await this.conversationsRepo.updateLastRead(conversationId, userId);
    try {
      const totalUnreadCount = await this.conversationsRepo.getTotalUnreadCount(userId);
      this.realtimeEvents.emitChatUnreadUpdate(userId, {
        conversationId,
        unreadCount: 0,
        totalUnreadCount,
      });
    } catch {
      this.realtimeEvents.emitChatUnreadUpdate(userId, {
        conversationId,
        unreadCount: 0,
        totalUnreadCount: null,
      });
    }
    return result;
  }

  async leaveConversation(conversationId: string, userId: string) {
    const conversation = await this.conversationsRepo.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException("대화를 찾을 수 없습니다.");
    }

    const isParticipant = conversation.participants.some(
      (participant: (typeof conversation.participants)[number]) => participant.userId === userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException("이 대화에 참여할 권한이 없습니다.");
    }

    if (conversation.type !== "DIRECT") {
      throw new BadRequestException("1:1 대화만 나갈 수 있습니다.");
    }

    await this.conversationsRepo.setParticipantLeftAt(conversationId, userId, new Date());
    return { id: conversationId };
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.conversationsRepo.getMessageById(messageId);

    if (!message || message.deletedAt) {
      throw new NotFoundException("메시지를 찾을 수 없습니다.");
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException("본인의 메시지만 삭제할 수 있습니다.");
    }

    await this.conversationsRepo.deleteMessage(messageId);
    return { id: messageId };
  }
}
