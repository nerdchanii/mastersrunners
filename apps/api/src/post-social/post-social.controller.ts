import { Body, Controller, Delete, Get, Param, Post, Query, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { Public } from "../common/decorators/public.decorator.js";
import { CursorLimitQueryDto } from "../common/dto/cursor-limit-query.dto.js";

import { CreatePostCommentDto } from "./dto/create-post-comment.dto.js";
import { PostSocialService } from "./post-social.service.js";

@ApiTags("Post Social")
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
    @Req() req: Request,
  ) {
    const { userId } = req.user as { userId: string };
    return this.postSocialService.addComment(
      userId,
      postId,
      dto.content,
      dto.parentId,
      dto.mentionedUserId,
    );
  }

  @Get(":postId/comments")
  @Public()
  async getComments(
    @Param("postId") postId: string,
    @Req() req: Request,
    @Query() query: CursorLimitQueryDto,
  ) {
    const userId = (req.user as { userId: string } | undefined)?.userId;
    return this.postSocialService.getComments(
      postId,
      userId,
      query.cursor,
      query.resolveOptionalLimit(),
    );
  }

  @Delete(":postId/comments/:commentId")
  async deleteComment(
    @Param("postId") postId: string,
    @Param("commentId") commentId: string,
    @Req() req: Request,
  ) {
    const { userId } = req.user as { userId: string };
    return this.postSocialService.deleteComment(commentId, userId);
  }
}
