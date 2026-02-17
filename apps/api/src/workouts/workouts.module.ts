import { Module } from "@nestjs/common";
import { WorkoutsController } from "./workouts.controller.js";
import { WorkoutsService } from "./workouts.service.js";
import { WorkoutRepository } from "./repositories/workout.repository.js";
import { ChallengesModule } from "../challenges/challenges.module.js";
import { FollowModule } from "../follow/follow.module.js";

@Module({
  imports: [ChallengesModule, FollowModule],
  controllers: [WorkoutsController],
  providers: [WorkoutsService, WorkoutRepository],
  exports: [WorkoutRepository],
})
export class WorkoutsModule {}
