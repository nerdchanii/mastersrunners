import { Controller, Post, Delete, Get, Param, Body, Req, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";
import { PostSocialService } from "./post-social.service.js";
import { CreatePostCommentDto } from "./dto/create-post-comment.dto.js";

@ApiTags("Post Social")
@SkipThrottle()
@Controller("posts")
export class PostSocialController {
  constructor(private readonly postSocialService: PostSocialService) {}

  @Post(":postId/like")
  async likePost(@Param("postId") postId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.postSocialService.likePost(userId, postId);
  }

  @Delete(":postId/like")
  async unlikePost(@Param("postId") postId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.postSocialService.unlikePost(userId, postId);
  }

  @Get(":postId/like")
  async isLiked(@Param("postId") postId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    const isLiked = await this.postSocialService.isLiked(userId, postId);
    return { isLiked };
  }

  @Post(":postId/comments")
  async addComment(
    @Param("postId") postId: string,
    @Body() dto: CreatePostCommentDto,
    @Req() req: Request
  ) {
    const { userId } = req.user as { userId: string };
    return this.postSocialService.addComment(
      userId,
      postId,
      dto.content,
      dto.parentId,
      dto.mentionedUserId
    );
  }

  @Get(":postId/comments")
  async getComments(
    @Param("postId") postId: string,
    @Req() req: Request,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string
  ) {
    const { userId } = req.user as { userId: string };
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.postSocialService.getComments(postId, userId, cursor, parsedLimit);
  }

  @Delete(":postId/comments/:commentId")
  async deleteComment(
    @Param("postId") postId: string,
    @Param("commentId") commentId: string,
    @Req() req: Request
  ) {
    const { userId } = req.user as { userId: string };
    return this.postSocialService.deleteComment(commentId, userId);
  }
}
