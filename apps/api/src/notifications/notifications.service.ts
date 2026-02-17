import { Injectable, NotFoundException } from "@nestjs/common";
import { NotificationRepository, type CreateNotificationData } from "./repositories/notification.repository.js";
import { NotificationsSseService } from "./notifications-sse.service.js";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly repo: NotificationRepository,
    private readonly sseService: NotificationsSseService,
  ) {}

  /**
   * 알림을 생성하고, SSE 연결이 있는 경우 실시간 전송합니다.
   */
  async createNotification(data: CreateNotificationData) {
    const notification = await this.repo.create(data);

    // SSE 실시간 전송 (비차단)
    this.sseService.sendToUser(data.userId, notification);

    return notification;
  }

  async getNotifications(
    userId: string,
    options?: { cursor?: string; limit?: number; unreadOnly?: boolean },
  ) {
    return this.repo.findByUser(userId, options);
  }

  async markAsRead(id: string, userId: string) {
    const result = await this.repo.markAsRead(id, userId);
    if (result.count === 0) {
      throw new NotFoundException("알림을 찾을 수 없습니다.");
    }
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.repo.markAllAsRead(userId);
    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const count = await this.repo.countUnread(userId);
    return { count };
  }
}
