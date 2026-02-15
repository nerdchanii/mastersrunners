import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

@Injectable()
export class FollowRepository {
  constructor(private readonly db: DatabaseService) {}

  async follow(followerId: string, followingId: string, status: string) {
    return this.db.prisma.follow.create({
      data: {
        followerId,
        followingId,
        status,
      },
    });
  }

  async unfollow(followerId: string, followingId: string) {
    return this.db.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  async accept(followerId: string, followingId: string) {
    return this.db.prisma.follow.update({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
      data: {
        status: "ACCEPTED",
      },
    });
  }

  async reject(followerId: string, followingId: string) {
    return this.db.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  async findFollow(followerId: string, followingId: string) {
    return this.db.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  async findFollowers(userId: string, status?: string) {
    return this.db.prisma.follow.findMany({
      where: {
        followingId: userId,
        ...(status ? { status } : {}),
      },
      include: {
        follower: {
          select: {
            id: true,
            email: true,
            name: true,
            profileImage: true,
            isPrivate: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findFollowing(userId: string, status?: string) {
    return this.db.prisma.follow.findMany({
      where: {
        followerId: userId,
        ...(status ? { status } : {}),
      },
      include: {
        following: {
          select: {
            id: true,
            email: true,
            name: true,
            profileImage: true,
            isPrivate: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async countFollowers(userId: string) {
    return this.db.prisma.follow.count({
      where: {
        followingId: userId,
        status: "ACCEPTED",
      },
    });
  }

  async countFollowing(userId: string) {
    return this.db.prisma.follow.count({
      where: {
        followerId: userId,
        status: "ACCEPTED",
      },
    });
  }

  async removeAllBetween(userId1: string, userId2: string) {
    return this.db.prisma.$transaction([
      this.db.prisma.follow.deleteMany({
        where: {
          OR: [
            { followerId: userId1, followingId: userId2 },
            { followerId: userId2, followingId: userId1 },
          ],
        },
      }),
    ]);
  }

  async findUserIsPrivate(userId: string) {
    const user = await this.db.prisma.user.findUnique({
      where: { id: userId },
      select: { isPrivate: true },
    });
    return user?.isPrivate ?? false;
  }
}
