import { Controller, Get, Query, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { Public } from "../common/decorators/public.decorator.js";

import { PostFeedQueryDto } from "./dto/post-feed-query.dto.js";
import { WorkoutFeedQueryDto } from "./dto/workout-feed-query.dto.js";
import { FeedService } from "./feed.service.js";

@ApiTags("Feed")
@Controller("feed")
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @ApiOperation({ summary: "게시글 피드 조회" })
  @ApiResponse({ status: 200, description: "성공" })
  @Public()
  @Get("posts")
  getPostFeed(@Req() req: Request, @Query() query: PostFeedQueryDto) {
    const userId = (req.user as { userId: string } | undefined)?.userId;
    return this.feedService.getPostFeed(userId, query.cursor, query.resolveLimit(10, 50));
  }

  @ApiOperation({ summary: "워크아웃 피드 조회" })
  @ApiResponse({ status: 200, description: "성공" })
  @Public()
  @Get("workouts")
  getWorkoutFeed(@Req() req: Request, @Query() query: WorkoutFeedQueryDto) {
    const userId = (req.user as { userId: string } | undefined)?.userId;
    return this.feedService.getWorkoutFeed(
      userId,
      query.cursor,
      query.resolveLimit(10, 50),
      query.excludeLinked ?? false,
    );
  }
}
