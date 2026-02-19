import { Injectable, ConflictException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { WorkoutSocialRepository } from "./repositories/workout-social.repository.js";
import { BlockRepository } from "../block/repositories/block.repository.js";
import { WorkoutRepository } from "../workouts/repositories/workout.repository.js";
import type { CreateWorkoutCommentDto } from "./dto/create-workout-comment.dto.js";

@Injectable()
export class WorkoutSocialService {
  constructor(
    private readonly repo: WorkoutSocialRepository,
    private readonly blockRepo: BlockRepository,
    private readonly workoutRepo: WorkoutRepository,
  ) {}

  private async ensureWorkoutExists(workoutId: string): Promise<void> {
    const workout = await this.workoutRepo.findByIdWithUser(workoutId);
    if (!workout) {
      throw new NotFoundException("워크아웃을 찾을 수 없습니다.");
    }
  }

  async likeWorkout(userId: string, workoutId: string) {
    await this.ensureWorkoutExists(workoutId);
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
    await this.ensureWorkoutExists(workoutId);
    return this.repo.unlikeWorkout(userId, workoutId);
  }

  async isLiked(userId: string, workoutId: string) {
    return this.repo.isLiked(userId, workoutId);
  }

  async getLikeCount(workoutId: string) {
    return this.repo.getLikeCount(workoutId);
  }

  async addComment(userId: string, workoutId: string, dto: CreateWorkoutCommentDto) {
    await this.ensureWorkoutExists(workoutId);
    return this.repo.addComment({
      userId,
      workoutId,
      content: dto.content,
      ...(dto.parentId !== undefined && { parentId: dto.parentId }),
      ...(dto.mentionedUserIds !== undefined && { mentionedUserIds: dto.mentionedUserIds }),
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

  async getComments(workoutId: string, currentUserId?: string, cursor?: string, limit = 20) {
    const excludeUserIds = currentUserId
      ? await this.blockRepo.getBlockedUserIds(currentUserId)
      : [];
    return this.repo.getComments(workoutId, cursor, limit, excludeUserIds);
  }
}
