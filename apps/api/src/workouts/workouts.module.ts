import { Module } from "@nestjs/common";

import { ChallengesModule } from "../challenges/challenges.module.js";
import { StructuredLoggerService } from "../common/logging/structured-logger.service.js";
import { MonitoringService } from "../common/monitoring/monitoring.service.js";
import { FollowModule } from "../follow/follow.module.js";
import { ShoesModule } from "../shoes/shoes.module.js";
import { UploadsModule } from "../uploads/uploads.module.js";

import { WorkoutRepository } from "./repositories/workout.repository.js";
import { WorkoutsController } from "./workouts.controller.js";
import { WorkoutsService } from "./workouts.service.js";

@Module({
  imports: [ChallengesModule, FollowModule, ShoesModule, UploadsModule],
  controllers: [WorkoutsController],
  providers: [WorkoutsService, WorkoutRepository, StructuredLoggerService, MonitoringService],
  exports: [WorkoutRepository],
})
export class WorkoutsModule {}
