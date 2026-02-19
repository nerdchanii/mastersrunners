import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from "@nestjs/common";
import { CrewRepository } from "./repositories/crew.repository.js";
import { CrewMemberRepository } from "./repositories/crew-member.repository.js";
import { CrewTagRepository } from "./repositories/crew-tag.repository.js";
import { CrewActivityRepository } from "./repositories/crew-activity.repository.js";
import { CrewBanRepository } from "./repositories/crew-ban.repository.js";
import { DatabaseService } from "../database/database.service.js";
import type { CreateCrewDto } from "./dto/create-crew.dto.js";
import type { UpdateCrewDto } from "./dto/update-crew.dto.js";
import { randomUUID } from "crypto";

@Injectable()
export class CrewsService {
  constructor(
    private readonly crewRepo: CrewRepository,
    private readonly crewMemberRepo: CrewMemberRepository,
    private readonly crewTagRepo: CrewTagRepository,
    private readonly crewActivityRepo: CrewActivityRepository,
    private readonly crewBanRepo: CrewBanRepository,
    private readonly db: DatabaseService
  ) {}

  async create(userId: string, dto: CreateCrewDto) {
    const crew = await this.crewRepo.create({
      name: dto.name,
      description: dto.description || null,
      imageUrl: dto.imageUrl || null,
      creatorId: userId,
      isPublic: dto.isPublic ?? true,
      maxMembers: dto.maxMembers || null,
    });

    await this.crewMemberRepo.addMember(crew.id, userId, "OWNER", "ACTIVE");

    return crew;
  }

