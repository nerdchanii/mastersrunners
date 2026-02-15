import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

interface CreateCommentData {
  userId: string;
  workoutId: string;
  content: string;
}

@Injectable()
export class WorkoutSocialRepository {
  constructor(private readonly db: DatabaseService) {}

  async likeWorkout(userId: string, workoutId: string) {
    return this.db.prisma.workoutLike.create({
      data: { userId, workoutId },
    });
  }

  async unlikeWorkout(userId: string, workoutId: string) {
    return this.db.prisma.workoutLike.deleteMany({
      where: { userId, workoutId },
    });
  }

  async isLiked(userId: string, workoutId: string) {
    const like = await this.db.prisma.workoutLike.findUnique({
      where: { userId_workoutId: { userId, workoutId } },
    });
    return !!like;
  }

  async getLikeCount(workoutId: string) {
    return this.db.prisma.workoutLike.count({
      where: { workoutId },
    });
  }

  async getLikers(workoutId: string, limit = 10, excludeUserIds: string[] = []) {
    return this.db.prisma.workoutLike.findMany({
      where: {
        workoutId,
        ...(excludeUserIds.length > 0 && { userId: { notIn: excludeUserIds } }),
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async addComment(data: CreateCommentData) {
    return this.db.prisma.workoutComment.create({
      data,
    });
  }

  async deleteComment(commentId: string) {
    return this.db.prisma.workoutComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
  }

  async getComments(workoutId: string, cursor?: string, limit = 20, excludeUserIds: string[] = []) {
    return this.db.prisma.workoutComment.findMany({
      where: {
        workoutId,
        deletedAt: null,
        ...(cursor ? { id: { lt: cursor } } : {}),
        ...(excludeUserIds.length > 0 && { userId: { notIn: excludeUserIds } }),
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async getCommentCount(workoutId: string) {
    return this.db.prisma.workoutComment.count({
      where: {
        workoutId,
        deletedAt: null,
      },
    });
  }

  async findCommentById(commentId: string) {
    return this.db.prisma.workoutComment.findFirst({
      where: {
        id: commentId,
        deletedAt: null,
      },
    });
  }
}
