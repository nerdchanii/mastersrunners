import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";

import { ConversationsRepository } from "../../conversations/repositories/conversations.repository.js";
import { CrewRepository } from "../repositories/crew.repository.js";
import { CrewBanRepository } from "../repositories/crew-ban.repository.js";
import { CrewMemberRepository } from "../repositories/crew-member.repository.js";

export class CrewMembershipService {
  constructor(
    private readonly crewRepo: CrewRepository,
    private readonly crewMemberRepo: CrewMemberRepository,
    private readonly crewBanRepo: CrewBanRepository,
    private readonly conversationsRepo: ConversationsRepository,
  ) {}

  async join(crewId: string, userId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }

    if (await this.crewBanRepo.isBanned(crewId, userId)) {
      throw new BadRequestException("차단된 사용자는 가입할 수 없습니다.");
    }

    const existingMember = await this.crewMemberRepo.findMember(crewId, userId);
    if (existingMember) {
      if (existingMember.status === "PENDING") {
        throw new BadRequestException("이미 가입 요청 중입니다.");
      }
      if (existingMember.status === "LEFT") {
        const status = crew.isPublic ? "ACTIVE" : "PENDING";
        const result = await this.crewMemberRepo.updateStatus(crewId, userId, status);
        await this.addCrewChatParticipant(crew.chatConversationId, userId, status === "ACTIVE");
        return result;
      }
      throw new BadRequestException("이미 크루 멤버입니다.");
    }

    if (crew.maxMembers !== null) {
      const currentCount = await this.crewMemberRepo.countMembers(crewId);
      if (currentCount >= crew.maxMembers) {
        throw new BadRequestException("크루 정원이 가득 찼습니다.");
      }
    }

    const status = crew.isPublic ? "ACTIVE" : "PENDING";
    const member = await this.crewMemberRepo.addMember(crewId, userId, "MEMBER", status);
    await this.addCrewChatParticipant(crew.chatConversationId, userId, status === "ACTIVE");
    return member;
  }

  async leave(crewId: string, userId: string) {
    const crew = await this.getCrewOrThrow(crewId);
    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member) {
      throw new BadRequestException("크루 멤버가 아닙니다.");
    }
    if (member.role === "OWNER") {
      throw new ForbiddenException("크루 소유자는 탈퇴할 수 없습니다.");
    }

    await this.crewMemberRepo.removeMember(crewId, userId);
    if (crew.chatConversationId) {
      await this.conversationsRepo.removeParticipant(crew.chatConversationId, userId);
    }

    return { success: true };
  }

  async kickMember(crewId: string, adminUserId: string, targetUserId: string, reason?: string) {
    await this.getCrewOrThrow(crewId);
    await this.requireCrewAdmin(crewId, adminUserId, "크루 관리자만 멤버를 추방할 수 있습니다.");

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
    await this.getCrewOrThrow(crewId);
    await this.requireCrewOwner(crewId, ownerId, "크루 소유자만 관리자를 지정할 수 있습니다.");
    await this.requireTargetMember(crewId, targetUserId);
    return this.crewMemberRepo.updateRole(crewId, targetUserId, "ADMIN");
  }

  async demoteToMember(crewId: string, ownerId: string, targetUserId: string) {
    await this.getCrewOrThrow(crewId);
    await this.requireCrewOwner(crewId, ownerId, "크루 소유자만 관리자를 해제할 수 있습니다.");
    await this.requireTargetMember(crewId, targetUserId);
    return this.crewMemberRepo.updateRole(crewId, targetUserId, "MEMBER");
  }

  async approveMember(crewId: string, adminUserId: string, targetUserId: string) {
    const crew = await this.getCrewOrThrow(crewId);
    await this.requireCrewAdmin(crewId, adminUserId, "크루 관리자만 가입을 승인할 수 있습니다.");

    const targetMember = await this.requireTargetMember(crewId, targetUserId);
    if (targetMember.status !== "PENDING") {
      throw new BadRequestException("가입 요청 중인 사용자가 아닙니다.");
    }

    if (crew.maxMembers !== null) {
      const currentCount = await this.crewMemberRepo.countMembers(crewId);
      if (currentCount >= crew.maxMembers) {
        throw new BadRequestException("크루 정원이 가득 찼습니다.");
      }
    }

    const result = await this.crewMemberRepo.updateStatus(crewId, targetUserId, "ACTIVE");
    await this.addCrewChatParticipant(crew.chatConversationId, targetUserId, true);
    return result;
  }

  async rejectMember(crewId: string, adminUserId: string, targetUserId: string) {
    await this.getCrewOrThrow(crewId);
    await this.requireCrewAdmin(crewId, adminUserId, "크루 관리자만 가입을 거절할 수 있습니다.");

    const targetMember = await this.requireTargetMember(crewId, targetUserId);
    if (targetMember.status !== "PENDING") {
      throw new BadRequestException("가입 요청 중인 사용자가 아닙니다.");
    }

    return this.crewMemberRepo.removeMember(crewId, targetUserId);
  }

  async getPendingMembers(crewId: string, userId: string) {
    await this.getCrewOrThrow(crewId);
    await this.requireCrewAdmin(
      crewId,
      userId,
      "크루 관리자만 가입 요청 목록을 조회할 수 있습니다.",
    );
    return this.crewMemberRepo.findPendingMembers(crewId);
  }

  async unbanMember(crewId: string, adminUserId: string, targetUserId: string) {
    await this.getCrewOrThrow(crewId);
    await this.requireCrewAdmin(crewId, adminUserId, "크루 관리자만 차단을 해제할 수 있습니다.");

    const ban = await this.crewBanRepo.findByCrewAndUser(crewId, targetUserId);
    if (!ban) {
      throw new NotFoundException("차단된 사용자가 아닙니다.");
    }

    await this.crewBanRepo.remove(crewId, targetUserId);
    return { success: true };
  }

  async getBannedMembers(crewId: string, userId: string) {
    await this.getCrewOrThrow(crewId);
    await this.requireCrewAdmin(crewId, userId, "크루 관리자만 차단 목록을 조회할 수 있습니다.");
    return this.crewBanRepo.findByCrewId(crewId);
  }

  private async getCrewOrThrow(crewId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }
    return crew;
  }

  private async requireCrewOwner(crewId: string, userId: string, message: string) {
    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member || member.role !== "OWNER") {
      throw new ForbiddenException(message);
    }
    return member;
  }

  private async requireCrewAdmin(crewId: string, userId: string, message: string) {
    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      throw new ForbiddenException(message);
    }
    return member;
  }

  private async requireTargetMember(crewId: string, userId: string) {
    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member) {
      throw new BadRequestException("대상 사용자가 크루 멤버가 아닙니다.");
    }
    return member;
  }

  private async addCrewChatParticipant(
    conversationId: string | null | undefined,
    userId: string,
    shouldAdd: boolean,
  ) {
    if (shouldAdd && conversationId) {
      await this.conversationsRepo.addParticipant(conversationId, userId);
    }
  }
}
