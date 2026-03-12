import { Module } from "@nestjs/common";

import { BlockModule } from "../block/block.module.js";
import { DatabaseModule } from "../database/database.module.js";

import { FeedRepository } from "./repositories/feed.repository.js";
import { FeedController } from "./feed.controller.js";
import { FeedService } from "./feed.service.js";

@Module({
  imports: [DatabaseModule, BlockModule],
  controllers: [FeedController],
  providers: [FeedService, FeedRepository],
})
export class FeedModule {}
