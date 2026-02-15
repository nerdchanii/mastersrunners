import { Controller, Get, Query, Request } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { FeedService } from "./feed.service.js";

@SkipThrottle()
@Controller("feed")
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get("posts")
  getPostFeed(
    @Request() req: { user: { id: string } },
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
  ) {
    const parsedLimit = Math.min(
      Math.max(parseInt(limit || "10", 10) || 10, 1),
      50,
    );
    return this.feedService.getPostFeed(req.user.id, cursor, parsedLimit);
  }

  @Get("workouts")
  getWorkoutFeed(
    @Request() req: { user: { id: string } },
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
    @Query("excludeLinked") excludeLinked?: string,
  ) {
    const parsedLimit = Math.min(
      Math.max(parseInt(limit || "10", 10) || 10, 1),
      50,
    );
    const excludeLinkedToPost = excludeLinked === "true";
    return this.feedService.getWorkoutFeed(
      req.user.id,
      cursor,
      parsedLimit,
      excludeLinkedToPost,
    );
  }
}
