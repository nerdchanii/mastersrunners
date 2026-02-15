import { Module } from "@nestjs/common";
import { WorkoutSocialController } from "./workout-social.controller.js";
import { WorkoutSocialService } from "./workout-social.service.js";
import { WorkoutSocialRepository } from "./repositories/workout-social.repository.js";

@Module({
  controllers: [WorkoutSocialController],
  providers: [WorkoutSocialService, WorkoutSocialRepository],
  exports: [WorkoutSocialRepository],
})
export class WorkoutSocialModule {}
