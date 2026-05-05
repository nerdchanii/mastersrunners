import { Injectable, NotFoundException } from "@nestjs/common";

import { RealtimeEventsService } from "../realtime/realtime-events.service.js";

import {
  type CreateNotificationData,
  NotificationRepository,
} from "./repositories/notification.repository.js";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly repo: NotificationRepository,
    private readonly realtimeEvents: RealtimeEventsService,
  ) {}

  /**
   * 알림을 생성하고, realtime socket 연결이 있는 경우 실시간 전송합니다.
   */
  async createNotification(data: CreateNotificationData) {
    const notification = await this.repo.create(data);

    this.realtimeEvents.emitNotificationNew(data.userId, notification);
    await this.emitUnreadCountIfAvailable(data.userId);

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
    await this.emitUnreadCountIfAvailable(userId);
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.repo.markAllAsRead(userId);
    this.realtimeEvents.emitNotificationUnreadUpdate(userId, { unreadCount: 0 });
    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const count = await this.repo.countUnread(userId);
    return { count };
  }

  private async emitUnreadCountIfAvailable(userId: string) {
    try {
      const unreadCount = await this.repo.countUnread(userId);
      this.realtimeEvents.emitNotificationUnreadUpdate(userId, { unreadCount });
    } catch {
      // The durable notification write already succeeded; clients can repair the snapshot on reconnect or refetch.
    }
  }
}
