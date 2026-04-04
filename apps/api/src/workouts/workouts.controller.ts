import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { Public } from "../common/decorators/public.decorator.js";
import { FollowRepository } from "../follow/repositories/follow.repository.js";

import { CreateWorkoutDto } from "./dto/create-workout.dto.js";
import { ListWorkoutsQueryDto } from "./dto/list-workouts-query.dto.js";
import { UpdateWorkoutDto } from "./dto/update-workout.dto.js";
import { WorkoutsService } from "./workouts.service.js";

@ApiTags("Workouts")
@Controller("workouts")
export class WorkoutsController {
  constructor(
    private readonly workoutsService: WorkoutsService,
    private readonly followRepo: FollowRepository,
  ) {}

  @ApiOperation({ summary: "내 워크아웃 목록 조회 (cursor 페이지네이션)" })
  @ApiResponse({ status: 200, description: "성공" })
  @Get()
  findAll(@Req() req: Request, @Query() query: ListWorkoutsQueryDto) {
    const { userId } = req.user as { userId: string };
    return this.workoutsService.findAll(
      userId,
      {
        cursor: query.cursor,
        limit: query.resolveOptionalLimit(),
      },
      query.userId,
    );
  }

  @ApiOperation({ summary: "워크아웃 생성" })
  @ApiResponse({ status: 201, description: "생성 성공" })
  @Post()
  create(@Req() req: Request, @Body() dto: CreateWorkoutDto) {
    const { userId } = req.user as { userId: string };
    return this.workoutsService.create(userId, dto);
  }

  @ApiOperation({ summary: "워크아웃 상세 조회" })
  @ApiResponse({ status: 200, description: "성공" })
  @Public()
  @Get(":id")
  async findOne(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as { userId: string } | undefined;
    const requesterId = user?.userId;
    const workout = await this.workoutsService.findOne(id, requesterId);
    if (!workout) throw new NotFoundException("워크아웃을 찾을 수 없습니다.");

    if (workout.visibility === "PRIVATE" && workout.userId !== requesterId) {
      throw new ForbiddenException("접근 권한이 없습니다.");
    }

    if (workout.visibility === "FOLLOWERS" && workout.userId !== requesterId) {
      if (!requesterId) {
        throw new ForbiddenException("접근 권한이 없습니다.");
      }
      const follow = await this.followRepo.findFollow(requesterId, workout.userId);
      if (!follow || follow.status !== "ACCEPTED") {
        throw new ForbiddenException("접근 권한이 없습니다.");
      }
    }

    return workout;
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Req() req: Request, @Body() dto: UpdateWorkoutDto) {
    const { userId } = req.user as { userId: string };
    const workout = await this.workoutsService.findOne(id, userId);
    if (!workout) throw new NotFoundException("워크아웃을 찾을 수 없습니다.");
    if (workout.userId !== userId)
      throw new ForbiddenException("본인의 기록만 수정할 수 있습니다.");
    return this.workoutsService.update(id, dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    const workout = await this.workoutsService.findOne(id, userId);
    if (!workout) throw new NotFoundException("워크아웃을 찾을 수 없습니다.");
    if (workout.userId !== userId)
      throw new ForbiddenException("본인의 기록만 삭제할 수 있습니다.");
    return this.workoutsService.remove(id);
  }
}
