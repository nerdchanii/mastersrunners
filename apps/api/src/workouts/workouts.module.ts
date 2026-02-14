import { Module } from "@nestjs/common";
import { WorkoutsController } from "./workouts.controller.js";
import { WorkoutsService } from "./workouts.service.js";

@Module({
  controllers: [WorkoutsController],
  providers: [WorkoutsService],
})
export class WorkoutsModule {}
