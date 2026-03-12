import { Module } from "@nestjs/common";

import { BlockModule } from "../block/block.module.js";
import { NotificationsModule } from "../notifications/notifications.module.js";

import { FollowRepository } from "./repositories/follow.repository.js";
import { FollowController } from "./follow.controller.js";
import { FollowService } from "./follow.service.js";

@Module({
  imports: [BlockModule, NotificationsModule],
  controllers: [FollowController],
  providers: [FollowService, FollowRepository],
  exports: [FollowRepository],
})
export class FollowModule {}
