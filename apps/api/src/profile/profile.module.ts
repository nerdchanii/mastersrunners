import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module.js";
import { BlockModule } from "../block/block.module.js";
import { DatabaseModule } from "../database/database.module.js";
import { FollowModule } from "../follow/follow.module.js";
import { WorkoutsModule } from "../workouts/workouts.module.js";

import { ProfileController } from "./profile.controller.js";
import { ProfileService } from "./profile.service.js";

@Module({
  imports: [AuthModule, WorkoutsModule, BlockModule, FollowModule, DatabaseModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
