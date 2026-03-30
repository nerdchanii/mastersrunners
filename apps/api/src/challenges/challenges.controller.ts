import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { CursorLimitQueryDto } from "../common/dto/cursor-limit-query.dto.js";
import { LimitQueryDto } from "../common/dto/limit-query.dto.js";

import { CreateChallengeDto } from "./dto/create-challenge.dto.js";
import { CreateChallengeTeamDto } from "./dto/create-challenge-team.dto.js";
import { ListChallengesQueryDto } from "./dto/list-challenges-query.dto.js";
import { UpdateChallengeDto } from "./dto/update-challenge.dto.js";
import { UpdateProgressDto } from "./dto/update-progress.dto.js";
import { ChallengesService } from "./challenges.service.js";

@ApiTags("Challenges")
@Controller("challenges")
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @ApiOperation({ summary: "챌린지 생성" })
  @ApiResponse({ status: 201, description: "생성 성공" })
  @Post()
  create(@Req() req: Request, @Body() dto: CreateChallengeDto) {
    const { userId } = req.user as { userId: string };
    return this.challengesService.create(userId, dto);
  }

  @ApiOperation({ summary: "챌린지 목록 조회" })
  @ApiResponse({ status: 200, description: "성공" })
  @Get()
  findAll(@Query() query: ListChallengesQueryDto) {
    return this.challengesService.findAll({
      isPublic: query.isPublic,
      crewId: query.crewId,
      cursor: query.cursor,
      limit: query.resolveOptionalLimit(),
    });
  }

  @Get("my")
  findMyChallenges(@Req() req: Request, @Query() query: CursorLimitQueryDto) {
    const { userId } = req.user as { userId: string };
    return this.challengesService.findMyChallenges(userId, {
      cursor: query.cursor,
      limit: query.resolveOptionalLimit(),
    });
  }

  @ApiOperation({ summary: "챌린지 상세 조회" })
  @ApiResponse({ status: 200, description: "성공" })
  @Get(":id")
  findOne(@Param("id") id: string, @Req() req: Request) {
    const userId = (req.user as { userId: string } | undefined)?.userId;
    return this.challengesService.findOne(id, userId);
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

  @ApiOperation({ summary: "챌린지 리더보드 조회" })
  @ApiResponse({ status: 200, description: "성공" })
  @Get(":id/leaderboard")
  getLeaderboard(@Param("id") id: string, @Query() query: LimitQueryDto) {
    return this.challengesService.getLeaderboard(id, query.resolveOptionalLimit());
  }

  @Post(":id/teams")
  createTeam(@Param("id") id: string, @Req() req: Request, @Body() dto: CreateChallengeTeamDto) {
    const { userId } = req.user as { userId: string };
    return this.challengesService.createTeam(id, userId, dto.teamName);
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
