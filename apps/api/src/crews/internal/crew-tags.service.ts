import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";

import { DatabaseService } from "../../database/database.service.js";
import { CrewRepository } from "../repositories/crew.repository.js";
import { CrewMemberRepository } from "../repositories/crew-member.repository.js";
import { CrewTagRepository } from "../repositories/crew-tag.repository.js";

export class CrewTagsService {
  constructor(
    private readonly crewRepo: CrewRepository,
    private readonly crewMemberRepo: CrewMemberRepository,
    private readonly crewTagRepo: CrewTagRepository,
    private readonly db: DatabaseService,
  ) {}

  async createTag(crewId: string, userId: string, name: string, color?: string) {
    await this.getCrewOrThrow(crewId);
    await this.requireCrewAdmin(crewId, userId, "크루 관리자만 태그를 생성할 수 있습니다.");
    return this.crewTagRepo.create(crewId, name, color);
  }

  async getTags(crewId: string) {
    await this.getCrewOrThrow(crewId);
    return this.crewTagRepo.findByCrewId(crewId);
  }

  async updateTag(
    tagId: string,
    crewId: string,
    userId: string,
    data: { name?: string; color?: string },
  ) {
    await this.getCrewOrThrow(crewId);
    await this.requireCrewAdmin(crewId, userId, "크루 관리자만 태그를 수정할 수 있습니다.");
    return this.crewTagRepo.update(tagId, data);
  }

  async deleteTag(tagId: string, crewId: string, userId: string) {
    await this.getCrewOrThrow(crewId);
    await this.requireCrewAdmin(crewId, userId, "크루 관리자만 태그를 삭제할 수 있습니다.");
    return this.crewTagRepo.remove(tagId);
  }

  async assignTagToMember(crewId: string, adminUserId: string, memberId: string, tagId: string) {
    await this.getCrewOrThrow(crewId);
    await this.requireCrewAdmin(crewId, adminUserId, "크루 관리자만 태그를 부여할 수 있습니다.");

    const targetMember = await this.db.prisma.crewMember.findUnique({
      where: { id: memberId },
    });
    if (!targetMember || targetMember.crewId !== crewId) {
      throw new BadRequestException("대상 멤버가 이 크루에 속하지 않습니다.");
    }

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
    await this.getCrewOrThrow(crewId);
    await this.requireCrewAdmin(crewId, adminUserId, "크루 관리자만 태그를 제거할 수 있습니다.");
    return this.crewTagRepo.removeFromMember(memberId, tagId);
  }

  private async getCrewOrThrow(crewId: string) {
    const crew = await this.crewRepo.findById(crewId);
    if (!crew) {
      throw new NotFoundException("크루를 찾을 수 없습니다.");
    }
    return crew;
  }

  private async requireCrewAdmin(crewId: string, userId: string, message: string) {
    const member = await this.crewMemberRepo.findMember(crewId, userId);
    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      throw new ForbiddenException(message);
    }
    return member;
  }
}
