import { Module } from "@nestjs/common";
import { FeedController } from "./feed.controller.js";
import { FeedService } from "./feed.service.js";
import { WorkoutsModule } from "../workouts/workouts.module.js";

@Module({
  imports: [WorkoutsModule],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
