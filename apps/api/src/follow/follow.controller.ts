import { Controller, Get, Post, Delete, Param, Req } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";
import { FollowService } from "./follow.service.js";

@SkipThrottle()
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
  getUserFollowers(@Param("userId") userId: string) {
    return this.followService.getFollowers(userId);
  }

  @Get(":userId/following")
  getUserFollowing(@Param("userId") userId: string) {
    return this.followService.getFollowing(userId);
  }
}
