import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

import { ConversationsRepository } from "../conversations/repositories/conversations.repository.js";
import { CrewBoardsService } from "../crew-boards/crew-boards.service.js";
import { DatabaseService } from "../database/database.service.js";

import type { CreateCrewDto } from "./dto/create-crew.dto.js";
import type { UpdateCrewDto } from "./dto/update-crew.dto.js";
import { CrewActivitiesService } from "./internal/crew-activities.service.js";
import { CrewMembershipService } from "./internal/crew-membership.service.js";
import { CrewReadService } from "./internal/crew-read.service.js";
import { CrewTagsService } from "./internal/crew-tags.service.js";
import { CrewRepository } from "./repositories/crew.repository.js";
import { CrewActivityRepository } from "./repositories/crew-activity.repository.js";
import { CrewBanRepository } from "./repositories/crew-ban.repository.js";
import { CrewMemberRepository } from "./repositories/crew-member.repository.js";
import { CrewTagRepository } from "./repositories/crew-tag.repository.js";

@Injectable()
export class CrewsService {
  private readonly membershipService: CrewMembershipService;
  private readonly tagsService: CrewTagsService;
  private readonly activitiesService: CrewActivitiesService;
  private readonly readService: CrewReadService;

  constructor(
    private readonly crewRepo: CrewRepository,
    private readonly crewMemberRepo: CrewMemberRepository,
    private readonly crewTagRepo: CrewTagRepository,
    private readonly crewActivityRepo: CrewActivityRepository,
    private readonly crewBanRepo: CrewBanRepository,
    private readonly db: DatabaseService,
    private readonly conversationsRepo: ConversationsRepository,
    private readonly crewBoardsService: CrewBoardsService,
  ) {
    this.membershipService = new CrewMembershipService(
      crewRepo,
      crewMemberRepo,
      crewBanRepo,
      conversationsRepo,
    );
    this.tagsService = new CrewTagsService(crewRepo, crewMemberRepo, crewTagRepo, db);
    this.activitiesService = new CrewActivitiesService(
      crewRepo,
      crewMemberRepo,
      crewActivityRepo,
      conversationsRepo,
    );
    this.readService = new CrewReadService(crewRepo, crewMemberRepo, conversationsRepo, db);
  }

  private normalizeNullableString(value: string | null | undefined) {
    if (value === undefined) return undefined;
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private resolveProfileImageUrl(profileImageUrl?: string | null, legacyImageUrl?: string | null) {
    if (profileImageUrl !== undefined) {
      return this.normalizeNullableString(profileImageUrl);
    }
    if (legacyImageUrl !== undefined) {
      return this.normalizeNullableString(legacyImageUrl);
    }
    return undefined;
  }

  async create(userId: string, dto: CreateCrewDto) {
    const profileImageUrl = this.resolveProfileImageUrl(dto.profileImageUrl, dto.imageUrl) ?? null;

    const crew = await this.crewRepo.create({
      name: dto.name,
      description: dto.description || null,
      imageUrl: profileImageUrl,
      coverImageUrl: this.normalizeNullableString(dto.coverImageUrl) ?? null,
      creatorId: userId,
      isPublic: dto.isPublic ?? true,
      maxMembers: dto.maxMembers || null,
      location: this.normalizeNullableString(dto.location) ?? null,
      region: this.normalizeNullableString(dto.region) ?? null,
      subRegion: this.normalizeNullableString(dto.subRegion) ?? null,
    });

    await this.crewMemberRepo.addMember(crew.id, userId, "OWNER", "ACTIVE");

    const chat = await this.conversationsRepo.createGroupConversation("CREW", { crewId: crew.id });
    await this.crewRepo.updateChatConversationId(crew.id, chat.id);
    await this.conversationsRepo.addParticipant(chat.id, userId);

    await this.crewBoardsService.createDefaultBoard(crew.id);

    return crew;
  }

  async findOne(id: string, currentUserId?: string) {
    const crew = await this.crewRepo.findById(id);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }
    if (crew.isPublic === false) {
      const member = currentUserId ? await this.crewMemberRepo.findMember(id, currentUserId) : null;
      if (!member || member.status !== "ACTIVE") {
        throw new NotFoundException("크루를 찾을 수 없습니다.");
      }
    }
    return crew;
  }

