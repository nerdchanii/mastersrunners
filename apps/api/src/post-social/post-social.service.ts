import { Injectable, NotFoundException, ForbiddenException, ConflictException } from "@nestjs/common";
import { PostSocialRepository } from "./repositories/post-social.repository.js";

@Injectable()
export class PostSocialService {
  constructor(private readonly postSocialRepo: PostSocialRepository) {}

  async likePost(userId: string, postId: string) {
    try {
      return await this.postSocialRepo.likePost(userId, postId);
    } catch (error: any) {
      if (error?.code === "P2002") {
        throw new ConflictException("이미 좋아요한 게시글입니다.");
      }
      throw error;
    }
  }

  async unlikePost(userId: string, postId: string) {
    try {
      return await this.postSocialRepo.unlikePost(userId, postId);
    } catch (error: any) {
      if (error?.code === "P2025") {
        throw new NotFoundException("좋아요 기록을 찾을 수 없습니다.");
      }
      throw error;
    }
  }

  async isLiked(userId: string, postId: string) {
    return this.postSocialRepo.isLiked(userId, postId);
  }

  async getLikeCount(postId: string) {
    return this.postSocialRepo.getLikeCount(postId);
  }

  async addComment(userId: string, postId: string, content: string, parentId?: string, mentionedUserId?: string) {
    return this.postSocialRepo.addComment({
      userId,
      postId,
      content,
      parentId: parentId || null,
      mentionedUserId: mentionedUserId || null,
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.postSocialRepo.findCommentById(commentId);
    if (!comment) {
      throw new NotFoundException("댓글을 찾을 수 없습니다.");
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException("본인의 댓글만 삭제할 수 있습니다.");
    }
    if (comment.deletedAt) {
      throw new ConflictException("이미 삭제된 댓글입니다.");
    }
    return this.postSocialRepo.deleteComment(commentId);
  }

  async getComments(postId: string, cursor?: string, limit?: number) {
    return this.postSocialRepo.getComments(postId, cursor, limit);
  }
}
