import { Injectable, ConflictException, ForbiddenException, NotFoundException, Optional } from "@nestjs/common";
import { FollowRepository } from "./repositories/follow.repository.js";
import { BlockRepository } from "../block/repositories/block.repository.js";
import { NotificationsService } from "../notifications/notifications.service.js";

@Injectable()
export class FollowService {
  constructor(
    private readonly followRepo: FollowRepository,
    private readonly blockRepo: BlockRepository,
    @Optional() private readonly notificationsService?: NotificationsService,
  ) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new ConflictException("자기 자신을 팔로우할 수 없습니다.");
    }

    const existing = await this.followRepo.findFollow(followerId, followingId);
    if (existing) {
      throw new ConflictException("이미 팔로우하고 있습니다.");
    }

    const blocked = await this.blockRepo.isBlocked(followerId, followingId);
    if (blocked) {
      throw new ForbiddenException("차단된 사용자를 팔로우할 수 없습니다.");
    }

    const isPrivate = await this.followRepo.findUserIsPrivate(followingId);
    const status = isPrivate ? "PENDING" : "ACCEPTED";

    const result = await this.followRepo.follow(followerId, followingId, status);

    // 알림 발행 (비차단)
    if (this.notificationsService) {
      const notifType = isPrivate ? "FOLLOW_REQUEST" : "FOLLOW";
      const message = isPrivate ? "회원님에게 팔로우 요청을 보냈습니다." : "회원님을 팔로우합니다.";
      this.notificationsService.createNotification({
        userId: followingId,
        actorId: followerId,
        type: notifType,
        referenceType: "FOLLOW",
        referenceId: followerId,
        message,
      }).catch(() => {});
    }

    return result;
  }

  async unfollow(followerId: string, followingId: string) {
    const existing = await this.followRepo.findFollow(followerId, followingId);
    if (!existing) {
      throw new NotFoundException("팔로우 관계를 찾을 수 없습니다.");
    }

    return this.followRepo.unfollow(followerId, followingId);
  }

  async acceptRequest(userId: string, followerId: string) {
    const existing = await this.followRepo.findFollow(followerId, userId);
    if (!existing) {
      throw new NotFoundException("팔로우 요청을 찾을 수 없습니다.");
    }

    if (existing.status !== "PENDING") {
      throw new ConflictException("이미 수락된 요청입니다.");
    }

    return this.followRepo.accept(followerId, userId);
  }

  async rejectRequest(userId: string, followerId: string) {
    const existing = await this.followRepo.findFollow(followerId, userId);
    if (!existing) {
      throw new NotFoundException("팔로우 요청을 찾을 수 없습니다.");
    }

    return this.followRepo.reject(followerId, userId);
  }

  async getFollowers(userId: string) {
    const blockedUserIds = await this.blockRepo.getBlockedUserIds(userId);
    return this.followRepo.findFollowers(userId, "ACCEPTED", blockedUserIds);
  }

  async getFollowing(userId: string) {
    const blockedUserIds = await this.blockRepo.getBlockedUserIds(userId);
    return this.followRepo.findFollowing(userId, "ACCEPTED", blockedUserIds);
  }

  async getPendingRequests(userId: string) {
    return this.followRepo.findFollowers(userId, "PENDING");
  }
}
