import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";

@Injectable()
export class RealtimeEventsService {
  private server: Server | null = null;

  bindServer(server: Server) {
    this.server = server;
  }

  emitChatMessage(conversationId: string, participantIds: string[], data: unknown) {
    this.emitToRooms(
      [
        this.getConversationRoom(conversationId),
        ...participantIds.map((participantId) => this.getUserRoom(participantId)),
      ],
      "chat:message",
      data,
    );
  }

  emitChatUnreadUpdate(
    userId: string,
    data: { conversationId: string; unreadCount: number; totalUnreadCount: number | null },
  ) {
    this.server?.to(this.getUserRoom(userId)).emit("chat:unread:update", data);
  }

  emitNotificationNew(userId: string, notification: unknown) {
    this.server?.to(this.getUserRoom(userId)).emit("notification:new", notification);
  }

  emitNotificationUnreadUpdate(userId: string, data: { unreadCount: number | null }) {
    this.server?.to(this.getUserRoom(userId)).emit("notification:unread:update", data);
  }

  getConversationRoom(conversationId: string) {
    return `conversation:${conversationId}`;
  }

  getUserRoom(userId: string) {
    return `user:${userId}`;
  }

  private emitToRooms(rooms: string[], event: string, data: unknown) {
    const uniqueRooms = Array.from(new Set(rooms));
    const [firstRoom, ...restRooms] = uniqueRooms;
    if (!this.server || !firstRoom) {
      return;
    }

    let target = this.server.to(firstRoom);
    for (const room of restRooms) {
      target = target.to(room);
    }
    target.emit(event, data);
  }
}