  async getInviteLink(crewId: string, userId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (
      !member ||
      member.status !== "ACTIVE" ||
      (member.role !== "OWNER" && member.role !== "ADMIN")
    ) {
      throw new ForbiddenException("크루 운영진만 초대 링크를 공유할 수 있습니다.");
    }

    return {
      path: `/crews/${crewId}?invite=1`,
    };
  }

  async findAll(options: { isPublic?: boolean; cursor?: string; limit?: number }) {
    return this.crewRepo.findAll(options);
  }

  async findMyCrews(userId: string) {
    return this.crewRepo.findByUser(userId);
  }

  async findVisibleProfileCrews(targetUserId: string, currentUserId?: string) {
    if (currentUserId && currentUserId === targetUserId) {
      return this.crewRepo.findByUser(targetUserId);
    }

    return this.crewRepo.findPublicByUser(targetUserId);
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

    return this.crewRepo.update(id, {
      name: dto.name,
      description: dto.description,
      imageUrl: this.resolveProfileImageUrl(dto.profileImageUrl, dto.imageUrl),
      coverImageUrl: this.normalizeNullableString(dto.coverImageUrl),
      isPublic: dto.isPublic,
      maxMembers: dto.maxMembers,
      location: this.normalizeNullableString(dto.location),
      region: this.normalizeNullableString(dto.region),
      subRegion: this.normalizeNullableString(dto.subRegion),
    });
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
    return this.membershipService.join(crewId, userId);
  }

  async leave(crewId: string, userId: string) {
    return this.membershipService.leave(crewId, userId);
  }

  async kickMember(crewId: string, adminUserId: string, targetUserId: string, reason?: string) {
    return this.membershipService.kickMember(crewId, adminUserId, targetUserId, reason);
  }

  async promoteToAdmin(crewId: string, ownerId: string, targetUserId: string) {
    return this.membershipService.promoteToAdmin(crewId, ownerId, targetUserId);
  }

  async demoteToMember(crewId: string, ownerId: string, targetUserId: string) {
    return this.membershipService.demoteToMember(crewId, ownerId, targetUserId);
  }

  async approveMember(crewId: string, adminUserId: string, targetUserId: string) {
    return this.membershipService.approveMember(crewId, adminUserId, targetUserId);
  }

  async rejectMember(crewId: string, adminUserId: string, targetUserId: string) {
    return this.membershipService.rejectMember(crewId, adminUserId, targetUserId);
  }

  async getPendingMembers(crewId: string, userId: string) {
    return this.membershipService.getPendingMembers(crewId, userId);
  }

  async createTag(crewId: string, userId: string, name: string, color?: string) {
    return this.tagsService.createTag(crewId, userId, name, color);
  }

  async getTags(crewId: string) {
    return this.tagsService.getTags(crewId);
  }

  async updateTag(
    tagId: string,
    crewId: string,
    userId: string,
    data: { name?: string; color?: string },
  ) {
    return this.tagsService.updateTag(tagId, crewId, userId, data);
  }

  async deleteTag(tagId: string, crewId: string, userId: string) {
    return this.tagsService.deleteTag(tagId, crewId, userId);
  }

  async assignTagToMember(crewId: string, adminUserId: string, memberId: string, tagId: string) {
    return this.tagsService.assignTagToMember(crewId, adminUserId, memberId, tagId);
  }

