import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

interface AddCommentData {
  userId: string;
  postId: string;
  content: string;
  parentId?: string | null;
  mentionedUserId?: string | null;
}

@Injectable()
export class PostSocialRepository {
  constructor(private readonly db: DatabaseService) {}

  // PostLike methods
  async likePost(userId: string, postId: string) {
    return this.db.prisma.postLike.create({
      data: { userId, postId },
    });
  }

  async unlikePost(userId: string, postId: string) {
    return this.db.prisma.postLike.delete({
      where: {
        userId_postId: { userId, postId },
      },
    });
  }

  async isLiked(userId: string, postId: string) {
    const like = await this.db.prisma.postLike.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });
    return !!like;
  }

  async getLikeCount(postId: string) {
    return this.db.prisma.postLike.count({
      where: { postId },
    });
  }

  async getLikers(postId: string, limit = 10) {
    const likes = await this.db.prisma.postLike.findMany({
      where: { postId },
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });
    return likes.map((like) => like.user);
  }

  // PostComment methods
  async addComment(data: AddCommentData) {
    return this.db.prisma.postComment.create({
      data: {
        userId: data.userId,
        postId: data.postId,
        content: data.content,
        parentId: data.parentId || null,
        mentionedUserId: data.mentionedUserId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });
  }

  async deleteComment(commentId: string) {
    return this.db.prisma.postComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
  }

  async getComments(postId: string, cursor?: string, limit = 20) {
    const topLevelComments = await this.db.prisma.postComment.findMany({
      where: {
        postId,
        parentId: null,
        deletedAt: null,
      },
      take: limit,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        replies: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
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

    return topLevelComments;
  }

  async getCommentCount(postId: string) {
    return this.db.prisma.postComment.count({
      where: {
        postId,
        deletedAt: null,
      },
    });
  }

  async findCommentById(commentId: string) {
    return this.db.prisma.postComment.findUnique({
      where: { id: commentId },
    });
  }
}
