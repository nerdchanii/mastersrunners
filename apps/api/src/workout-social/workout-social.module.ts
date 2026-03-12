import { Module } from "@nestjs/common";

import { BlockModule } from "../block/block.module.js";
import { WorkoutsModule } from "../workouts/workouts.module.js";

import { WorkoutSocialRepository } from "./repositories/workout-social.repository.js";
import { WorkoutSocialController } from "./workout-social.controller.js";
import { WorkoutSocialService } from "./workout-social.service.js";

@Module({
  imports: [BlockModule, WorkoutsModule],
  controllers: [WorkoutSocialController],
  providers: [WorkoutSocialService, WorkoutSocialRepository],
  exports: [WorkoutSocialRepository],
})
export class WorkoutSocialModule {}
