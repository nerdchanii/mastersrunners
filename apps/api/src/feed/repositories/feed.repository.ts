import { Injectable } from "@nestjs/common";

import { DatabaseService } from "../../database/database.service.js";

interface FeedOptions {
  userId?: string;
  followingIds: string[];
  cursor?: string;
  limit: number;
}

@Injectable()
export class FeedRepository {
  constructor(private readonly db: DatabaseService) {}

  async getFollowingIds(userId: string): Promise<string[]> {
    const follows = await this.db.prisma.follow.findMany({
      where: {
        followerId: userId,
        status: "ACCEPTED",
      },
      select: {
        followingId: true,
      },
    });

    return follows.map((f: { followingId: string }) => f.followingId);
  }

  async getPostFeed(options: FeedOptions) {
    const { userId, followingIds, cursor, limit } = options;
    const visibilityFilter = userId
      ? [
          { userId },
          {
            userId: { in: followingIds },
            visibility: "PUBLIC" as const,
          },
          {
            userId: { in: followingIds },
            visibility: "FOLLOWERS" as const,
          },
        ]
      : [{ visibility: "PUBLIC" as const }];

    const posts = await this.db.prisma.post.findMany({
      where: {
        deletedAt: null,
        OR: visibilityFilter,
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
          select: {
            id: true,
            imageUrl: true,
            sortOrder: true,
          },
        },
        workouts: {
          include: {
            workout: {
              select: {
                id: true,
                title: true,
                distance: true,
                duration: true,
                pace: true,
                date: true,
                encodedPolyline: true,
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
        likes: userId
          ? {
              where: { userId },
              select: { id: true },
              take: 1,
            }
          : false,
      },
      orderBy: { createdAt: "desc" },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      take: limit + 1,
    });

    return posts;
  }

  async getWorkoutFeed(options: FeedOptions & { excludeLinkedToPost?: boolean }) {
    const { userId, followingIds, cursor, limit, excludeLinkedToPost } = options;
    const visibilityFilter = userId
      ? [
          { userId },
          {
            userId: { in: followingIds },
            visibility: "PUBLIC" as const,
          },
          {
            userId: { in: followingIds },
            visibility: "FOLLOWERS" as const,
          },
        ]
      : [{ visibility: "PUBLIC" as const }];

    const workouts = await this.db.prisma.workout.findMany({
      where: {
        deletedAt: null,
        ...(excludeLinkedToPost ? { postWorkouts: { none: {} } } : {}),
        OR: visibilityFilter,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        workoutType: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        _count: {
          select: {
            workoutLikes: true,
            workoutComments: true,
          },
        },
        workoutLikes: userId
          ? {
              where: { userId },
              select: { id: true },
              take: 1,
            }
          : false,
      },
      orderBy: { createdAt: "desc" },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      take: limit + 1,
    });

    return workouts;
  }
}
