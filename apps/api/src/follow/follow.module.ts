import { Module } from "@nestjs/common";
import { FollowController } from "./follow.controller.js";
import { FollowService } from "./follow.service.js";
import { FollowRepository } from "./repositories/follow.repository.js";
import { BlockModule } from "../block/block.module.js";
import { NotificationsModule } from "../notifications/notifications.module.js";

@Module({
  imports: [BlockModule, NotificationsModule],
  controllers: [FollowController],
  providers: [FollowService, FollowRepository],
  exports: [FollowRepository],
})
export class FollowModule {}
