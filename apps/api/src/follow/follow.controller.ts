import { Controller, Delete, ForbiddenException, Get, Param, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { FollowService } from "./follow.service.js";

@ApiTags("Follow")
@Controller("follow")
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post(":targetUserId")
  follow(@Req() req: Request, @Param("targetUserId") targetUserId: string) {
    const { userId } = req.user as { userId: string };
    return this.followService.follow(userId, targetUserId);
  }

  @Delete(":targetUserId")
  unfollow(@Req() req: Request, @Param("targetUserId") targetUserId: string) {
    const { userId } = req.user as { userId: string };
    return this.followService.unfollow(userId, targetUserId);
  }

  @Post(":followerId/accept")
  acceptRequest(@Req() req: Request, @Param("followerId") followerId: string) {
    const { userId } = req.user as { userId: string };
    return this.followService.acceptRequest(userId, followerId);
  }

  @Post(":followerId/reject")
  rejectRequest(@Req() req: Request, @Param("followerId") followerId: string) {
    const { userId } = req.user as { userId: string };
    return this.followService.rejectRequest(userId, followerId);
  }

  @Get("followers")
  getMyFollowers(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.followService.getFollowers(userId);
  }

  @Get("following")
  getMyFollowing(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.followService.getFollowing(userId);
  }

  @Get("requests")
  getPendingRequests(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.followService.getPendingRequests(userId);
  }

  @Get(":userId/followers")
  getUserFollowers(@Param("userId") userId: string, @Req() req: Request) {
    const { userId: currentUserId } = req.user as { userId: string };
    if (currentUserId !== userId) {
      throw new ForbiddenException("팔로워 목록은 본인만 확인할 수 있습니다.");
    }
    return this.followService.getFollowers(userId);
  }

  @Get(":userId/following")
  getUserFollowing(@Param("userId") userId: string, @Req() req: Request) {
    const { userId: currentUserId } = req.user as { userId: string };
    if (currentUserId !== userId) {
      throw new ForbiddenException("팔로잉 목록은 본인만 확인할 수 있습니다.");
    }
    return this.followService.getFollowing(userId);
  }
}
