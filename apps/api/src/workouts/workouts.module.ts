import { Module } from "@nestjs/common";
import { WorkoutsController } from "./workouts.controller.js";
import { WorkoutsService } from "./workouts.service.js";
import { WorkoutRepository } from "./repositories/workout.repository.js";

@Module({
  controllers: [WorkoutsController],
  providers: [WorkoutsService, WorkoutRepository],
  exports: [WorkoutRepository],
})
export class WorkoutsModule {}
