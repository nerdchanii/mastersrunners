import { Injectable } from "@nestjs/common";
import type { TransactionClient } from "@masters/database";
import { DatabaseService } from "../../database/database.service.js";

interface CreatePostData {
  userId: string;
  content?: string | null;
  visibility: string;
  hashtags: string[];
}

interface UpdatePostData {
  content?: string;
  visibility?: string;
  hashtags?: string[];
}

interface FindForFeedOptions {
  followingIds: string[];
  cursor?: string;
  limit: number;
}

interface FindByUserOptions {
  cursor?: string;
  limit?: number;
}

@Injectable()
export class PostRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreatePostData) {
    return this.db.prisma.post.create({ data });
  }

  async findById(id: string) {
    return this.db.prisma.post.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
        workouts: {
          include: {
            workout: {
              include: {
                workoutType: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  }

  async findByUser(userId: string, options?: FindByUserOptions) {
    const { cursor, limit = 20 } = options || {};

    return this.db.prisma.post.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
        workouts: {
          include: {
            workout: {
              include: {
                workoutType: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });
  }

  async findForFeed(options: FindForFeedOptions) {
    const { followingIds, cursor, limit } = options;

    return this.db.prisma.post.findMany({
      where: {
        userId: { in: followingIds },
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
        workouts: {
          include: {
            workout: {
              include: {
                workoutType: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });
  }

  async update(id: string, data: UpdatePostData) {
    return this.db.prisma.post.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return this.db.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addWorkouts(postId: string, workoutIds: string[]) {
    return this.db.prisma.postWorkout.createMany({
      data: workoutIds.map((workoutId) => ({
        postId,
        workoutId,
      })),
    });
  }

  async removeWorkout(postId: string, workoutId: string) {
    return this.db.prisma.postWorkout.delete({
      where: {
        postId_workoutId: {
          postId,
          workoutId,
        },
      },
    });
  }

  async addImages(postId: string, imageUrls: string[]) {
    return this.db.prisma.postImage.createMany({
      data: imageUrls.map((imageUrl, index) => ({
        postId,
        imageUrl,
        sortOrder: index,
      })),
    });
  }

  async countByUser(userId: string) {
    return this.db.prisma.post.count({
      where: { userId, deletedAt: null },
    });
  }

  async findByHashtag(
    tag: string,
    options: { blockedUserIds?: string[]; cursor?: string; limit?: number } = {},
  ) {
    const { blockedUserIds = [], cursor, limit = 20 } = options;

    return this.db.prisma.post.findMany({
      where: {
        hashtags: { has: tag },
        deletedAt: null,
        ...(blockedUserIds.length > 0 ? { userId: { notIn: blockedUserIds } } : {}),
      },
      include: {
        user: {
          select: { id: true, name: true, profileImage: true },
        },
        images: { orderBy: { sortOrder: "asc" } },
        workouts: {
          include: { workout: { include: { workoutType: true } } },
        },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
    });
  }

  async getPopularHashtags(limit = 20): Promise<{ tag: string; count: number }[]> {
    // PostgreSQL에서 배열을 unnest하여 집계
    const result = await this.db.prisma.$queryRaw<{ tag: string; count: bigint }[]>`
      SELECT unnested_tag as tag, COUNT(*) as count
      FROM "Post", unnest(hashtags) as unnested_tag
      WHERE "deletedAt" IS NULL
        AND array_length(hashtags, 1) > 0
      GROUP BY unnested_tag
      ORDER BY count DESC
      LIMIT ${limit}
    `;
    return result.map((r) => ({ tag: r.tag, count: Number(r.count) }));
  }

  async createWithRelations(
    postData: CreatePostData,
    workoutIds?: string[],
    imageUrls?: string[],
  ) {
    return this.db.prisma.$transaction(async (tx: TransactionClient) => {
      const post = await tx.post.create({ data: postData });

      if (workoutIds?.length) {
        await tx.postWorkout.createMany({
          data: workoutIds.map((workoutId) => ({
            postId: post.id,
            workoutId,
          })),
        });
      }

      if (imageUrls?.length) {
        await tx.postImage.createMany({
          data: imageUrls.map((imageUrl, index) => ({
            postId: post.id,
            imageUrl,
            sortOrder: index,
          })),
        });
      }

      return post;
    });
  }
}
