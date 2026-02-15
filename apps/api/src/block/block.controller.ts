import { Controller, Post, Delete, Get, Param, Req } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";
import { BlockService } from "./block.service.js";

@SkipThrottle()
@Controller("block")
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Post(":targetUserId")
  block(@Req() req: Request, @Param("targetUserId") targetUserId: string) {
    const { userId } = req.user as { userId: string };
    return this.blockService.block(userId, targetUserId);
  }

  @Delete(":targetUserId")
  unblock(@Req() req: Request, @Param("targetUserId") targetUserId: string) {
    const { userId } = req.user as { userId: string };
    return this.blockService.unblock(userId, targetUserId);
  }

  @Get()
  getBlockedUsers(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.blockService.getBlockedUsers(userId);
  }
}
