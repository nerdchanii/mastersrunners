import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { extractAccessTokenFromCookieHeader } from "../auth/auth-cookie.util.js";
import { BlockRepository } from "../block/repositories/block.repository.js";

import { ConversationsRepository } from "./repositories/conversations.repository.js";

interface SocketAuthUser {
  userId: string;
  email?: string;
}

type AuthenticatedSocket = Socket & {
  data: {
    user?: SocketAuthUser;
  };
};

@WebSocketGateway({
  namespace: "/conversations",
  path: "/api/v1/socket.io",
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ["websocket"],
})
export class ConversationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly conversationsRepo: ConversationsRepository,
    private readonly blockRepo: BlockRepository,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const user = await this.authenticateClient(client);
      client.data.user = user;
      await client.join(this.getUserRoom(user.userId));
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage("chat:subscribe")
  async handleSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { conversationId?: string } | undefined,
  ) {
    const userId = client.data.user?.userId;
    const conversationId = payload?.conversationId?.trim();

    if (!userId) {
      throw new WsException("Unauthorized");
    }

    if (!conversationId) {
      throw new WsException("conversationId is required");
    }

    const isParticipant = await this.conversationsRepo.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new WsException("Forbidden");
    }

    await client.join(this.getConversationRoom(conversationId));
    return { ok: true, conversationId };
  }

  @SubscribeMessage("chat:unsubscribe")
  async handleUnsubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { conversationId?: string } | undefined,
  ) {
    const conversationId = payload?.conversationId?.trim();
    if (!conversationId) {
      throw new WsException("conversationId is required");
    }

    await client.leave(this.getConversationRoom(conversationId));
    return { ok: true, conversationId };
  }

  @SubscribeMessage("chat:send")
  async handleSend(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { conversationId?: string; content?: string } | undefined,
  ) {
    const userId = client.data.user?.userId;
    const conversationId = payload?.conversationId?.trim();
    const content = payload?.content?.trim();

    if (!userId) {
      throw new WsException("Unauthorized");
    }

    if (!conversationId) {
      throw new WsException("conversationId is required");
    }

    if (!content) {
      throw new WsException("content is required");
    }

    const isParticipant = await this.conversationsRepo.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new WsException("Forbidden");
    }

    const conversation = await this.conversationsRepo.findById(conversationId);
    if (!conversation) {
      throw new WsException("NotFound");
    }

    const otherParticipant =
      conversation.type === "DIRECT"
        ? conversation.participants.find(
            (participant: (typeof conversation.participants)[number]) =>
              participant.userId !== userId,
          )
        : undefined;
    if (otherParticipant) {
      const blocked = await this.blockRepo.isBlocked(userId, otherParticipant.userId);
      if (blocked) {
        throw new WsException("Blocked");
      }
    }

    const message = await this.conversationsRepo.createMessage(conversationId, userId, content);

    this.emitMessage(
      conversationId,
      conversation.participants.map(
        (participant: (typeof conversation.participants)[number]) => participant.userId,
      ),
      message,
    );

    return message;
  }

  emitMessage(conversationId: string, participantIds: string[], data: unknown) {
    const rooms = Array.from(
      new Set([
        this.getConversationRoom(conversationId),
        ...participantIds.map((participantId) => this.getUserRoom(participantId)),
      ]),
    );
    const [firstRoom, ...restRooms] = rooms;

    if (!firstRoom) {
      return;
    }

    let target = this.server.to(firstRoom);
    for (const room of restRooms) {
      target = target.to(room);
    }

    target.emit("chat:message", data);
  }

  getConversationRoom(conversationId: string) {
    return `conversation:${conversationId}`;
  }

  getUserRoom(userId: string) {
    return `user:${userId}`;
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
