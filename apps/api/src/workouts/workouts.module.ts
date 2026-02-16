import { Module } from "@nestjs/common";
import { WorkoutsController } from "./workouts.controller.js";
import { WorkoutsService } from "./workouts.service.js";
import { WorkoutRepository } from "./repositories/workout.repository.js";
import { ChallengesModule } from "../challenges/challenges.module.js";

@Module({
  imports: [ChallengesModule],
  controllers: [WorkoutsController],
  providers: [WorkoutsService, WorkoutRepository],
  exports: [WorkoutRepository],
})
export class WorkoutsModule {}
