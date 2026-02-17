import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../common/decorators/public.decorator.js";
import { WorkoutTypesService } from "./workout-types.service.js";

@ApiTags("Workout Types")
@Controller("workout-types")
@Public()
export class WorkoutTypesController {
  constructor(private readonly workoutTypesService: WorkoutTypesService) {}

  @Get()
  async findAll() {
    return this.workoutTypesService.findAll();
  }

  @Get(":category")
  async findByCategory(@Param("category") category: string) {
    return this.workoutTypesService.findByCategory(category);
  }
}
