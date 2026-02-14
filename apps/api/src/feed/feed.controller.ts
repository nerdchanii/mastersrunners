import { Controller, Get, Query } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { Public } from "../common/decorators/public.decorator.js";
import { FeedService } from "./feed.service.js";

@Controller("feed")
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get()
  getFeed(
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
  ) {
    const parsedLimit = Math.min(
      Math.max(parseInt(limit || "10", 10) || 10, 1),
      50,
    );
    return this.feedService.getFeed(cursor, parsedLimit);
  }
}
