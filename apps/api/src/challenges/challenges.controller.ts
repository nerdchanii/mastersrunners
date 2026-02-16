import { Controller, Get, Post, Patch, Delete, Param, Body, Req, Query } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";
import { ChallengesService } from "./challenges.service.js";
import { CreateChallengeDto } from "./dto/create-challenge.dto.js";
import { UpdateChallengeDto } from "./dto/update-challenge.dto.js";
import { UpdateProgressDto } from "./dto/update-progress.dto.js";

@SkipThrottle()
@Controller("challenges")
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateChallengeDto) {
    const { userId } = req.user as { userId: string };
    return this.challengesService.create(userId, dto);
  }

  @Get()
  findAll(
    @Query("isPublic") isPublic?: string,
    @Query("crewId") crewId?: string,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
  ) {
    return this.challengesService.findAll({
      isPublic: isPublic === "true" ? true : isPublic === "false" ? false : undefined,
      crewId,
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get("my")
  findMyChallenges(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.challengesService.findMyChallenges(userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.challengesService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Req() req: Request, @Body() dto: UpdateChallengeDto) {
    const { userId } = req.user as { userId: string };
    return this.challengesService.update(id, userId, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.challengesService.remove(id, userId);
  }

  @Post(":id/join")
  join(@Param("id") id: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.challengesService.join(id, userId);
  }

  @Delete(":id/leave")
  leave(@Param("id") id: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.challengesService.leave(id, userId);
  }

  @Patch(":id/progress")
  updateProgress(@Param("id") id: string, @Req() req: Request, @Body() dto: UpdateProgressDto) {
    const { userId } = req.user as { userId: string };
    return this.challengesService.updateProgress(id, userId, dto.currentValue);
  }

  @Get(":id/leaderboard")
  getLeaderboard(@Param("id") id: string, @Query("limit") limit?: string) {
    return this.challengesService.getLeaderboard(id, limit ? parseInt(limit, 10) : undefined);
  }

  // ============ Teams ============

  @Post(":id/teams")
  createTeam(@Param("id") id: string, @Req() req: Request, @Body("teamName") teamName: string) {
    const { userId } = req.user as { userId: string };
    return this.challengesService.createTeam(id, userId, teamName);
  }

  @Get(":id/teams")
  getTeams(@Param("id") id: string) {
    return this.challengesService.getTeams(id);
  }

  @Post(":id/teams/:teamId/join")
  joinTeam(@Param("id") id: string, @Param("teamId") teamId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.challengesService.joinTeam(id, userId, teamId);
  }

  @Delete(":id/teams/leave")
  leaveTeam(@Param("id") id: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.challengesService.leaveTeam(id, userId);
  }

  @Delete(":id/teams/:teamId")
  removeTeam(@Param("id") id: string, @Param("teamId") teamId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.challengesService.removeTeam(teamId, userId);
  }

  @Get(":id/teams/leaderboard")
  getTeamLeaderboard(@Param("id") id: string) {
    return this.challengesService.getTeamLeaderboard(id);
  }
}