  async removeTagFromMember(crewId: string, adminUserId: string, memberId: string, tagId: string) {
    return this.tagsService.removeTagFromMember(crewId, adminUserId, memberId, tagId);
  }

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
    },
  ) {
    return this.activitiesService.createActivity(crewId, userId, data);
  }

  async getActivities(
    crewId: string,
    opts?: { cursor?: string; limit?: number; type?: string; status?: string },
    currentUserId?: string,
  ) {
    return this.activitiesService.getActivities(crewId, opts, currentUserId);
  }

  async getActivity(activityId: string) {
    return this.activitiesService.getActivity(activityId);
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
    },
  ) {
    return this.activitiesService.updateActivity(activityId, crewId, userId, data);
  }

  async deleteActivity(activityId: string, crewId: string, userId: string) {
    return this.activitiesService.deleteActivity(activityId, crewId, userId);
  }

  async rsvp(activityId: string, crewId: string, userId: string) {
    return this.activitiesService.rsvp(activityId, crewId, userId);
  }

  async cancelRsvp(activityId: string, crewId: string, userId: string) {
    return this.activitiesService.cancelRsvp(activityId, crewId, userId);
  }

  async checkIn(activityId: string, userId: string, method: string = "MANUAL") {
    return this.activitiesService.checkIn(activityId, userId, method);
  }

  async qrCheckIn(activityId: string, crewId: string, userId: string, qrCode: string) {
    return this.activitiesService.qrCheckIn(activityId, crewId, userId, qrCode);
  }

  async adminCheckIn(
    activityId: string,
    crewId: string,
    adminUserId: string,
    targetUserId: string,
  ) {
    return this.activitiesService.adminCheckIn(activityId, crewId, adminUserId, targetUserId);
  }

  async completeActivity(activityId: string, crewId: string, userId: string) {
    return this.activitiesService.completeActivity(activityId, crewId, userId);
  }

  async cancelActivity(activityId: string, crewId: string, userId: string) {
    return this.activitiesService.cancelActivity(activityId, crewId, userId);
  }

  async getAttendees(activityId: string, statusFilter?: string) {
    return this.activitiesService.getAttendees(activityId, statusFilter);
  }

  async getMemberAttendanceStats(crewId: string, userId: string) {
    return this.activitiesService.getMemberAttendanceStats(crewId, userId);
  }

  async getCrewAttendanceStats(crewId: string, opts?: { month?: string; type?: string }) {
    return this.activitiesService.getCrewAttendanceStats(crewId, opts);
  }

  async explore(options: { region?: string; subRegion?: string; sort?: string; cursor?: string }) {
    return this.readService.explore(options);
  }

  async recommend(userId: string) {
    return this.readService.recommend(userId);
  }

  async getRegions() {
    return this.readService.getRegions();
  }

  async getSubRegions(region: string) {
    return this.readService.getSubRegions(region);
  }

  async unbanMember(crewId: string, adminUserId: string, targetUserId: string) {
    return this.membershipService.unbanMember(crewId, adminUserId, targetUserId);
  }

  async getBannedMembers(crewId: string, userId: string) {
    return this.membershipService.getBannedMembers(crewId, userId);
  }

  async getCrewChat(crewId: string, userId: string, cursor?: string) {
    return this.readService.getCrewChat(crewId, userId, cursor);
  }

  async createCrewPost(
    crewId: string,
    userId: string,
    data: { content: string; visibility?: string },
  ) {
    return this.readService.createCrewPost(crewId, userId, data);
  }

  async getCrewPosts(crewId: string, cursor?: string, currentUserId?: string) {
    return this.readService.getCrewPosts(crewId, cursor, currentUserId);
  }

  async getCrewProfile(crewId: string, currentUserId?: string) {
    return this.readService.getCrewProfile(crewId, currentUserId);
  }

  async getActivityChat(crewId: string, activityId: string, userId: string, cursor?: string) {
    return this.activitiesService.getActivityChat(crewId, activityId, userId, cursor);
  }
}
