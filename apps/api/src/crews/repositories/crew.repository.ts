import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

interface CreateCrewData {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  creatorId: string;
  isPublic?: boolean;
  maxMembers?: number | null;
}

interface UpdateCrewData {
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  isPublic?: boolean;
  maxMembers?: number | null;
}

interface FindAllOptions {
  isPublic?: boolean;
  cursor?: string;
  limit?: number;
}

@Injectable()
export class CrewRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateCrewData) {
    return this.db.prisma.crew.create({ data });
  }

  async findById(id: string) {
    return this.db.prisma.crew.findUnique({
      where: { id, deletedAt: null },
      include: {
        members: {
          where: { status: "ACTIVE" },
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
        tags: true,
        creator: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        _count: {
          select: {
            members: { where: { status: "ACTIVE" } },
          },
        },
      },
    });
  }

  async findAll(options: FindAllOptions) {
    const { isPublic, cursor, limit = 20 } = options;
    const where: { isPublic?: boolean; deletedAt: null } = { deletedAt: null };
    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    const items = await this.db.prisma.crew.findMany({
      where,
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            members: { where: { status: "ACTIVE" } },
          },
        },
        creator: {
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

    return { data, nextCursor };
  }

  async findByUser(userId: string) {
    return this.db.prisma.crew.findMany({
      where: {
        deletedAt: null,
        members: {
          some: { userId, status: "ACTIVE" },
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            members: { where: { status: "ACTIVE" } },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateCrewData) {
    return this.db.prisma.crew.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return this.db.prisma.crew.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
