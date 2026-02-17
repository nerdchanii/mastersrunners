import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { UserRepository } from "../auth/repositories/user.repository.js";
import { WorkoutRepository } from "../workouts/repositories/workout.repository.js";
import { BlockRepository } from "../block/repositories/block.repository.js";
import { FollowRepository } from "../follow/repositories/follow.repository.js";
import type { UpdateProfileDto } from "./dto/update-profile.dto.js";

@Injectable()
export class ProfileService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly workoutRepo: WorkoutRepository,
    private readonly blockRepo: BlockRepository,
    private readonly followRepo: FollowRepository,
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

    const [followersCount, followingCount] = await Promise.all([
      this.followRepo.countFollowers(userId),
      this.followRepo.countFollowing(userId),
    ]);

    let isFollowing: boolean | undefined;
    if (currentUserId && currentUserId !== userId) {
      const follow = await this.followRepo.findFollow(currentUserId, userId);
      isFollowing = follow?.status === "ACCEPTED";
    }

    return {
      user,
      stats: { totalWorkouts, totalDistance, totalDuration, averagePace },
      followersCount,
      followingCount,
      isFollowing,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException("사용자를 찾을 수 없습니다.");
    }

    return this.userRepo.update(userId, dto);
  }
}
