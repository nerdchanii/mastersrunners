import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module.js";
import { WorkoutTypeRepository } from "./repositories/workout-type.repository.js";
import { WorkoutTypesService } from "./workout-types.service.js";
import { WorkoutTypesController } from "./workout-types.controller.js";

@Module({
  imports: [DatabaseModule],
  controllers: [WorkoutTypesController],
  providers: [WorkoutTypesService, WorkoutTypeRepository],
  exports: [WorkoutTypeRepository],
})
export class WorkoutTypesModule {}
