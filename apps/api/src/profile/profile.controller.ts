import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { Public } from "../common/decorators/public.decorator.js";

import { UpdateProfileDto } from "./dto/update-profile.dto.js";
import { ProfileService } from "./profile.service.js";

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

  @Delete()
  @HttpCode(HttpStatus.OK)
  deleteAccount(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.profileService.deleteAccount(userId);
  }

  @Get("search")
  searchUsers(@Query("q") query: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.profileService.searchUsers(query || "", userId);
  }

  @Get(":userId")
  @Public()
  getUserProfile(@Param("userId") targetUserId: string, @Req() req: Request) {
    const userId = (req.user as { userId: string } | undefined)?.userId;
    return this.profileService.getProfile(targetUserId, userId);
  }
}
