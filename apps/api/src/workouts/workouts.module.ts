import { Module } from "@nestjs/common";

import { ChallengesModule } from "../challenges/challenges.module.js";
import { FollowModule } from "../follow/follow.module.js";
import { ShoesModule } from "../shoes/shoes.module.js";

import { WorkoutRepository } from "./repositories/workout.repository.js";
import { WorkoutsController } from "./workouts.controller.js";
import { WorkoutsService } from "./workouts.service.js";

@Module({
  imports: [ChallengesModule, FollowModule, ShoesModule],
  controllers: [WorkoutsController],
  providers: [WorkoutsService, WorkoutRepository],
  exports: [WorkoutRepository],
})
export class WorkoutsModule {}
