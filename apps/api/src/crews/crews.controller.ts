import { Controller, Get, Post, Patch, Delete, Param, Body, Req, Query, BadRequestException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import type { Request } from "express";
import { CrewsService } from "./crews.service.js";
import { CreateCrewDto } from "./dto/create-crew.dto.js";
import { UpdateCrewDto } from "./dto/update-crew.dto.js";
import { CreateCrewTagDto } from "./dto/create-crew-tag.dto.js";
import { UpdateCrewTagDto } from "./dto/update-crew-tag.dto.js";
import { CreateCrewActivityDto } from "./dto/create-crew-activity.dto.js";
import { UpdateCrewActivityDto } from "./dto/update-crew-activity.dto.js";

@ApiTags("Crews")
@Controller("crews")
export class CrewsController {
  constructor(private readonly crewsService: CrewsService) {}

  @ApiOperation({ summary: '크루 생성' })
  @ApiResponse({ status: 201, description: '생성 성공' })
  @Post()
  create(@Req() req: Request, @Body() dto: CreateCrewDto) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.create(userId, dto);
  }

  @ApiOperation({ summary: '크루 목록 조회' })
  @ApiResponse({ status: 200, description: '성공' })
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

  @ApiOperation({ summary: '크루 상세 조회' })
  @ApiResponse({ status: 200, description: '성공' })
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
  kickMember(
    @Param("id") id: string,
    @Param("userId") targetUserId: string,
    @Req() req: Request,
    @Body("reason") reason?: string
  ) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.kickMember(id, userId, targetUserId, reason);
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
    throw new BadRequestException("Invalid role. Only ADMIN or MEMBER allowed.");
  }

  @Get(":id/bans")
  getBannedMembers(@Param("id") id: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.getBannedMembers(id, userId);
  }

  @Delete(":id/bans/:userId")
  unbanMember(@Param("id") id: string, @Param("userId") targetUserId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.unbanMember(id, userId, targetUserId);
  }

  // ============ Pending Members ============

  @Get(":id/members/pending")
  getPendingMembers(@Param("id") id: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.getPendingMembers(id, userId);
  }

  @Post(":id/members/:userId/approve")
  approveMember(@Param("id") id: string, @Param("userId") targetUserId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.approveMember(id, userId, targetUserId);
  }

  @Post(":id/members/:userId/reject")
  rejectMember(@Param("id") id: string, @Param("userId") targetUserId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.rejectMember(id, userId, targetUserId);
  }

  // ============ Tags ============

  @Post(":id/tags")
  createTag(@Param("id") id: string, @Req() req: Request, @Body() dto: CreateCrewTagDto) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.createTag(id, userId, dto.name, dto.color);
  }

  @Get(":id/tags")
  getTags(@Param("id") id: string) {
    return this.crewsService.getTags(id);
  }

  @Patch(":id/tags/:tagId")
  updateTag(
    @Param("id") id: string,
    @Param("tagId") tagId: string,
    @Req() req: Request,
    @Body() dto: UpdateCrewTagDto
  ) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.updateTag(tagId, id, userId, dto);
  }

  @Delete(":id/tags/:tagId")
  deleteTag(@Param("id") id: string, @Param("tagId") tagId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.deleteTag(tagId, id, userId);
  }

  @Post(":id/members/:memberId/tags/:tagId")
  assignTagToMember(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Param("tagId") tagId: string,
    @Req() req: Request
  ) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.assignTagToMember(id, userId, memberId, tagId);
  }

  @Delete(":id/members/:memberId/tags/:tagId")
  removeTagFromMember(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Param("tagId") tagId: string,
    @Req() req: Request
  ) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.removeTagFromMember(id, userId, memberId, tagId);
  }

  // ============ Chat ============

  @Get(":id/chat")
  getCrewChat(
    @Param("id") id: string,
    @Req() req: Request,
    @Query("cursor") cursor?: string
  ) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.getCrewChat(id, userId, cursor);
  }

  @Get(":id/activities/:activityId/chat")
  getActivityChat(
    @Param("id") id: string,
    @Param("activityId") activityId: string,
    @Req() req: Request,
    @Query("cursor") cursor?: string
  ) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.getActivityChat(id, activityId, userId, cursor);
  }

  // ============ Activities ============

  @Post(":id/activities")
  createActivity(@Param("id") id: string, @Req() req: Request, @Body() dto: CreateCrewActivityDto) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.createActivity(id, userId, {
      title: dto.title,
      description: dto.description,
      activityDate: new Date(dto.activityDate),
      location: dto.location,
      latitude: dto.latitude,
      longitude: dto.longitude,
      activityType: dto.activityType,
      workoutTypeId: dto.workoutTypeId,
    });
  }

  @Get(":id/activities")
  getActivities(
    @Param("id") id: string,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
    @Query("type") type?: string,
    @Query("status") status?: string
  ) {
    return this.crewsService.getActivities(id, {
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
      type,
      status,
    });
  }

  @Get(":id/activities/:activityId")
  getActivity(@Param("activityId") activityId: string) {
    return this.crewsService.getActivity(activityId);
  }

  @Patch(":id/activities/:activityId")
  updateActivity(
    @Param("id") id: string,
    @Param("activityId") activityId: string,
    @Req() req: Request,
    @Body() dto: UpdateCrewActivityDto
  ) {
    const { userId } = req.user as { userId: string };
    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.activityDate !== undefined) data.activityDate = new Date(dto.activityDate);
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.latitude !== undefined) data.latitude = dto.latitude;
    if (dto.longitude !== undefined) data.longitude = dto.longitude;
    return this.crewsService.updateActivity(activityId, id, userId, data);
  }

  @Delete(":id/activities/:activityId")
  deleteActivity(
    @Param("id") id: string,
    @Param("activityId") activityId: string,
    @Req() req: Request
  ) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.deleteActivity(activityId, id, userId);
  }

  @Post(":id/activities/:activityId/check-in")
  checkIn(
    @Param("activityId") activityId: string,
    @Req() req: Request,
    @Body("method") method?: string
  ) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.checkIn(activityId, userId, method);
  }

  @Post(":id/activities/:activityId/qr-check-in")
  qrCheckIn(
    @Param("id") id: string,
    @Param("activityId") activityId: string,
    @Req() req: Request,
    @Body("qrCode") qrCode: string
  ) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.qrCheckIn(activityId, id, userId, qrCode);
  }

  @Post(":id/activities/:activityId/rsvp")
  rsvp(
    @Param("id") id: string,
    @Param("activityId") activityId: string,
    @Req() req: Request
  ) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.rsvp(activityId, id, userId);
  }

  @Delete(":id/activities/:activityId/rsvp")
  cancelRsvp(
    @Param("id") id: string,
    @Param("activityId") activityId: string,
    @Req() req: Request
  ) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.cancelRsvp(activityId, id, userId);
  }

  @Post(":id/activities/:activityId/complete")
  completeActivity(
    @Param("id") id: string,
    @Param("activityId") activityId: string,
    @Req() req: Request
  ) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.completeActivity(activityId, id, userId);
  }

  @Post(":id/activities/:activityId/cancel")
  cancelActivity(
    @Param("id") id: string,
    @Param("activityId") activityId: string,
    @Req() req: Request
  ) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.cancelActivity(activityId, id, userId);
  }

  @Post(":id/activities/:activityId/admin-check-in")
  adminCheckIn(
    @Param("id") id: string,
    @Param("activityId") activityId: string,
    @Req() req: Request,
    @Body("userId") targetUserId: string
  ) {
    const { userId } = req.user as { userId: string };
    return this.crewsService.adminCheckIn(activityId, id, userId, targetUserId);
  }

  @Get(":id/members/:userId/attendance-stats")
  getMemberAttendanceStats(
    @Param("id") id: string,
    @Param("userId") userId: string
  ) {
    return this.crewsService.getMemberAttendanceStats(id, userId);
  }

  @Get(":id/attendance-stats")
  getCrewAttendanceStats(
    @Param("id") id: string,
    @Query("month") month?: string,
    @Query("type") type?: string
  ) {
    return this.crewsService.getCrewAttendanceStats(id, { month, type });
  }

  @Get(":id/activities/:activityId/attendees")
  getAttendees(
    @Param("activityId") activityId: string,
    @Query("status") status?: string
  ) {
    return this.crewsService.getAttendees(activityId, status);
  }
}
