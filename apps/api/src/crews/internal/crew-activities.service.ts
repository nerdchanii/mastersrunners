import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "crypto";

import { ConversationsRepository } from "../../conversations/repositories/conversations.repository.js";
import { CrewRepository } from "../repositories/crew.repository.js";
import { CrewActivityRepository } from "../repositories/crew-activity.repository.js";
import { CrewMemberRepository } from "../repositories/crew-member.repository.js";

interface CreateCrewActivityData {
  title: string;
  description?: string;
  activityDate: Date;
  location?: string;
  latitude?: number;
  longitude?: number;
  activityType?: string;
  activityIcon?: string;
  workoutTypeId?: string;
}

interface UpdateCrewActivityData {
  title?: string;
  description?: string;
  activityDate?: Date;
  location?: string;
  latitude?: number;
  longitude?: number;
  activityIcon?: string;
}

export class CrewActivitiesService {
  constructor(
    private readonly crewRepo: CrewRepository,
    private readonly crewMemberRepo: CrewMemberRepository,
    private readonly crewActivityRepo: CrewActivityRepository,
    private readonly conversationsRepo: ConversationsRepository,
  ) {}

  async createActivity(crewId: string, userId: string, data: CreateCrewActivityData) {
    await this.getCrewOrThrow(crewId);

    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      throw new ForbiddenException("크루 관리자만 활동을 생성할 수 있습니다.");
    }

    const activityType = data.activityType ?? "OFFICIAL";
    if (activityType !== "OFFICIAL" && activityType !== "POP_UP") {
      throw new BadRequestException("지원하지 않는 활동 유형입니다.");
    }

    const qrCode = randomUUID();
    const activity = await this.crewActivityRepo.create({
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
      activityIcon: data.activityType === "POP_UP" ? null : (data.activityIcon ?? null),
      workoutTypeId: data.workoutTypeId,
    });

    const activityChat = await this.conversationsRepo.createGroupConversation("ACTIVITY", {
      activityId: activity.id,
      crewId,
    });
    await this.crewActivityRepo.updateChatConversationId(activity.id, activityChat.id);
    await this.conversationsRepo.addParticipant(activityChat.id, userId);

