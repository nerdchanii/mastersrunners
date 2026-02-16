import { Controller, Post, Get, Delete, Param, Body, Req, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";
import { WorkoutSocialService } from "./workout-social.service.js";
import { CreateWorkoutCommentDto } from "./dto/create-workout-comment.dto.js";

@ApiTags("Workout Social")
@SkipThrottle()
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
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
  ) {
    const { userId } = req.user as { userId: string };
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.service.getComments(workoutId, userId, cursor, parsedLimit);
  }

  @Delete(":workoutId/comments/:commentId")
  async deleteComment(
    @Param("commentId") commentId: string,
    @Req() req: Request,
  ) {
    const { userId } = req.user as { userId: string };
    return this.service.deleteComment(commentId, userId);
  }
}
