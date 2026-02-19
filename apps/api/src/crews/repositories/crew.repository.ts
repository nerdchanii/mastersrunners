import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

interface CreateCrewData {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  creatorId: string;
  isPublic?: boolean;
  maxMembers?: number | null;
  location?: string | null;
  region?: string | null;
  subRegion?: string | null;
}

interface UpdateCrewData {
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  isPublic?: boolean;
  maxMembers?: number | null;
  location?: string | null;
  region?: string | null;
  subRegion?: string | null;
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

  async updateChatConversationId(crewId: string, conversationId: string) {
    return this.db.prisma.crew.update({
      where: { id: crewId },
      data: { chatConversationId: conversationId },
    });
  }

  async createCrewPost(data: { userId: string; crewId: string; content: string; visibility?: string }) {
    return this.db.prisma.post.create({
      data: {
        userId: data.userId,
        crewId: data.crewId,
        content: data.content,
        visibility: data.visibility || "PUBLIC",
      },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
        images: true,
        _count: { select: { likes: true, comments: true } },
      },
    });
  }

  async findCrewPosts(crewId: string, cursor?: string, limit = 20) {
    const items = await this.db.prisma.post.findMany({
      where: { crewId, deletedAt: null },
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
        images: true,
        _count: { select: { likes: true, comments: true } },
      },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? data[data.length - 1].id : null;
    return { items: data, nextCursor };
  }

  async getCrewProfile(crewId: string) {
    const crew = await this.db.prisma.crew.findUnique({
      where: { id: crewId, deletedAt: null },
      include: {
        creator: { select: { id: true, name: true, profileImage: true } },
        _count: { select: { members: { where: { status: "ACTIVE" } }, activities: true, boards: true } },
      },
    });

    if (!crew) return null;

    const recentPosts = await this.db.prisma.post.findMany({
      where: { crewId, deletedAt: null },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
        images: true,
        _count: { select: { likes: true, comments: true } },
      },
    });

    const upcomingActivities = await this.db.prisma.crewActivity.findMany({
      where: { crewId, status: "SCHEDULED", activityDate: { gte: new Date() } },
      take: 5,
      orderBy: { activityDate: "asc" },
    });

    return { crew, recentPosts, upcomingActivities };
  }

  async explore(options: { region?: string; subRegion?: string; sort?: string; cursor?: string; limit?: number }) {
    const { region, subRegion, sort = "created", cursor, limit = 20 } = options;
    const where: { isPublic: boolean; deletedAt: null; region?: string; subRegion?: string } = { isPublic: true, deletedAt: null };
    if (region) where.region = region;
    if (subRegion) where.subRegion = subRegion;

    const orderByMembers = { members: { _count: "desc" as const } };
    const orderByCreated = { createdAt: "desc" as const };
    const orderBy = sort === "members" ? orderByMembers : orderByCreated;

    const items = await this.db.prisma.crew.findMany({
      where,
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy,
      include: {
        _count: { select: { members: { where: { status: "ACTIVE" } }, activities: true } },
        creator: { select: { id: true, name: true, profileImage: true } },
      },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? data[data.length - 1].id : null;
    return { items: data, nextCursor };
  }

  async recommend(userRegion?: string | null, userSubRegion?: string | null) {
    const where: { isPublic: boolean; deletedAt: null; region?: string } = { isPublic: true, deletedAt: null };
    if (userRegion) where.region = userRegion;

    const crews = await this.db.prisma.crew.findMany({
      where,
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { members: { where: { status: "ACTIVE" } }, activities: true } },
        creator: { select: { id: true, name: true, profileImage: true } },
      },
    });
    return crews;
  }

  async getRegions() {
    const result = await this.db.prisma.crew.groupBy({
      by: ["region"],
      where: { isPublic: true, deletedAt: null, region: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });
    return result.map(r => ({ region: r.region!, crewCount: r._count.id }));
  }

  async getSubRegions(region: string) {
    const result = await this.db.prisma.crew.groupBy({
      by: ["subRegion"],
      where: { isPublic: true, deletedAt: null, region, subRegion: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });
    return result.map(r => ({ subRegion: r.subRegion!, crewCount: r._count.id }));
  }
}