  async findOne(id: string) {
    const crew = await this.crewRepo.findById(id);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }
    return crew;
  }

  async findAll(options: { isPublic?: boolean; cursor?: string; limit?: number }) {
    return this.crewRepo.findAll(options);
  }

  async findMyCrews(userId: string) {
    return this.crewRepo.findByUser(userId);
  }

  async update(id: string, userId: string, dto: UpdateCrewDto) {
    const crew = await this.crewRepo.findById(id);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const member = await this.crewMemberRepo.findMember(id, userId);
    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      throw new ForbiddenException("크루 관리자만 수정할 수 있습니다.");
    }

    return this.crewRepo.update(id, dto);
  }

  async remove(id: string, userId: string) {
    const crew = await this.crewRepo.findById(id);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const member = await this.crewMemberRepo.findMember(id, userId);
    if (!member || member.role !== "OWNER") {
      throw new ForbiddenException("크루 소유자만 삭제할 수 있습니다.");
    }

    return this.crewRepo.softDelete(id);
  }

  async join(crewId: string, userId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const ban = await this.db.prisma.crewBan.findUnique({
      where: { crewId_userId: { crewId, userId } },
    });
    if (ban) {
      throw new BadRequestException("차단된 사용자는 가입할 수 없습니다.");
    }

    const existingMember = await this.crewMemberRepo.findMember(crewId, userId);

    if (existingMember) {
      if (existingMember.status === "PENDING") {
        throw new BadRequestException("이미 가입 요청 중입니다.");
      }
      if (existingMember.status === "LEFT") {
        const status = crew.isPublic ? "ACTIVE" : "PENDING";
        return this.crewMemberRepo.updateStatus(crewId, userId, status);
      }
      throw new BadRequestException("이미 가입한 크루입니다.");
    }

    if (crew.maxMembers !== null) {
      const currentCount = await this.crewMemberRepo.countMembers(crewId);
      if (currentCount >= crew.maxMembers) {
        throw new BadRequestException("크루 정원이 가득 찼습니다.");
      }
    }

    const status = crew.isPublic ? "ACTIVE" : "PENDING";
    return this.crewMemberRepo.addMember(crewId, userId, "MEMBER", status);
  }

  async leave(crewId: string, userId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member) {
      throw new BadRequestException("크루 멤버가 아닙니다.");
    }

    if (member.role === "OWNER") {
      throw new ForbiddenException("크루 소유자는 탈퇴할 수 없습니다.");
    }

    return this.crewMemberRepo.removeMember(crewId, userId);
  }

  async kickMember(crewId: string, adminUserId: string, targetUserId: string, reason?: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const adminMember = await this.crewMemberRepo.findMember(crewId, adminUserId);
    if (!adminMember || (adminMember.role !== "OWNER" && adminMember.role !== "ADMIN")) {
      throw new ForbiddenException("크루 관리자만 멤버를 추방할 수 있습니다.");
    }

    const targetMember = await this.crewMemberRepo.findMember(crewId, targetUserId);
    if (!targetMember) {
      throw new BadRequestException("대상 사용자가 크루 멤버가 아닙니다.");
    }

    if (targetMember.role === "OWNER") {
      throw new ForbiddenException("크루 소유자는 추방할 수 없습니다.");
    }

    await this.crewMemberRepo.removeMember(crewId, targetUserId);
    await this.crewBanRepo.create({ crewId, userId: targetUserId, bannedBy: adminUserId, reason });

    return { success: true };
  }

  async promoteToAdmin(crewId: string, ownerId: string, targetUserId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const ownerMember = await this.crewMemberRepo.findMember(crewId, ownerId);
    if (!ownerMember || ownerMember.role !== "OWNER") {
      throw new ForbiddenException("크루 소유자만 관리자를 지정할 수 있습니다.");
    }

    const targetMember = await this.crewMemberRepo.findMember(crewId, targetUserId);
    if (!targetMember) {
      throw new BadRequestException("대상 사용자가 크루 멤버가 아닙니다.");
    }

    return this.crewMemberRepo.updateRole(crewId, targetUserId, "ADMIN");
  }

  async demoteToMember(crewId: string, ownerId: string, targetUserId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const ownerMember = await this.crewMemberRepo.findMember(crewId, ownerId);
    if (!ownerMember || ownerMember.role !== "OWNER") {
      throw new ForbiddenException("크루 소유자만 관리자를 해제할 수 있습니다.");
    }

    const targetMember = await this.crewMemberRepo.findMember(crewId, targetUserId);
    if (!targetMember) {
      throw new BadRequestException("대상 사용자가 크루 멤버가 아닙니다.");
    }

    return this.crewMemberRepo.updateRole(crewId, targetUserId, "MEMBER");
  }

  async approveMember(crewId: string, adminUserId: string, targetUserId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const adminMember = await this.crewMemberRepo.findMember(crewId, adminUserId);
    if (!adminMember || (adminMember.role !== "OWNER" && adminMember.role !== "ADMIN")) {
      throw new ForbiddenException("크루 관리자만 가입을 승인할 수 있습니다.");
    }

    const targetMember = await this.crewMemberRepo.findMember(crewId, targetUserId);
    if (!targetMember) {
      throw new BadRequestException("대상 사용자가 크루 멤버가 아닙니다.");
    }

    if (targetMember.status !== "PENDING") {
      throw new BadRequestException("가입 요청 중인 사용자가 아닙니다.");
    }

    if (crew.maxMembers !== null) {
      const currentCount = await this.crewMemberRepo.countMembers(crewId);
      if (currentCount >= crew.maxMembers) {
        throw new BadRequestException("크루 정원이 가득 찼습니다.");
      }
    }

    return this.crewMemberRepo.updateStatus(crewId, targetUserId, "ACTIVE");
  }

  async rejectMember(crewId: string, adminUserId: string, targetUserId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const adminMember = await this.crewMemberRepo.findMember(crewId, adminUserId);
    if (!adminMember || (adminMember.role !== "OWNER" && adminMember.role !== "ADMIN")) {
      throw new ForbiddenException("크루 관리자만 가입을 거절할 수 있습니다.");
    }

    const targetMember = await this.crewMemberRepo.findMember(crewId, targetUserId);
    if (!targetMember) {
      throw new BadRequestException("대상 사용자가 크루 멤버가 아닙니다.");
    }

    if (targetMember.status !== "PENDING") {
      throw new BadRequestException("가입 요청 중인 사용자가 아닙니다.");
    }

    return this.crewMemberRepo.removeMember(crewId, targetUserId);
  }

  async getPendingMembers(crewId: string, userId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      throw new ForbiddenException("크루 관리자만 가입 요청 목록을 조회할 수 있습니다.");
    }

    return this.crewMemberRepo.findPendingMembers(crewId);
  }

  // ============ Tag Methods ============

  async createTag(crewId: string, userId: string, name: string, color?: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      throw new ForbiddenException("크루 관리자만 태그를 생성할 수 있습니다.");
    }

    return this.crewTagRepo.create(crewId, name, color);
  }

  async getTags(crewId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    return this.crewTagRepo.findByCrewId(crewId);
  }

  async updateTag(tagId: string, crewId: string, userId: string, data: { name?: string; color?: string }) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      throw new ForbiddenException("크루 관리자만 태그를 수정할 수 있습니다.");
    }

    return this.crewTagRepo.update(tagId, data);
  }

  async deleteTag(tagId: string, crewId: string, userId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      throw new ForbiddenException("크루 관리자만 태그를 삭제할 수 있습니다.");
    }

    return this.crewTagRepo.remove(tagId);
  }

  async assignTagToMember(crewId: string, adminUserId: string, memberId: string, tagId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const adminMember = await this.crewMemberRepo.findMember(crewId, adminUserId);
    if (!adminMember || (adminMember.role !== "OWNER" && adminMember.role !== "ADMIN")) {
      throw new ForbiddenException("크루 관리자만 태그를 부여할 수 있습니다.");
    }

    // Verify member exists
    const targetMember = await this.db.prisma.crewMember.findUnique({
      where: { id: memberId },
    });
    if (!targetMember || targetMember.crewId !== crewId) {
      throw new BadRequestException("대상 멤버가 이 크루에 속하지 않습니다.");
    }

    // Check for duplicate assignment
    const existing = await this.db.prisma.crewMemberTag.findUnique({
      where: {
        crewMemberId_crewTagId: {
          crewMemberId: memberId,
          crewTagId: tagId,
        },
      },
    });
    if (existing) {
      throw new ConflictException("이미 해당 태그가 부여되어 있습니다.");
    }

    return this.crewTagRepo.assignToMember(memberId, tagId);
  }

  async removeTagFromMember(crewId: string, adminUserId: string, memberId: string, tagId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const adminMember = await this.crewMemberRepo.findMember(crewId, adminUserId);
    if (!adminMember || (adminMember.role !== "OWNER" && adminMember.role !== "ADMIN")) {
      throw new ForbiddenException("크루 관리자만 태그를 제거할 수 있습니다.");
    }

    return this.crewTagRepo.removeFromMember(memberId, tagId);
  }

  // ============ Activity Methods ============

  async createActivity(
    crewId: string,
    userId: string,
    data: {
      title: string;
      description?: string;
      activityDate: Date;
      location?: string;
      latitude?: number;
      longitude?: number;
      activityType?: string;
      workoutTypeId?: string;
    }
  ) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) throw new NotFoundException("크루를 찾을 수 없습니다.");

    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member) throw new ForbiddenException("크루 멤버만 활동을 생성할 수 있습니다.");

    const activityType = data.activityType || "OFFICIAL";

    // OFFICIAL: only OWNER/ADMIN, POP_UP: any active member
    if (activityType === "OFFICIAL") {
      if (member.role !== "OWNER" && member.role !== "ADMIN") {
        throw new ForbiddenException("공식 활동은 크루 관리자만 생성할 수 있습니다.");
      }
    }

    const qrCode = randomUUID();
    return this.crewActivityRepo.create({
      crewId,
      title: data.title,
      description: data.description,
      activityDate: data.activityDate,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      createdBy: userId,
      qrCode,
      activityType,
      workoutTypeId: data.workoutTypeId,
    });
  }

  async getActivities(crewId: string, opts?: { cursor?: string; limit?: number; type?: string; status?: string }) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) throw new NotFoundException("크루를 찾을 수 없습니다.");

    const limit = opts?.limit ?? 20;
    const activities = await this.crewActivityRepo.findByCrewId(crewId, { ...opts, limit });
    const hasMore = activities.length > limit;
    const items = hasMore ? activities.slice(0, limit) : activities;
    const nextCursor = hasMore ? items[items.length - 1].id : null;
    return { items, nextCursor };
  }

  async getActivity(activityId: string) {
    const activity = await this.crewActivityRepo.findById(activityId);
    if (!activity) {
      throw new NotFoundException("활동을 찾을 수 없습니다.");
    }
    return activity;
  }

  async updateActivity(
    activityId: string,
    crewId: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      activityDate?: Date;
      location?: string;
      latitude?: number;
      longitude?: number;
    }
  ) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      throw new ForbiddenException("크루 관리자만 활동을 수정할 수 있습니다.");
    }

    return this.crewActivityRepo.update(activityId, data);
  }

  async deleteActivity(activityId: string, crewId: string, userId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      throw new ForbiddenException("크루 관리자만 활동을 삭제할 수 있습니다.");
    }

    return this.crewActivityRepo.remove(activityId);
  }

  async rsvp(activityId: string, crewId: string, userId: string) {
    const activity = await this.crewActivityRepo.findById(activityId);
    if (!activity) throw new NotFoundException("활동을 찾을 수 없습니다.");
    if (activity.crewId !== crewId) throw new BadRequestException("잘못된 크루입니다.");

    if (activity.status !== "SCHEDULED" && activity.status !== "ACTIVE") {
      throw new BadRequestException("참석 신청이 불가능한 활동입니다.");
    }

    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member) throw new ForbiddenException("크루 멤버만 참석 신청할 수 있습니다.");

    const existing = await this.crewActivityRepo.findAttendance(activityId, userId);
    if (existing) {
      if (existing.status === "CANCELLED") {
        // Re-RSVP after cancellation - update back to RSVP
        return this.db.prisma.crewAttendance.update({
          where: { activityId_userId: { activityId, userId } },
          data: { status: "RSVP", rsvpAt: new Date(), method: null, checkedAt: null, checkedBy: null },
        });
      }
      throw new ConflictException("이미 참석 신청되었습니다.");
    }

    return this.crewActivityRepo.rsvp(activityId, userId);
  }

  async cancelRsvp(activityId: string, crewId: string, userId: string) {
    const activity = await this.crewActivityRepo.findById(activityId);
    if (!activity) throw new NotFoundException("활동을 찾을 수 없습니다.");
    if (activity.crewId !== crewId) throw new BadRequestException("잘못된 크루입니다.");

    const existing = await this.crewActivityRepo.findAttendance(activityId, userId);
    if (!existing || existing.status !== "RSVP") {
      throw new BadRequestException("취소할 참석 신청이 없습니다.");
    }

    return this.crewActivityRepo.cancelRsvp(activityId, userId);
  }

  async checkIn(activityId: string, userId: string, method: string = "MANUAL") {
    const activity = await this.crewActivityRepo.findById(activityId);
    if (!activity) throw new NotFoundException("활동을 찾을 수 없습니다.");

    if (activity.status !== "SCHEDULED" && activity.status !== "ACTIVE") {
      throw new BadRequestException("체크인이 불가능한 활동입니다.");
    }

    const member = await this.crewMemberRepo.findMember(activity.crewId, userId);
    if (!member) throw new ForbiddenException("크루 멤버만 체크인할 수 있습니다.");

    const existing = await this.crewActivityRepo.findAttendance(activityId, userId);
    if (!existing || existing.status !== "RSVP") {
      throw new BadRequestException("먼저 참석 신청을 해주세요.");
    }

    return this.crewActivityRepo.checkIn(activityId, userId, method);
  }

  async adminCheckIn(activityId: string, crewId: string, adminUserId: string, targetUserId: string) {
    const activity = await this.crewActivityRepo.findById(activityId);
    if (!activity) throw new NotFoundException("활동을 찾을 수 없습니다.");
    if (activity.crewId !== crewId) throw new BadRequestException("잘못된 크루입니다.");

    const adminMember = await this.crewMemberRepo.findMember(crewId, adminUserId);
    if (!adminMember) throw new ForbiddenException("권한이 없습니다.");

    const isAdmin = adminMember.role === "OWNER" || adminMember.role === "ADMIN";
    const isHost = activity.createdBy === adminUserId;

    if (!isAdmin && !(activity.activityType === "POP_UP" && isHost)) {
      throw new ForbiddenException("대리 체크인 권한이 없습니다.");
    }

    const existing = await this.crewActivityRepo.findAttendance(activityId, targetUserId);
    if (!existing || existing.status !== "RSVP") {
      throw new BadRequestException("RSVP 상태인 참석자만 대리 체크인할 수 있습니다.");
    }

    return this.crewActivityRepo.adminCheckIn(activityId, targetUserId, adminUserId);
  }

  async completeActivity(activityId: string, crewId: string, userId: string) {
    const activity = await this.crewActivityRepo.findById(activityId);
    if (!activity) throw new NotFoundException("활동을 찾을 수 없습니다.");
    if (activity.crewId !== crewId) throw new BadRequestException("잘못된 크루입니다.");

    if (activity.status === "COMPLETED" || activity.status === "CANCELLED") {
      throw new BadRequestException("이미 종료되거나 취소된 활동입니다.");
    }

    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member) throw new ForbiddenException("권한이 없습니다.");

    const isAdmin = member.role === "OWNER" || member.role === "ADMIN";
    const isHost = activity.createdBy === userId;

    if (!isAdmin && !(activity.activityType === "POP_UP" && isHost)) {
      throw new ForbiddenException("활동을 종료할 권한이 없습니다.");
    }

    return this.crewActivityRepo.completeActivity(activityId);
  }

  async cancelActivity(activityId: string, crewId: string, userId: string) {
    const activity = await this.crewActivityRepo.findById(activityId);
    if (!activity) throw new NotFoundException("활동을 찾을 수 없습니다.");
    if (activity.crewId !== crewId) throw new BadRequestException("잘못된 크루입니다.");

    if (activity.status === "COMPLETED" || activity.status === "CANCELLED") {
      throw new BadRequestException("이미 종료되거나 취소된 활동입니다.");
    }

    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member) throw new ForbiddenException("권한이 없습니다.");

    const isAdmin = member.role === "OWNER" || member.role === "ADMIN";
    const isHost = activity.createdBy === userId;

    if (!isAdmin && !(activity.activityType === "POP_UP" && isHost)) {
      throw new ForbiddenException("활동을 취소할 권한이 없습니다.");
    }

    return this.crewActivityRepo.cancelActivity(activityId);
  }

  async getAttendees(activityId: string, statusFilter?: string) {
    const activity = await this.crewActivityRepo.findById(activityId);
    if (!activity) throw new NotFoundException("활동을 찾을 수 없습니다.");
    return this.crewActivityRepo.getAttendees(activityId, statusFilter);
  }

  // ============ Ban Methods ============

  async unbanMember(crewId: string, adminUserId: string, targetUserId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const adminMember = await this.crewMemberRepo.findMember(crewId, adminUserId);
    if (!adminMember || (adminMember.role !== "OWNER" && adminMember.role !== "ADMIN")) {
      throw new ForbiddenException("크루 관리자만 차단을 해제할 수 있습니다.");
    }

    const ban = await this.crewBanRepo.findByCrewAndUser(crewId, targetUserId);
    if (!ban) {
      throw new NotFoundException("차단된 사용자가 아닙니다.");
    }

    await this.crewBanRepo.remove(crewId, targetUserId);
    return { success: true };
  }

  async getBannedMembers(crewId: string, userId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      throw new ForbiddenException("크루 관리자만 차단 목록을 조회할 수 있습니다.");
    }

    return this.crewBanRepo.findByCrewId(crewId);
  }
}
