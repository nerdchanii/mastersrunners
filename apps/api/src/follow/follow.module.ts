import { Module } from "@nestjs/common";
import { FollowController } from "./follow.controller.js";
import { FollowService } from "./follow.service.js";
import { FollowRepository } from "./repositories/follow.repository.js";

@Module({
  controllers: [FollowController],
  providers: [FollowService, FollowRepository],
  exports: [FollowRepository],
})
export class FollowModule {}
