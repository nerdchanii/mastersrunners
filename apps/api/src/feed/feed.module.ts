import { Module } from "@nestjs/common";
import { FeedController } from "./feed.controller.js";
import { FeedService } from "./feed.service.js";

@Module({
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
