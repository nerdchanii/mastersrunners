import { Injectable, NotFoundException, ForbiddenException, ConflictException, Optional } from "@nestjs/common";
import { PostSocialRepository } from "./repositories/post-social.repository.js";
import { BlockRepository } from "../block/repositories/block.repository.js";
import { NotificationsService } from "../notifications/notifications.service.js";

@Injectable()
export class PostSocialService {
  constructor(
    private readonly postSocialRepo: PostSocialRepository,
    private readonly blockRepo: BlockRepository,
    @Optional() private readonly notificationsService?: NotificationsService,
  ) {}

  async likePost(userId: string, postId: string) {
    try {
      const like = await this.postSocialRepo.likePost(userId, postId);

      // 알림 발행 (비차단, 자기 자신 제외)
      if (this.notificationsService) {
        const post = await this.postSocialRepo.findPostById(postId);
        if (post && post.userId !== userId) {
          this.notificationsService.createNotification({
            userId: post.userId,
            actorId: userId,
            type: "LIKE",
            referenceType: "POST",
            referenceId: postId,
            message: "회원님의 게시글을 좋아합니다.",
          }).catch(() => {});
        }
      }

      return like;
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
    const comment = await this.postSocialRepo.addComment({
      userId,
      postId,
      content,
      parentId: parentId || null,
      mentionedUserId: mentionedUserId || null,
    });

    // 알림 발행 (비차단)
    if (this.notificationsService) {
      const post = await this.postSocialRepo.findPostById(postId);
      if (post && post.userId !== userId) {
        this.notificationsService.createNotification({
          userId: post.userId,
          actorId: userId,
          type: parentId ? "COMMENT_REPLY" : "COMMENT",
          referenceType: "POST",
          referenceId: postId,
          message: parentId ? "회원님의 댓글에 답글을 달았습니다." : "회원님의 게시글에 댓글을 달았습니다.",
        }).catch(() => {});
      }
    }

    return comment;
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

  async getComments(postId: string, currentUserId?: string, cursor?: string, limit?: number) {
    const excludeUserIds = currentUserId
      ? await this.blockRepo.getBlockedUserIds(currentUserId)
      : [];
    return this.postSocialRepo.getComments(postId, cursor, limit, excludeUserIds);
  }
}
