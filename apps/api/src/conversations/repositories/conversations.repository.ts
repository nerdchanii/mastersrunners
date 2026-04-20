import type { Prisma, TransactionClient } from "@masters/database";
import { Injectable } from "@nestjs/common";

import { DatabaseService } from "../../database/database.service.js";

interface ConversationCrewContext {
  id: string;
  name: string;
  imageUrl: string | null;
}

interface ConversationActivityContext {
  id: string;
  title: string;
  crewId: string;
  crew: ConversationCrewContext | null;
}

type ConversationWithContext<
  TConversation extends { id: string; activityId: string | null; crewId: string | null },
> = TConversation & {
  activity: ConversationActivityContext | null;
  crew: ConversationCrewContext | null;
};

type ConversationSummaryRecord = ConversationWithContext<
  Prisma.ConversationGetPayload<{
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true;
              name: true;
              profileImage: true;
            };
          };
        };
      };
      messages: {
        where: { deletedAt: null };
        orderBy: { createdAt: "desc" };
        take: 1;
      };
    };
  }>
>;

type ConversationDetailRecord = ConversationWithContext<
  Prisma.ConversationGetPayload<{
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true;
              name: true;
              profileImage: true;
            };
          };
        };
      };
    };
  }>
>;

type ConversationMessageRecord = Prisma.MessageGetPayload<{
  include: {
    sender: {
      select: {
        id: true;
        name: true;
        profileImage: true;
      };
    };
  };
}>;

interface ConversationWindowOptions {
  cursor?: string;
  direction?: "older" | "newer";
  entry?: "latest" | "unread";
  historyLimit?: number;
  unreadLimit?: number;
  limit?: number;
}

interface ConversationWindowRecord {
  messages: ConversationMessageRecord[];
  olderCursor: string | null;
  newerCursor: string | null;
  firstUnreadMessageId: string | null;
}

@Injectable()
export class ConversationsRepository {
  constructor(private readonly db: DatabaseService) {}

