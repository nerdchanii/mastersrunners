import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { UserRepository } from "../auth/repositories/user.repository.js";
import { WorkoutRepository } from "../workouts/repositories/workout.repository.js";
import { BlockRepository } from "../block/repositories/block.repository.js";
import { FollowRepository } from "../follow/repositories/follow.repository.js";
import { DatabaseService } from "../database/database.service.js";
import type { UpdateProfileDto } from "./dto/update-profile.dto.js";

@Injectable()
export class ProfileService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly workoutRepo: WorkoutRepository,
    private readonly blockRepo: BlockRepository,
    private readonly followRepo: FollowRepository,
    private readonly db: DatabaseService,
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

    const [stats, followersCount, followingCount, postCount] = await Promise.all([
      this.workoutRepo.aggregateByUser(userId),
      this.followRepo.countFollowers(userId),
      this.followRepo.countFollowing(userId),
      this.db.prisma.post.count({ where: { userId, deletedAt: null } }),
    ]);

    const totalWorkouts = stats._count;
    const totalDistance = stats._sum.distance ?? 0;
    const totalDuration = stats._sum.duration ?? 0;
    const averagePace = totalDistance > 0 ? totalDuration / (totalDistance / 1000) : 0;

    let isFollowing: boolean | undefined;
    let isPending: boolean | undefined;
    if (currentUserId && currentUserId !== userId) {
      const follow = await this.followRepo.findFollow(currentUserId, userId);
      isFollowing = follow?.status === "ACCEPTED";
      isPending = follow?.status === "PENDING";
    }

    return {
      user,
      stats: { totalWorkouts, totalDistance, totalDuration, averagePace, postCount },
      followersCount,
      followingCount,
      isFollowing,
      isPending,
      isPrivate: user.isPrivate,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException("사용자를 찾을 수 없습니다.");
    }

    return this.userRepo.update(userId, dto);
  }

  async searchUsers(query: string, currentUserId: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    // Get blocked user IDs to filter from results
    const blockedUserIds = await this.blockRepo.getBlockedUserIds(currentUserId);

    const users = await this.userRepo.searchByName(query.trim(), blockedUserIds);

    // Get follow status for each result
    const usersWithFollowStatus = await Promise.all(
      users.map(async (user) => {
        const follow = await this.followRepo.findFollow(currentUserId, user.id);
        return {
          ...user,
          isFollowing: follow?.status === "ACCEPTED",
          isPending: follow?.status === "PENDING",
        };
      }),
    );

    return usersWithFollowStatus;
  }
}
