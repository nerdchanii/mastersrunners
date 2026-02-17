import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

interface CreateChallengeData {
  title: string;
  description?: string;
  type: string;
  targetValue: number;
  targetUnit: string;
  startDate: Date;
  endDate: Date;
  creatorId: string;
  crewId?: string;
  isPublic: boolean;
  imageUrl?: string;
}

interface UpdateChallengeData {
  title?: string;
  description?: string;
  type?: string;
  targetValue?: number;
  targetUnit?: string;
  startDate?: Date;
  endDate?: Date;
  isPublic?: boolean;
  imageUrl?: string;
}

interface FindAllOptions {
  isPublic?: boolean;
  crewId?: string;
  cursor?: string;
  limit?: number;
}

@Injectable()
export class ChallengeRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateChallengeData) {
    return this.db.prisma.challenge.create({ data });
  }

  async findById(id: string) {
    return this.db.prisma.challenge.findFirst({
      where: { id, deletedAt: null },
      include: {
        participants: { include: { user: true } },
        teams: true,
        creator: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });
  }

  async findAll(options: FindAllOptions) {
    const where: { isPublic?: boolean; crewId?: string; deletedAt: null } = { deletedAt: null };
    if (options.isPublic !== undefined) where.isPublic = options.isPublic;
    if (options.crewId !== undefined) where.crewId = options.crewId;

    const limit = options.limit || 20;

    const items = await this.db.prisma.challenge.findMany({
      where,
      take: limit + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, nextCursor, hasMore };
  }

  async findByUser(userId: string, options?: { cursor?: string; limit?: number }) {
    const limit = options?.limit || 20;

    const items = await this.db.prisma.challenge.findMany({
      where: { participants: { some: { userId } }, deletedAt: null },
      take: limit + 1,
      ...(options?.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        participants: {
          where: { userId },
          select: { currentValue: true },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, nextCursor, hasMore };
  }

  async update(id: string, data: UpdateChallengeData) {
    return this.db.prisma.challenge.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.db.prisma.challenge.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
