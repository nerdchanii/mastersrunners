import { Controller, Get, Query, Req } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";
import { FeedService } from "./feed.service.js";

@SkipThrottle()
@Controller("feed")
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

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
