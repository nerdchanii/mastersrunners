import type { TransactionClient } from "@masters/database";
import { Injectable } from "@nestjs/common";

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

const postWorkoutSelect = {
  id: true,
  title: true,
  distance: true,
  duration: true,
  pace: true,
  date: true,
  elevationGain: true,
  avgHeartRate: true,
  avgCadence: true,
  calories: true,
  workoutType: {
    select: {
      id: true,
      name: true,
      category: true,
    },
  },
  route: {
    select: {
      encodedPolyline: true,
    },
  },
} as const;

@Injectable()
export class PostRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreatePostData) {
    return this.db.prisma.post.create({ data });
  }

  async findById(id: string, currentUserId?: string) {
    const post = await this.db.prisma.post.findFirst({
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
              select: postWorkoutSelect,
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        ...(currentUserId
          ? {
              likes: {
                where: { userId: currentUserId },
                select: { id: true },
                take: 1,
              },
            }
          : {}),
      },
    });

    if (!post || !currentUserId) {
      return post;
    }

    const { likes, ...rest } = post;
    return {
      ...rest,
      isLiked: likes.length > 0,
    };
  }

  async findByUser(userId: string, options?: FindByUserOptions & { currentUserId?: string }) {
    const { cursor, limit = 20 } = options || {};
    const currentUserId = options?.currentUserId;
    const visibilityWhere = !currentUserId
      ? { visibility: "PUBLIC" as const }
      : currentUserId === userId
        ? {}
        : {
            OR: [
              { visibility: "PUBLIC" as const },
              {
                visibility: "FOLLOWERS" as const,
                user: {
                  followers: {
                    some: {
                      followerId: currentUserId,
                      status: "ACCEPTED" as const,
                    },
                  },
                },
              },
            ],
          };

    const posts = await this.db.prisma.post.findMany({
      where: {
        userId,
        deletedAt: null,
        ...visibilityWhere,
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
              select: postWorkoutSelect,
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        ...(currentUserId
          ? {
              likes: {
                where: { userId: currentUserId },
                select: { id: true },
                take: 1,
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    if (!currentUserId) {
      return posts;
    }

    return posts.map((post: (typeof posts)[number]) => {
      const { likes, ...rest } = post;
      return {
        ...rest,
        isLiked: likes.length > 0,
      };
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
              select: postWorkoutSelect,
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
    options: {
      blockedUserIds?: string[];
      cursor?: string;
      limit?: number;
      currentUserId?: string;
    } = {},
  ) {
    const { blockedUserIds = [], cursor, limit = 20, currentUserId } = options;

    const posts = await this.db.prisma.post.findMany({
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
          include: {
            workout: {
              select: postWorkoutSelect,
            },
          },
        },
        _count: { select: { likes: true, comments: true } },
        ...(currentUserId
          ? {
              likes: {
                where: { userId: currentUserId },
                select: { id: true },
                take: 1,
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
    });

    if (!currentUserId) {
      return posts;
    }

    return posts.map((post: (typeof posts)[number]) => {
      const { likes, ...rest } = post;
      return {
        ...rest,
        isLiked: likes.length > 0,
      };
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
    return result.map((r: (typeof result)[number]) => ({ tag: r.tag, count: Number(r.count) }));
  }

  async createWithRelations(postData: CreatePostData, workoutIds?: string[], imageUrls?: string[]) {
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
