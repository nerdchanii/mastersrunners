import { Controller, Get, Param } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { Public } from "../common/decorators/public.decorator.js";
import { WorkoutTypesService } from "./workout-types.service.js";

@Controller("workout-types")
@Public()
@SkipThrottle()
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