    return activity;
  }

  async getActivities(
    crewId: string,
    opts?: { cursor?: string; limit?: number; type?: string; status?: string },
    currentUserId?: string,
  ) {
    await this.requireReadableCrew(crewId, currentUserId);

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
    data: UpdateCrewActivityData,
  ) {
    await this.getCrewOrThrow(crewId);
    await this.requireCrewAdmin(crewId, userId, "크루 관리자만 활동을 수정할 수 있습니다.");
    return this.crewActivityRepo.update(activityId, data);
  }

  async deleteActivity(activityId: string, crewId: string, userId: string) {
    await this.getCrewOrThrow(crewId);
    await this.requireCrewAdmin(crewId, userId, "크루 관리자만 활동을 삭제할 수 있습니다.");
    return this.crewActivityRepo.remove(activityId);
  }

  async rsvp(activityId: string, crewId: string, userId: string) {
    const activity = await this.getActivityInCrewOrThrow(activityId, crewId);
    this.ensureActivityOpenForAttendance(activity, "참석 신청이 불가능한 활동입니다.");

    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member) {
      throw new ForbiddenException("크루 멤버만 참석 신청할 수 있습니다.");
    }

    const existing = await this.crewActivityRepo.findAttendance(activityId, userId);
    if (existing) {
      if (existing.status === "CANCELLED") {
        const result = await this.crewActivityRepo.restoreRsvp(activityId, userId);
        await this.addActivityParticipant(activityId, userId);
        return result;
      }
      throw new ConflictException("이미 참석 신청되었습니다.");
    }

    const result = await this.crewActivityRepo.rsvp(activityId, userId);
    await this.addActivityParticipant(activityId, userId);
    return result;
  }

  async cancelRsvp(activityId: string, crewId: string, userId: string) {
    await this.getActivityInCrewOrThrow(activityId, crewId);

    const existing = await this.crewActivityRepo.findAttendance(activityId, userId);
    if (!existing || existing.status !== "RSVP") {
      throw new BadRequestException("취소할 참석 신청이 없습니다.");
    }

    const result = await this.crewActivityRepo.cancelRsvp(activityId, userId);
    const activityForChat = await this.crewActivityRepo.findById(activityId);
    if (activityForChat?.chatConversationId) {
      await this.conversationsRepo.removeParticipant(activityForChat.chatConversationId, userId);
    }
    return result;
  }

  async checkIn(activityId: string, userId: string, method: string = "MANUAL") {
    const activity = await this.getActivityOrThrow(activityId);
    this.ensureActivityOpenForAttendance(activity, "체크인이 불가능한 활동입니다.");
    const normalizedMethod = method || "MANUAL";

    if (normalizedMethod !== "MANUAL") {
      throw new BadRequestException("수동 체크인 전용 경로입니다.");
    }

    const member = await this.crewMemberRepo.findMember(activity.crewId, userId);
    if (!member) {
      throw new ForbiddenException("크루 멤버만 체크인할 수 있습니다.");
    }

    const isAdmin = member.role === "OWNER" || member.role === "ADMIN";
    const isHost = activity.createdBy === userId;
    if (!isAdmin && !(activity.activityType === "POP_UP" && isHost)) {
      throw new ForbiddenException("운영진만 수동 체크인할 수 있습니다.");
    }

    const existing = await this.crewActivityRepo.findAttendance(activityId, userId);
    if (!existing || existing.status !== "RSVP") {
      throw new BadRequestException("먼저 참석 신청을 해주세요.");
    }

    return this.crewActivityRepo.checkIn(activityId, userId, normalizedMethod);
  }

  async qrCheckIn(activityId: string, crewId: string, userId: string, qrCode: string) {
    const activity = await this.getActivityInCrewOrThrow(activityId, crewId);
    this.ensureActivityOpenForAttendance(activity, "체크인이 불가능한 활동입니다.");

    if (activity.qrCode !== qrCode) {
      throw new BadRequestException("유효하지 않은 QR 코드입니다.");
    }

    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member) {
      throw new ForbiddenException("크루 멤버만 체크인할 수 있습니다.");
    }

    const existing = await this.crewActivityRepo.findAttendance(activityId, userId);
    if (!existing || existing.status !== "RSVP") {
      throw new BadRequestException("먼저 참석 신청을 해주세요.");
    }

    return this.crewActivityRepo.checkIn(activityId, userId, "QR");
  }

  async adminCheckIn(
    activityId: string,
    crewId: string,
    adminUserId: string,
    targetUserId: string,
  ) {
    const activity = await this.getActivityInCrewOrThrow(activityId, crewId);

    const adminMember = await this.crewMemberRepo.findMember(crewId, adminUserId);
    if (!adminMember) {
      throw new ForbiddenException("권한이 없습니다.");
    }

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
    const activity = await this.getActivityInCrewOrThrow(activityId, crewId);
    this.ensureActivityMutable(activity);

    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member) {
      throw new ForbiddenException("권한이 없습니다.");
    }

    const isAdmin = member.role === "OWNER" || member.role === "ADMIN";
    const isHost = activity.createdBy === userId;
    if (!isAdmin && !(activity.activityType === "POP_UP" && isHost)) {
      throw new ForbiddenException("활동을 종료할 권한이 없습니다.");
    }

    return this.crewActivityRepo.completeActivity(activityId);
  }

  async cancelActivity(activityId: string, crewId: string, userId: string) {
    const activity = await this.getActivityInCrewOrThrow(activityId, crewId);
    this.ensureActivityMutable(activity);

    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member) {
      throw new ForbiddenException("권한이 없습니다.");
    }

    const isAdmin = member.role === "OWNER" || member.role === "ADMIN";
    const isHost = activity.createdBy === userId;
    if (!isAdmin && !(activity.activityType === "POP_UP" && isHost)) {
      throw new ForbiddenException("활동을 취소할 권한이 없습니다.");
    }

    const result = await this.crewActivityRepo.cancelActivity(activityId);
    if (activity.chatConversationId) {
      await this.conversationsRepo.removeAllParticipants(activity.chatConversationId);
    }
    return result;
  }

  async getAttendees(activityId: string, statusFilter?: string) {
    await this.getActivityOrThrow(activityId);
    return this.crewActivityRepo.getAttendees(activityId, statusFilter);
  }

  async getMemberAttendanceStats(crewId: string, userId: string) {
    await this.getCrewOrThrow(crewId);
    return this.crewActivityRepo.getMemberAttendanceStats(crewId, userId);
  }

  async getMemberAttendanceHistory(
    crewId: string,
    userId: string,
    opts?: { range?: string; type?: string },
  ) {
    await this.getCrewOrThrow(crewId);
    return this.crewActivityRepo.getMemberAttendanceHistory(crewId, userId, opts);
  }

  async getCrewAttendanceStats(
    crewId: string,
    opts?: {
      range?: string;
      type?: string;
      sort?: string;
      order?: string;
      q?: string;
      checkInLte?: number;
      noShowGte?: number;
      limit?: number;
    },
  ) {
    await this.getCrewOrThrow(crewId);
    return this.crewActivityRepo.getCrewAttendanceStats(crewId, opts);
  }

  async getActivityChat(crewId: string, activityId: string, userId: string, cursor?: string) {
    const activity = await this.getActivityInCrewOrThrow(activityId, crewId);
    if (activity.status === "CANCELLED") {
      throw new ForbiddenException("취소된 활동의 채팅은 확인할 수 없습니다.");
    }
    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member || member.status !== "ACTIVE") {
      throw new ForbiddenException("크루 멤버만 채팅에 참여할 수 있습니다.");
    }

    const isAdmin = member.role === "OWNER" || member.role === "ADMIN";
    const isHost = activity.createdBy === userId;
    const canManage = isAdmin || (activity.activityType === "POP_UP" && isHost);
    const myAttendance = activity.attendances.find(
      (attendance: (typeof activity.attendances)[number]) => attendance.userId === userId,
    );
    const canAccessChat =
      myAttendance?.status === "RSVP" || myAttendance?.status === "CHECKED_IN" || canManage;

    if (!canAccessChat) {
      throw new ForbiddenException("참석 후 대화를 확인할 수 있습니다.");
    }

    if (!activity.chatConversationId) {
      return {
        conversation: null,
        messages: [],
        olderCursor: null,
        newerCursor: null,
        firstUnreadMessageId: null,
      };
    }

    const conversation = await this.conversationsRepo.findById(activity.chatConversationId);
    const messageWindow = await this.conversationsRepo.getConversationWindow(
      activity.chatConversationId,
      userId,
      cursor ? { direction: "older", cursor, limit: 40 } : undefined,
    );

    await this.conversationsRepo
      .updateLastRead(activity.chatConversationId, userId)
      .catch(() => {});

    return {
      conversation,
      messages: messageWindow.messages,
      olderCursor: messageWindow.olderCursor,
      newerCursor: messageWindow.newerCursor,
      firstUnreadMessageId: messageWindow.firstUnreadMessageId,
    };
  }

  private async getCrewOrThrow(crewId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }
    return crew;
  }

  private async requireReadableCrew(crewId: string, currentUserId?: string) {
    const crew = await this.getCrewOrThrow(crewId);
    if (crew.isPublic !== false) {
      return crew;
    }

    const member = currentUserId
      ? await this.crewMemberRepo.findMember(crewId, currentUserId)
      : null;
    if (!member || member.status !== "ACTIVE") {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    return crew;
  }

  private async getActivityOrThrow(activityId: string) {
    const activity = await this.crewActivityRepo.findById(activityId);
    if (!activity) {
      throw new NotFoundException("활동을 찾을 수 없습니다.");
    }
    return activity;
  }

  private async getActivityInCrewOrThrow(activityId: string, crewId: string) {
    const activity = await this.getActivityOrThrow(activityId);
    if (activity.crewId !== crewId) {
      throw new BadRequestException("잘못된 크루입니다.");
    }
    return activity;
  }

  private async requireCrewAdmin(crewId: string, userId: string, message: string) {
    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      throw new ForbiddenException(message);
    }
    return member;
  }

  private ensureActivityOpenForAttendance(activity: { status: string }, message: string) {
    if (activity.status !== "SCHEDULED" && activity.status !== "ACTIVE") {
      throw new BadRequestException(message);
    }
  }

  private ensureActivityMutable(activity: { status: string }) {
    if (activity.status === "COMPLETED" || activity.status === "CANCELLED") {
      throw new BadRequestException("이미 종료되거나 취소된 활동입니다.");
    }
  }

  private async addActivityParticipant(activityId: string, userId: string) {
    const activity = await this.crewActivityRepo.findById(activityId);
    if (activity?.chatConversationId) {
      await this.conversationsRepo.addParticipant(activity.chatConversationId, userId);
    }
  }
}
