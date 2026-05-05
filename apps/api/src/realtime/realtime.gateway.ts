import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { extractAccessTokenFromCookieHeader } from "../auth/auth-cookie.util.js";
import { BlockRepository } from "../block/repositories/block.repository.js";
import { ConversationsRepository } from "../conversations/repositories/conversations.repository.js";
import { NotificationRepository } from "../notifications/repositories/notification.repository.js";

import { RealtimeEventsService } from "./realtime-events.service.js";

interface SocketAuthUser {
  userId: string;
  email?: string;
}

type AuthenticatedSocket = Socket & {
  data: {
    user?: SocketAuthUser;
  };
};

const MAX_CHAT_MESSAGE_LENGTH = 2000;
type RealtimeConversation = NonNullable<Awaited<ReturnType<ConversationsRepository["findById"]>>>;

@WebSocketGateway({
  namespace: "/realtime",
  path: "/api/v1/socket.io",
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ["websocket"],
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly conversationsRepo: ConversationsRepository,
    private readonly notificationRepo: NotificationRepository,
    private readonly blockRepo: BlockRepository,
    private readonly events: RealtimeEventsService,
  ) {}

  afterInit(server: Server) {
    this.events.bindServer(server);
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const user = await this.authenticateClient(client);
      client.data.user = user;
      await client.join(this.events.getUserRoom(user.userId));
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage("chat:subscribe")
  async handleSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { conversationId?: string } | undefined,
  ) {
    const userId = this.requireUserId(client);
    const conversationId = this.requireConversationId(payload);
    await this.assertParticipant(conversationId, userId);
    await client.join(this.events.getConversationRoom(conversationId));
    return { ok: true, conversationId };
  }

  @SubscribeMessage("chat:unsubscribe")
  async handleUnsubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { conversationId?: string } | undefined,
  ) {
    const conversationId = this.requireConversationId(payload);
    await client.leave(this.events.getConversationRoom(conversationId));
    return { ok: true, conversationId };
  }

  @SubscribeMessage("chat:send")
  async handleSend(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { conversationId?: string; content?: string } | undefined,
  ) {
    const userId = this.requireUserId(client);
    const conversationId = this.requireConversationId(payload);
    const rawContent = payload?.content;
    if (rawContent && rawContent.length > MAX_CHAT_MESSAGE_LENGTH) {
      throw new WsException(
        `content must be shorter than or equal to ${MAX_CHAT_MESSAGE_LENGTH} characters`,
      );
    }
    const content = rawContent?.trim();
    if (!content) {
      throw new WsException("content is required");
    }

    await this.assertParticipant(conversationId, userId);
    const conversation = await this.getConversationOrThrow(conversationId);
    await this.assertDirectMessageBlockBoundary(conversation, userId);

    const message = await this.conversationsRepo.createMessage(conversationId, userId, content);
    this.events.emitChatMessage(
      conversationId,
      conversation.participants.map(
        (participant: RealtimeConversation["participants"][number]) => participant.userId,
      ),
      message,
    );

    return message;
  }

  @SubscribeMessage("chat:read")
  async handleChatRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { conversationId?: string } | undefined,
  ) {
    const userId = this.requireUserId(client);
    const conversationId = this.requireConversationId(payload);
    await this.assertParticipant(conversationId, userId);
    await this.conversationsRepo.updateLastRead(conversationId, userId);
    const totalUnreadCount = await this.getTotalUnreadCountOrNull(userId);
    const data = { conversationId, unreadCount: 0, totalUnreadCount };
    this.events.emitChatUnreadUpdate(userId, data);
    return { ok: true, ...data };
  }

  @SubscribeMessage("notification:read")
  async handleNotificationRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { notificationId?: string } | undefined,
  ) {
    const userId = this.requireUserId(client);
    const notificationId = payload?.notificationId?.trim();
    if (!notificationId) {
      throw new WsException("notificationId is required");
    }

    const result = await this.notificationRepo.markAsRead(notificationId, userId);
    if (result.count === 0) {
      throw new WsException("NotFound");
    }

    const unreadCount = await this.getNotificationUnreadCountOrNull(userId);
    const data = { unreadCount };
    this.events.emitNotificationUnreadUpdate(userId, data);
    return { ok: true, ...data };
  }

  @SubscribeMessage("notification:read-all")
  async handleNotificationReadAll(@ConnectedSocket() client: AuthenticatedSocket) {
    const userId = this.requireUserId(client);
    await this.notificationRepo.markAllAsRead(userId);
    const data = { unreadCount: 0 };
    this.events.emitNotificationUnreadUpdate(userId, data);
    return { ok: true, ...data };
  }

  private requireUserId(client: AuthenticatedSocket) {
    const userId = client.data.user?.userId;
    if (!userId) {
      throw new WsException("Unauthorized");
    }
    return userId;
  }

  private requireConversationId(payload: { conversationId?: string } | undefined) {
    const conversationId = payload?.conversationId?.trim();
    if (!conversationId) {
      throw new WsException("conversationId is required");
    }
    return conversationId;
  }

  private async assertParticipant(conversationId: string, userId: string) {
    const isParticipant = await this.conversationsRepo.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new WsException("Forbidden");
    }
  }

  private async getConversationOrThrow(conversationId: string) {
    const conversation = await this.conversationsRepo.findById(conversationId);
    if (!conversation) {
      throw new WsException("NotFound");
    }
    return conversation;
  }

  private async assertDirectMessageBlockBoundary(
    conversation: Awaited<ReturnType<ConversationsRepository["findById"]>>,
    userId: string,
  ) {
    if (!conversation || conversation.type !== "DIRECT") {
      return;
    }

    const otherParticipant = conversation.participants.find(
      (participant: RealtimeConversation["participants"][number]) => participant.userId !== userId,
    );
    if (!otherParticipant) {
      return;
    }

    const blocked = await this.blockRepo.isBlocked(userId, otherParticipant.userId);
    if (blocked) {
      throw new WsException("Blocked");
    }
  }

  private async getTotalUnreadCountOrNull(userId: string) {
    try {
      return await this.conversationsRepo.getTotalUnreadCount(userId);
    } catch {
      return null;
    }
  }

  private async getNotificationUnreadCountOrNull(userId: string) {
    try {
      return await this.notificationRepo.countUnread(userId);
    } catch {
      return null;
    }
  }

  private async authenticateClient(client: AuthenticatedSocket): Promise<SocketAuthUser> {
    const token = extractAccessTokenFromCookieHeader(client.handshake.headers.cookie);
    if (!token) {
      throw new WsException("Unauthorized");
    }

    const secret = this.configService.getOrThrow<string>("JWT_SECRET");
    const payload = await this.jwtService.verifyAsync<{ sub: string; email?: string }>(token, {
      secret,
    });

    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
