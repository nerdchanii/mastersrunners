import { Controller, Get, Query } from "@nestjs/common";
import { Public } from "../common/decorators/public.decorator.js";
import { FeedService } from "./feed.service.js";

@Controller("feed")
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Public()
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