  private async attachConversationContext<
    TConversation extends { id: string; activityId: string | null; crewId: string | null },
  >(conversations: TConversation[]): Promise<Array<ConversationWithContext<TConversation>>> {
    if (conversations.length === 0) {
      return conversations.map(
        (conversation): ConversationWithContext<TConversation> => ({
          ...conversation,
          activity: null,
          crew: null,
        }),
      );
    }

    const crewIds = Array.from(
      new Set(
        conversations
          .map((conversation) => conversation.crewId)
          .filter((crewId): crewId is string => Boolean(crewId)),
      ),
    );
    const activityIds = Array.from(
      new Set(
        conversations
          .map((conversation) => conversation.activityId)
          .filter((activityId): activityId is string => Boolean(activityId)),
      ),
    );

    const crews: ConversationCrewContext[] =
      crewIds.length === 0
        ? []
        : await this.db.prisma.crew.findMany({
            where: { id: { in: crewIds } },
            select: { id: true, name: true, imageUrl: true },
          });
    const activities: ConversationActivityContext[] =
      activityIds.length === 0
        ? []
        : await this.db.prisma.crewActivity.findMany({
            where: { id: { in: activityIds } },
            select: {
              id: true,
              title: true,
              crewId: true,
              crew: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                },
              },
            },
          });

    const crewMap = new Map(crews.map((crew: ConversationCrewContext) => [crew.id, crew] as const));
    const activityMap = new Map(
      activities.map((activity: ConversationActivityContext) => [activity.id, activity] as const),
    );

    return conversations.map((conversation): ConversationWithContext<TConversation> => {
      const activity =
        conversation.activityId === null
          ? null
          : (activityMap.get(conversation.activityId) ?? null);
      const crewFromConversation =
        conversation.crewId === null ? null : (crewMap.get(conversation.crewId) ?? null);

      return {
        ...conversation,
        activity,
        crew: crewFromConversation ?? activity?.crew ?? null,
      };
    });
  }

  async findOrCreateDirect(userId1: string, userId2: string) {
    return this.db.prisma.$transaction(async (tx: TransactionClient) => {
      // Check if conversation already exists.
      // Use some+some to filter candidates, then verify exactly 2 participants
      // in application code (Prisma does not support _count in where clauses).
      const candidates = await tx.conversation.findMany({
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

      const existing =
        candidates.find((c: (typeof candidates)[number]) => c.participants.length === 2) ?? null;

      if (existing) {
        return existing;
      }

      // Create new conversation with both participants
      return tx.conversation.create({
        data: {
          type: "DIRECT",
          participants: {
            create: [{ userId: userId1 }, { userId: userId2 }],
          },
        },
      });
    });
  }

  async findByUserId(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<ConversationSummaryRecord[]> {
    const conversations = await this.db.prisma.conversation.findMany({
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

    return this.attachConversationContext(conversations);
  }

  async findById(conversationId: string): Promise<ConversationDetailRecord | null> {
    const conversation = await this.db.prisma.conversation.findUnique({
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

    if (!conversation) {
      return null;
    }

    const [conversationWithContext] = await this.attachConversationContext([conversation]);
    return conversationWithContext ?? null;
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

  async getMessages(
    conversationId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<ConversationMessageRecord[]> {
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

  async getConversationWindow(
    conversationId: string,
    userId: string,
    options: ConversationWindowOptions = {},
  ): Promise<ConversationWindowRecord> {
    const direction = options.direction;
    if (direction === "older" || direction === "newer") {
      return this.getDirectionalWindow(conversationId, userId, {
        direction,
        cursor: options.cursor,
        limit: options.limit ?? 40,
      });
    }

    return this.getInitialWindow(conversationId, userId, {
      entry: options.entry ?? "unread",
      historyLimit: options.historyLimit ?? 40,
      unreadLimit: options.unreadLimit ?? 100,
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
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
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

  async getTotalUnreadCount(userId: string): Promise<number> {
    const rows = await this.db.prisma.$queryRaw<Array<{ count: bigint | number }>>`
      SELECT COUNT(m.id) AS count
      FROM "ConversationParticipant" cp
      JOIN "Message" m ON m."conversationId" = cp."conversationId"
      WHERE cp."userId" = ${userId}
        AND m."deletedAt" IS NULL
        AND m."senderId" <> ${userId}
        AND m."createdAt" > COALESCE(cp."lastReadAt", to_timestamp(0))
    `;

    const value = rows[0]?.count ?? 0;
    return typeof value === "bigint" ? Number(value) : value;
  }

  async getMessageById(messageId: string) {
    return this.db.prisma.message.findUnique({
      where: { id: messageId },
    });
  }

  private async getInitialWindow(
    conversationId: string,
    userId: string,
    options: { entry: "latest" | "unread"; historyLimit: number; unreadLimit: number },
  ): Promise<ConversationWindowRecord> {
    const participant = await this.db.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    const firstUnreadMessage =
      options.entry === "unread"
        ? await this.db.prisma.message.findFirst({
            where: {
              conversationId,
              deletedAt: null,
              senderId: { not: userId },
              createdAt: {
                gt: participant?.lastReadAt ?? new Date(0),
              },
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
            orderBy: { createdAt: "asc" },
          })
        : null;

    if (!firstUnreadMessage) {
      const latestRows = await this.db.prisma.message.findMany({
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
        take: options.historyLimit + 1,
      });

      const hasOlder = latestRows.length > options.historyLimit;
      const items = hasOlder ? latestRows.slice(0, options.historyLimit) : latestRows;
      return {
        messages: [...items].reverse(),
        olderCursor: hasOlder ? (items[items.length - 1]?.id ?? null) : null,
        newerCursor: null,
        firstUnreadMessageId: null,
      };
    }

    const historyRows = await this.db.prisma.message.findMany({
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
      take: options.historyLimit + 1,
      skip: 1,
      cursor: { id: firstUnreadMessage.id },
    });

    const unreadRows = await this.db.prisma.message.findMany({
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
      orderBy: { createdAt: "asc" },
      take: options.unreadLimit + 1,
      cursor: { id: firstUnreadMessage.id },
    });

    const hasOlder = historyRows.length > options.historyLimit;
    const hasNewer = unreadRows.length > options.unreadLimit;
    const historyItems = hasOlder ? historyRows.slice(0, options.historyLimit) : historyRows;
    const unreadItems = hasNewer ? unreadRows.slice(0, options.unreadLimit) : unreadRows;

    return {
      messages: [...historyItems].reverse().concat(unreadItems),
      olderCursor: hasOlder ? (historyItems[historyItems.length - 1]?.id ?? null) : null,
      newerCursor: hasNewer ? (unreadItems[unreadItems.length - 1]?.id ?? null) : null,
      firstUnreadMessageId: firstUnreadMessage.id,
    };
  }

  private async getDirectionalWindow(
    conversationId: string,
    userId: string,
    options: { direction: "older" | "newer"; cursor?: string; limit: number },
  ): Promise<ConversationWindowRecord> {
    const firstUnreadMessageId = await this.findFirstUnreadMessageId(conversationId, userId);

    if (!options.cursor) {
      return {
        messages: [],
        olderCursor: null,
        newerCursor: null,
        firstUnreadMessageId,
      };
    }

    const orderBy = { createdAt: options.direction === "older" ? "desc" : "asc" } as const;
    const rows = await this.db.prisma.message.findMany({
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
      orderBy,
      take: options.limit + 1,
      skip: 1,
      cursor: { id: options.cursor },
    });

    const hasMore = rows.length > options.limit;
    const items = hasMore ? rows.slice(0, options.limit) : rows;

    return {
      messages: options.direction === "older" ? [...items].reverse() : items,
      olderCursor:
        options.direction === "older" && hasMore ? (items[items.length - 1]?.id ?? null) : null,
      newerCursor:
        options.direction === "newer" && hasMore ? (items[items.length - 1]?.id ?? null) : null,
      firstUnreadMessageId,
    };
  }

  private async findFirstUnreadMessageId(conversationId: string, userId: string) {
    const participant = await this.db.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    const firstUnread = await this.db.prisma.message.findFirst({
      where: {
        conversationId,
        deletedAt: null,
        senderId: { not: userId },
        createdAt: {
          gt: participant?.lastReadAt ?? new Date(0),
        },
      },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });

    return firstUnread?.id ?? null;
  }

  async createGroupConversation(
    type: "CREW" | "ACTIVITY",
    opts?: { name?: string; crewId?: string; activityId?: string },
  ) {
    return this.db.prisma.conversation.create({
      data: {
        type,
        name: opts?.name,
        crewId: opts?.crewId,
        activityId: opts?.activityId,
      },
    });
  }

  async addParticipant(conversationId: string, userId: string) {
    return this.db.prisma.conversationParticipant.upsert({
      where: { conversationId_userId: { conversationId, userId } },
      update: {},
      create: { conversationId, userId },
    });
  }

  async removeParticipant(conversationId: string, userId: string) {
    return this.db.prisma.conversationParticipant.deleteMany({
      where: { conversationId, userId },
    });
  }

  async findByCrewId(crewId: string) {
    return this.db.prisma.conversation.findFirst({
      where: { type: "CREW", crewId },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, profileImage: true } },
          },
        },
      },
    });
  }

  async findByActivityId(activityId: string) {
    return this.db.prisma.conversation.findFirst({
      where: { type: "ACTIVITY", activityId },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, profileImage: true } },
          },
        },
      },
    });
  }
}
