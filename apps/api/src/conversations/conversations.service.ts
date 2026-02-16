import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { ConversationsRepository } from "./repositories/conversations.repository.js";
import { BlockRepository } from "../block/repositories/block.repository.js";

@Injectable()
export class ConversationsService {
  constructor(
    private readonly conversationsRepo: ConversationsRepository,
    private readonly blockRepo: BlockRepository,
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

  async getConversations(userId: string, cursor?: string, limit: number = 20) {
    const conversations = await this.conversationsRepo.findByUserId(
      userId,
      cursor,
      limit,
    );

    // Check if there are more items
    const hasMore = conversations.length > limit;
    const items = hasMore ? conversations.slice(0, limit) : conversations;

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      items.map(async (conv) => {
        const unreadCount = await this.conversationsRepo.getUnreadCount(
          conv.id,
          userId,
        );
        return {
          ...conv,
          unreadCount,
        };
      }),
    );

    return {
      data: conversationsWithUnread,
      nextCursor: hasMore ? items[items.length - 1].id : null,
    };
  }

  async getConversation(
    conversationId: string,
    userId: string,
    cursor?: string,
    limit: number = 50,
  ) {
    const conversation = await this.conversationsRepo.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException("대화를 찾을 수 없습니다.");
    }

    // Verify participant
    const isParticipant = await this.conversationsRepo.isParticipant(
      conversationId,
      userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException("이 대화에 참여할 권한이 없습니다.");
    }

    // Get messages
    const messages = await this.conversationsRepo.getMessages(
      conversationId,
      cursor,
      limit,
    );

    // Check if there are more messages
    const hasMore = messages.length > limit;
    const messageItems = hasMore ? messages.slice(0, limit) : messages;

    return {
      conversation,
      messages: messageItems,
      nextCursor: hasMore ? messageItems[messageItems.length - 1].id : null,
    };
  }

  async sendMessage(conversationId: string, userId: string, content: string) {
    // Verify participant
    const isParticipant = await this.conversationsRepo.isParticipant(
      conversationId,
      userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException("이 대화에 참여할 권한이 없습니다.");
    }

    // Get conversation to find other participant
    const conversation = await this.conversationsRepo.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException("대화를 찾을 수 없습니다.");
    }

    // Check block (find the other participant)
    const otherParticipant = conversation.participants.find((p) => p.userId !== userId);
    if (otherParticipant) {
      const blocked = await this.blockRepo.isBlocked(userId, otherParticipant.userId);
      if (blocked) {
        throw new ForbiddenException("차단된 사용자에게 메시지를 보낼 수 없습니다.");
      }
    }

    // Create message + update conversation updatedAt
    return this.conversationsRepo.createMessage(conversationId, userId, content);
  }

  async markAsRead(conversationId: string, userId: string) {
    // Verify participant
    const isParticipant = await this.conversationsRepo.isParticipant(
      conversationId,
      userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException("이 대화에 참여할 권한이 없습니다.");
    }

    return this.conversationsRepo.updateLastRead(conversationId, userId);
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.conversationsRepo.getMessageById(messageId);

    if (!message) {
      throw new NotFoundException("메시지를 찾을 수 없습니다.");
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException("본인의 메시지만 삭제할 수 있습니다.");
    }

    return this.conversationsRepo.deleteMessage(messageId);
  }
}
