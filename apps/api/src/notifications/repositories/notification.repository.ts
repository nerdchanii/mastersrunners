import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

export interface CreateNotificationData {
  userId: string;
  actorId?: string;
  type: string;
  referenceType: string;
  referenceId: string;
  message: string;
}

@Injectable()
export class NotificationRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateNotificationData) {
    return this.db.prisma.notification.create({
      data,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });
  }

  async findByUser(
    userId: string,
    options?: { cursor?: string; limit?: number; unreadOnly?: boolean },
  ) {
    const limit = options?.limit ?? 20;
    const where: Record<string, unknown> = { userId };
    if (options?.unreadOnly) {
      where.isRead = false;
    }

    const items = await this.db.prisma.notification.findMany({
      where,
      take: limit + 1,
      ...(options?.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, nextCursor, hasMore };
  }

  async markAsRead(id: string, userId: string) {
    return this.db.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.db.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async countUnread(userId: string) {
    return this.db.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
