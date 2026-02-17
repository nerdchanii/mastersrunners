import { Controller, Get, Query, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import type { Request } from "express";
import { FeedService } from "./feed.service.js";

@ApiTags("Feed")
@Controller("feed")
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @ApiOperation({ summary: '게시글 피드 조회' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get("posts")
  getPostFeed(
    @Req() req: Request,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
  ) {
    const { userId } = req.user as { userId: string };
    const parsedLimit = Math.min(
      Math.max(parseInt(limit || "10", 10) || 10, 1),
      50,
    );
    return this.feedService.getPostFeed(userId, cursor, parsedLimit);
  }

  @ApiOperation({ summary: '워크아웃 피드 조회' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get("workouts")
  getWorkoutFeed(
    @Req() req: Request,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
    @Query("excludeLinked") excludeLinked?: string,
  ) {
    const { userId } = req.user as { userId: string };
    const parsedLimit = Math.min(
      Math.max(parseInt(limit || "10", 10) || 10, 1),
      50,
    );
    const excludeLinkedToPost = excludeLinked === "true";
    return this.feedService.getWorkoutFeed(
      userId,
      cursor,
      parsedLimit,
      excludeLinkedToPost,
    );
  }
}
