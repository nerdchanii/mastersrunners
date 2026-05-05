import { Body, Controller, Delete, Get, Param, Post, Query, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { CursorLimitQueryDto } from "../common/dto/cursor-limit-query.dto.js";

import { CreateWorkoutCommentDto } from "./dto/create-workout-comment.dto.js";
import { WorkoutSocialService } from "./workout-social.service.js";

@ApiTags("Workout Social")
@Controller("workouts")
export class WorkoutSocialController {
  constructor(private readonly service: WorkoutSocialService) {}

  @Post(":workoutId/like")
  async likeWorkout(@Param("workoutId") workoutId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.service.likeWorkout(userId, workoutId);
  }

  @Delete(":workoutId/like")
  async unlikeWorkout(@Param("workoutId") workoutId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.service.unlikeWorkout(userId, workoutId);
  }

  @Get(":workoutId/like")
  async checkLike(@Param("workoutId") workoutId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    const isLiked = await this.service.isLiked(userId, workoutId);
    return { isLiked };
  }

  @Post(":workoutId/comments")
  async addComment(
    @Param("workoutId") workoutId: string,
    @Req() req: Request,
    @Body() dto: CreateWorkoutCommentDto,
  ) {
    const { userId } = req.user as { userId: string };
    return this.service.addComment(userId, workoutId, dto);
  }

  @Get(":workoutId/comments")
  async getComments(
    @Param("workoutId") workoutId: string,
    @Req() req: Request,
    @Query() query: CursorLimitQueryDto,
  ) {
    const { userId } = req.user as { userId: string };
    return this.service.getComments(workoutId, userId, query.cursor, query.resolveOptionalLimit());
  }

  @Delete(":workoutId/comments/:commentId")
  async deleteComment(@Param("commentId") commentId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.service.deleteComment(commentId, userId);
  }
}
