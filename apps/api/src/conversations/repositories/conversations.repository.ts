import { Injectable } from "@nestjs/common";
import type { TransactionClient } from "@masters/database";
import { DatabaseService } from "../../database/database.service.js";

@Injectable()
export class ConversationsRepository {
  constructor(private readonly db: DatabaseService) {}

  async findOrCreateDirect(userId1: string, userId2: string) {
    // Check if conversation already exists.
    // Use some+some to filter candidates, then verify exactly 2 participants
    // in application code (Prisma does not support _count in where clauses).
    const candidates = await this.db.prisma.conversation.findMany({
      where: {
        type: "DIRECT",
        AND: [
          { participants: { some: { userId: userId1 } } },
          { participants: { some: { userId: userId2 } } },
        ],
      },
      include: {
        participants: {
          select: { userId: true },
        },
      },
    });

    const existing = candidates.find((c) => c.participants.length === 2) ?? null;

    if (existing) {
      return existing;
    }

    // Create new conversation with both participants
    return this.db.prisma.conversation.create({
      data: {
        type: "DIRECT",
        participants: {
          create: [{ userId: userId1 }, { userId: userId2 }],
        },
      },
    });
  }

  async findByUserId(userId: string, cursor?: string, limit: number = 20) {
    return this.db.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
        },
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });
  }

  async findById(conversationId: string) {
    return this.db.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });
  }

  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const participant = await this.db.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });
    return !!participant;
  }

  async getMessages(conversationId: string, cursor?: string, limit: number = 20) {
    return this.db.prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });
  }

  async createMessage(conversationId: string, senderId: string, content: string) {
    return this.db.prisma.$transaction(async (tx: TransactionClient) => {
      const message = await tx.message.create({
        data: {
          conversationId,
          senderId,
          content,
        },
      });

      // Update conversation updatedAt
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return message;
    });
  }

  async updateLastRead(conversationId: string, userId: string) {
    return this.db.prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });
  }

  async deleteMessage(messageId: string) {
    return this.db.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });
  }

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    const participant = await this.db.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant) {
      return 0;
    }

    return this.db.prisma.message.count({
      where: {
        conversationId,
        senderId: { not: userId },
        deletedAt: null,
        createdAt: {
          gt: participant.lastReadAt || new Date(0),
        },
      },
    });
  }

  async getMessageById(messageId: string) {
    return this.db.prisma.message.findUnique({
      where: { id: messageId },
    });
  }
}
