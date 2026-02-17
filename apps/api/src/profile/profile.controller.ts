import { Controller, Get, Patch, Param, Body, Req, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { ProfileService } from "./profile.service.js";
import { UpdateProfileDto } from "./dto/update-profile.dto.js";

@ApiTags("Profile")
@Controller("profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.profileService.getProfile(userId, userId);
  }

  @Patch()
  updateProfile(@Body() dto: UpdateProfileDto, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.profileService.updateProfile(userId, dto);
  }

  @Get("search")
  searchUsers(@Query("q") query: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.profileService.searchUsers(query || "", userId);
  }

  @Get(":userId")
  getUserProfile(@Param("userId") targetUserId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.profileService.getProfile(targetUserId, userId);
  }
}
