import { Controller, Get, Param, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";
import { ProfileService } from "./profile.service.js";

@ApiTags("Profile")
@SkipThrottle()
@Controller("profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.profileService.getProfile(userId, userId);
  }

  @Get(":userId")
  getUserProfile(@Param("userId") targetUserId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.profileService.getProfile(targetUserId, userId);
  }
}
