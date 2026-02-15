import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { CrewRepository } from "./repositories/crew.repository.js";
import { CrewMemberRepository } from "./repositories/crew-member.repository.js";
import { DatabaseService } from "../database/database.service.js";
import type { CreateCrewDto } from "./dto/create-crew.dto.js";
import type { UpdateCrewDto } from "./dto/update-crew.dto.js";

@Injectable()
export class CrewsService {
  constructor(
    private readonly crewRepo: CrewRepository,
    private readonly crewMemberRepo: CrewMemberRepository,
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
      throw new BadRequestException("이미 가입한 크루입니다.");
    }

    if (crew.maxMembers !== null) {
      const currentCount = await this.crewMemberRepo.countMembers(crewId);
      if (currentCount >= crew.maxMembers) {
        throw new BadRequestException("크루 정원이 가득 찼습니다.");
      }
    }

    return this.crewMemberRepo.addMember(crewId, userId, "MEMBER", "ACTIVE");
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

  async kickMember(crewId: string, adminUserId: string, targetUserId: string) {
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

    return this.crewMemberRepo.removeMember(crewId, targetUserId);
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
}
