import { Controller, Get, Post, Patch, Param, Body, Req, ForbiddenException, NotFoundException } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";
import { WorkoutsService } from "./workouts.service.js";
import { CreateWorkoutDto } from "./dto/create-workout.dto.js";
import { UpdateWorkoutDto } from "./dto/update-workout.dto.js";
import { Public } from "../common/decorators/public.decorator.js";

@SkipThrottle()
@Controller("workouts")
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Get()
  findAll(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.workoutsService.findAll(userId);
  }

  @Post()
  create(@Req() req: Request, @Body() dto: CreateWorkoutDto) {
    const { userId } = req.user as { userId: string };
    return this.workoutsService.create(userId, dto);
  }

  @Public()
  @Get(":id")
  async findOne(@Param("id") id: string, @Req() req: Request) {
    const workout = await this.workoutsService.findOne(id);
    if (!workout) throw new NotFoundException("워크아웃을 찾을 수 없습니다.");

    const user = req.user as { userId: string } | undefined;
    if (!workout.isPublic && workout.userId !== user?.userId) {
      throw new ForbiddenException("접근 권한이 없습니다.");
    }
    return workout;
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Req() req: Request, @Body() dto: UpdateWorkoutDto) {
    const { userId } = req.user as { userId: string };
    const workout = await this.workoutsService.findOne(id);
    if (!workout) throw new NotFoundException("워크아웃을 찾을 수 없습니다.");
    if (workout.userId !== userId) throw new ForbiddenException("본인의 기록만 수정할 수 있습니다.");
    return this.workoutsService.update(id, dto);
  }
}
