import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { UserRepository } from "../auth/repositories/user.repository.js";
import { WorkoutRepository } from "../workouts/repositories/workout.repository.js";
import { BlockRepository } from "../block/repositories/block.repository.js";

@Injectable()
export class ProfileService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly workoutRepo: WorkoutRepository,
    private readonly blockRepo: BlockRepository,
  ) {}

  async getProfile(userId: string, currentUserId?: string) {
    if (currentUserId && currentUserId !== userId) {
      const blocked = await this.blockRepo.isBlocked(currentUserId, userId);
      if (blocked) {
        throw new ForbiddenException("차단된 사용자의 프로필입니다.");
      }
    }

    const user = await this.userRepo.findByIdBasicSelect(userId);

    if (!user) {
      throw new NotFoundException("사용자를 찾을 수 없습니다.");
    }

    const stats = await this.workoutRepo.aggregateByUser(userId);

    const totalWorkouts = stats._count;
    const totalDistance = stats._sum.distance ?? 0;
    const totalDuration = stats._sum.duration ?? 0;
    const averagePace = totalDistance > 0 ? totalDuration / (totalDistance / 1000) : 0;

    return {
      user,
      stats: { totalWorkouts, totalDistance, totalDuration, averagePace },
    };
  }
}
