import { Controller, Get, Post, Patch, Delete, Param, Body, Req, Query } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";
import { CrewsService } from "./crews.service.js";
import { CreateCrewDto } from "./dto/create-crew.dto.js";
import { UpdateCrewDto } from "./dto/update-crew.dto.js";

@SkipThrottle()
@Controller("crews")
export class CrewsController {
  constructor(private readonly crewsService: CrewsService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateCrewDto) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.create(userId, dto);
  }

  @Get()
  findAll(
    @Query("isPublic") isPublic?: string,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string
  ) {
    return this.crewsService.findAll({
      isPublic: isPublic === "true" ? true : isPublic === "false" ? false : undefined,
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get("my")
  findMyCrews(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.findMyCrews(userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.crewsService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Req() req: Request, @Body() dto: UpdateCrewDto) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.update(id, userId, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.remove(id, userId);
  }

  @Post(":id/join")
  join(@Param("id") id: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.join(id, userId);
  }

  @Delete(":id/leave")
  leave(@Param("id") id: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.leave(id, userId);
  }

  @Delete(":id/members/:userId")
  kickMember(@Param("id") id: string, @Param("userId") targetUserId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.kickMember(id, userId, targetUserId);
  }

  @Patch(":id/members/:userId/role")
  changeRole(
    @Param("id") id: string,
    @Param("userId") targetUserId: string,
    @Body("role") role: string,
    @Req() req: Request
  ) {
    const { userId } = req.user as { userId: string };
    if (role === "ADMIN") {
      return this.crewsService.promoteToAdmin(id, userId, targetUserId);
    } else if (role === "MEMBER") {
      return this.crewsService.demoteToMember(id, userId, targetUserId);
    }
    throw new Error("Invalid role. Only ADMIN or MEMBER allowed.");
  }
}
