import { Injectable, ConflictException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { WorkoutSocialRepository } from "./repositories/workout-social.repository.js";
import type { CreateWorkoutCommentDto } from "./dto/create-workout-comment.dto.js";

@Injectable()
export class WorkoutSocialService {
  constructor(private readonly repo: WorkoutSocialRepository) {}

  async likeWorkout(userId: string, workoutId: string) {
    try {
      return await this.repo.likeWorkout(userId, workoutId);
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new ConflictException("이미 좋아요를 누른 운동입니다.");
      }
      throw error;
    }
  }

  async unlikeWorkout(userId: string, workoutId: string) {
    return this.repo.unlikeWorkout(userId, workoutId);
  }

  async isLiked(userId: string, workoutId: string) {
    return this.repo.isLiked(userId, workoutId);
  }

  async getLikeCount(workoutId: string) {
    return this.repo.getLikeCount(workoutId);
  }

  async addComment(userId: string, workoutId: string, dto: CreateWorkoutCommentDto) {
    return this.repo.addComment({
      userId,
      workoutId,
      content: dto.content,
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.repo.findCommentById(commentId);
    if (!comment) {
      throw new NotFoundException("댓글을 찾을 수 없습니다.");
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException("본인의 댓글만 삭제할 수 있습니다.");
    }
    return this.repo.deleteComment(commentId);
  }

  async getComments(workoutId: string, cursor?: string, limit = 20) {
    return this.repo.getComments(workoutId, cursor, limit);
  }
}
