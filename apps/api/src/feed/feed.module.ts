import { Module } from "@nestjs/common";
import { FeedController } from "./feed.controller.js";
import { FeedService } from "./feed.service.js";
import { FeedRepository } from "./repositories/feed.repository.js";
import { DatabaseModule } from "../database/database.module.js";

@Module({
  imports: [DatabaseModule],
  controllers: [FeedController],
  providers: [FeedService, FeedRepository],
})
export class FeedModule {}
