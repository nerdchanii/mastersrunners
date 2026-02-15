import { Controller, Get, Req } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";
import { ProfileService } from "./profile.service.js";

@SkipThrottle()
@Controller("profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.profileService.getProfile(userId);
  }
}
