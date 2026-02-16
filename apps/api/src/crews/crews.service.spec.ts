import { Test } from "@nestjs/testing";
import { ForbiddenException, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";
import { CrewsService } from "./crews.service.js";
import { CrewRepository } from "./repositories/crew.repository.js";
import { CrewMemberRepository } from "./repositories/crew-member.repository.js";
import { CrewTagRepository } from "./repositories/crew-tag.repository.js";
import { CrewActivityRepository } from "./repositories/crew-activity.repository.js";
import { CrewBanRepository } from "./repositories/crew-ban.repository.js";
import { DatabaseService } from "../database/database.service.js";
import type { CreateCrewDto } from "./dto/create-crew.dto.js";
import type { UpdateCrewDto } from "./dto/update-crew.dto.js";

const mockCrewRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByUser: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

const mockCrewMemberRepository = {
  addMember: jest.fn(),
  removeMember: jest.fn(),
  updateRole: jest.fn(),
  updateStatus: jest.fn(),
  findMembers: jest.fn(),
  findMember: jest.fn(),
  countMembers: jest.fn(),
  findPendingMembers: jest.fn(),
};

const mockCrewTagRepository = {
  create: jest.fn(),
  findByCrewId: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  assignToMember: jest.fn(),
  removeFromMember: jest.fn(),
  findMembersByTag: jest.fn(),
};

const mockCrewActivityRepository = {
  create: jest.fn(),
  findByCrewId: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  checkIn: jest.fn(),
  findAttendance: jest.fn(),
  getAttendees: jest.fn(),
};

const mockCrewBanRepository = {
  create: jest.fn(),
  findByCrewAndUser: jest.fn(),
  findByCrewId: jest.fn(),
  remove: jest.fn(),
  isBanned: jest.fn(),
};

const mockDatabaseService = {
  prisma: {
    crewBan: {
      findUnique: jest.fn(),
    },
    crewMember: {
      findUnique: jest.fn(),
    },
    crewMemberTag: {
      findUnique: jest.fn(),
    },
  },
};

describe("CrewsService", () => {
  let service: CrewsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CrewsService,
        { provide: CrewRepository, useValue: mockCrewRepository },
        { provide: CrewMemberRepository, useValue: mockCrewMemberRepository },
        { provide: CrewTagRepository, useValue: mockCrewTagRepository },
        { provide: CrewActivityRepository, useValue: mockCrewActivityRepository },
        { provide: CrewBanRepository, useValue: mockCrewBanRepository },
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();
    service = module.get(CrewsService);
  });

  describe("create", () => {
    it("should create crew and add creator as OWNER", async () => {
      const userId = "user-123";
      const dto: CreateCrewDto = {
        name: "Morning Runners",
        description: "We run every morning at 6am",
        isPublic: true,
        maxMembers: 50,
      };
      const mockCrew = { id: "crew-new", ...dto, creatorId: userId };
      const mockMembership = { id: "member-1", crewId: "crew-new", userId, role: "OWNER" };

      mockCrewRepository.create.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.addMember.mockResolvedValue(mockMembership);

      const result = await service.create(userId, dto);

      expect(mockCrewRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        description: dto.description || null,
        imageUrl: dto.imageUrl || null,
        creatorId: userId,
        isPublic: dto.isPublic ?? true,
        maxMembers: dto.maxMembers || null,
      });
      expect(mockCrewMemberRepository.addMember).toHaveBeenCalledWith("crew-new", userId, "OWNER", "ACTIVE");
      expect(result).toEqual(mockCrew);
    });

    it("should create crew with minimal fields", async () => {
      const userId = "user-456";
      const dto: CreateCrewDto = { name: "Weekend Warriors" };
      const mockCrew = { id: "crew-minimal", name: "Weekend Warriors", creatorId: userId };

      mockCrewRepository.create.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.addMember.mockResolvedValue({});

      const result = await service.create(userId, dto);

      expect(mockCrewRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        description: null,
        imageUrl: null,
        creatorId: userId,
        isPublic: true,
        maxMembers: null,
      });
      expect(result).toEqual(mockCrew);
    });
  });

  describe("findOne", () => {
    it("should return crew if found and not deleted", async () => {
      const crewId = "crew-123";
      const mockCrew = { id: crewId, name: "Morning Runners", deletedAt: null };
      mockCrewRepository.findById.mockResolvedValue(mockCrew);

      const result = await service.findOne(crewId);

      expect(mockCrewRepository.findById).toHaveBeenCalledWith(crewId);
      expect(result).toEqual(mockCrew);
    });

    it("should throw NotFoundException if crew not found", async () => {
      mockCrewRepository.findById.mockResolvedValue(null);

      await expect(service.findOne("non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findAll", () => {
    it("should delegate to crewRepo.findAll and return { data, nextCursor }", async () => {
      const options = { isPublic: true, cursor: "crew-100", limit: 20 };
      const mockResponse = {
        data: [
          { id: "crew-101", name: "Crew A" },
          { id: "crew-102", name: "Crew B" },
        ],
        nextCursor: null,
      };
      mockCrewRepository.findAll.mockResolvedValue(mockResponse);

      const result = await service.findAll(options);

      expect(mockCrewRepository.findAll).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("findMyCrews", () => {
    it("should delegate to crewRepo.findByUser", async () => {
      const userId = "user-123";
      const mockCrews = [
        { id: "crew-1", name: "Morning Runners" },
        { id: "crew-2", name: "Weekend Warriors" },
      ];
      mockCrewRepository.findByUser.mockResolvedValue(mockCrews);

      const result = await service.findMyCrews(userId);

      expect(mockCrewRepository.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockCrews);
    });
  });

  describe("update", () => {
    it("should update crew if user is OWNER", async () => {
      const crewId = "crew-123";
      const userId = "user-owner";
      const dto: UpdateCrewDto = { name: "Updated Crew Name", maxMembers: 100 };
      const mockCrew = { id: crewId, creatorId: userId };
      const mockMember = { role: "OWNER" };
      const mockUpdated = { id: crewId, ...dto };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);
      mockCrewRepository.update.mockResolvedValue(mockUpdated);

      const result = await service.update(crewId, userId, dto);

      expect(mockCrewRepository.update).toHaveBeenCalledWith(crewId, dto);
      expect(result).toEqual(mockUpdated);
    });

    it("should update crew if user is ADMIN", async () => {
      const crewId = "crew-123";
      const userId = "user-admin";
      const dto: UpdateCrewDto = { description: "Updated description" };
      const mockCrew = { id: crewId, creatorId: "other-user" };
      const mockMember = { role: "ADMIN" };
      const mockUpdated = { id: crewId, ...dto };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);
      mockCrewRepository.update.mockResolvedValue(mockUpdated);

      const result = await service.update(crewId, userId, dto);

      expect(result).toEqual(mockUpdated);
    });

    it("should throw NotFoundException if crew not found", async () => {
      mockCrewRepository.findById.mockResolvedValue(null);

      await expect(service.update("non-existent", "user-123", {})).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if user is not OWNER or ADMIN", async () => {
      const crewId = "crew-123";
      const userId = "user-member";
      const mockCrew = { id: crewId, creatorId: "other-user" };
      const mockMember = { role: "MEMBER" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);

      await expect(service.update(crewId, userId, {})).rejects.toThrow(ForbiddenException);
    });
  });

  describe("remove", () => {
    it("should soft delete crew if user is OWNER", async () => {
      const crewId = "crew-123";
      const userId = "user-owner";
      const mockCrew = { id: crewId, creatorId: userId };
      const mockMember = { role: "OWNER" };
      const mockDeleted = { id: crewId, deletedAt: new Date() };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);
      mockCrewRepository.softDelete.mockResolvedValue(mockDeleted);

      const result = await service.remove(crewId, userId);

      expect(mockCrewRepository.softDelete).toHaveBeenCalledWith(crewId);
      expect(result).toEqual(mockDeleted);
    });

    it("should throw NotFoundException if crew not found", async () => {
      mockCrewRepository.findById.mockResolvedValue(null);

      await expect(service.remove("non-existent", "user-123")).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if user is not OWNER", async () => {
      const crewId = "crew-123";
      const userId = "user-admin";
      const mockCrew = { id: crewId, creatorId: "other-user" };
      const mockMember = { role: "ADMIN" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);

      await expect(service.remove(crewId, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("join", () => {
    it("should add user as MEMBER to public crew with ACTIVE status", async () => {
      const crewId = "crew-123";
      const userId = "user-new";
      const mockCrew = { id: crewId, maxMembers: 50, isPublic: true };
      const mockMembership = { id: "member-new", crewId, userId, role: "MEMBER", status: "ACTIVE" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockDatabaseService.prisma.crewBan.findUnique.mockResolvedValue(null);
      mockCrewMemberRepository.findMember.mockResolvedValue(null);
      mockCrewMemberRepository.countMembers.mockResolvedValue(30);
      mockCrewMemberRepository.addMember.mockResolvedValue(mockMembership);

      const result = await service.join(crewId, userId);

      expect(mockCrewMemberRepository.addMember).toHaveBeenCalledWith(crewId, userId, "MEMBER", "ACTIVE");
      expect(result).toEqual(mockMembership);
    });

    it("should create PENDING membership for non-public crews", async () => {
      const crewId = "crew-123";
      const userId = "user-new";
      const mockCrew = { id: crewId, maxMembers: 50, isPublic: false };
      const mockMembership = { id: "member-new", crewId, userId, role: "MEMBER", status: "PENDING" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockDatabaseService.prisma.crewBan.findUnique.mockResolvedValue(null);
      mockCrewMemberRepository.findMember.mockResolvedValue(null);
      mockCrewMemberRepository.addMember.mockResolvedValue(mockMembership);

      const result = await service.join(crewId, userId);

      expect(mockCrewMemberRepository.addMember).toHaveBeenCalledWith(crewId, userId, "MEMBER", "PENDING");
      expect(result).toEqual(mockMembership);
    });

    it("should throw NotFoundException if crew not found", async () => {
      mockCrewRepository.findById.mockResolvedValue(null);

      await expect(service.join("non-existent", "user-123")).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if user is banned", async () => {
      const crewId = "crew-123";
      const userId = "user-banned";
      const mockCrew = { id: crewId };
      const mockBan = { crewId, userId, reason: "Spamming" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockDatabaseService.prisma.crewBan.findUnique.mockResolvedValue(mockBan);

      await expect(service.join(crewId, userId)).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if user is already a member", async () => {
      const crewId = "crew-123";
      const userId = "user-existing";
      const mockCrew = { id: crewId };
      const mockMember = { crewId, userId, status: "ACTIVE" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockDatabaseService.prisma.crewBan.findUnique.mockResolvedValue(null);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);

      await expect(service.join(crewId, userId)).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if user has already requested to join (PENDING)", async () => {
      const crewId = "crew-123";
      const userId = "user-pending";
      const mockCrew = { id: crewId, isPublic: false };
      const mockMember = { crewId, userId, status: "PENDING" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockDatabaseService.prisma.crewBan.findUnique.mockResolvedValue(null);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);

      await expect(service.join(crewId, userId)).rejects.toThrow(BadRequestException);
      await expect(service.join(crewId, userId)).rejects.toThrow("이미 가입 요청 중입니다.");
    });

    it("should allow re-join if user status is LEFT", async () => {
      const crewId = "crew-123";
      const userId = "user-left";
      const mockCrew = { id: crewId, isPublic: true };
      const mockMember = { crewId, userId, status: "LEFT" };
      const mockUpdated = { crewId, userId, status: "ACTIVE" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockDatabaseService.prisma.crewBan.findUnique.mockResolvedValue(null);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);
      mockCrewMemberRepository.updateStatus.mockResolvedValue(mockUpdated);

      const result = await service.join(crewId, userId);

      expect(mockCrewMemberRepository.updateStatus).toHaveBeenCalledWith(crewId, userId, "ACTIVE");
      expect(result).toEqual(mockUpdated);
    });

    it("should throw BadRequestException if crew is at max capacity", async () => {
      const crewId = "crew-123";
      const userId = "user-new";
      const mockCrew = { id: crewId, maxMembers: 50 };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockDatabaseService.prisma.crewBan.findUnique.mockResolvedValue(null);
      mockCrewMemberRepository.findMember.mockResolvedValue(null);
      mockCrewMemberRepository.countMembers.mockResolvedValue(50);

      await expect(service.join(crewId, userId)).rejects.toThrow(BadRequestException);
    });

    it("should allow joining if maxMembers is null", async () => {
      const crewId = "crew-123";
      const userId = "user-new";
      const mockCrew = { id: crewId, maxMembers: null };
      const mockMembership = { id: "member-new", crewId, userId };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockDatabaseService.prisma.crewBan.findUnique.mockResolvedValue(null);
      mockCrewMemberRepository.findMember.mockResolvedValue(null);
      mockCrewMemberRepository.countMembers.mockResolvedValue(1000);
      mockCrewMemberRepository.addMember.mockResolvedValue(mockMembership);

      const result = await service.join(crewId, userId);

      expect(result).toEqual(mockMembership);
    });
  });

  describe("leave", () => {
    it("should remove member from crew", async () => {
      const crewId = "crew-123";
      const userId = "user-member";
      const mockCrew = { id: crewId };
      const mockMember = { role: "MEMBER" };
      const mockRemoved = { crewId, userId };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);
      mockCrewMemberRepository.removeMember.mockResolvedValue(mockRemoved);

      const result = await service.leave(crewId, userId);

      expect(mockCrewMemberRepository.removeMember).toHaveBeenCalledWith(crewId, userId);
      expect(result).toEqual(mockRemoved);
    });

    it("should throw NotFoundException if crew not found", async () => {
      mockCrewRepository.findById.mockResolvedValue(null);

      await expect(service.leave("non-existent", "user-123")).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if user is not a member", async () => {
      const crewId = "crew-123";
      const userId = "user-non-member";
      const mockCrew = { id: crewId };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(null);

      await expect(service.leave(crewId, userId)).rejects.toThrow(BadRequestException);
    });

    it("should throw ForbiddenException if user is OWNER", async () => {
      const crewId = "crew-123";
      const userId = "user-owner";
      const mockCrew = { id: crewId };
      const mockMember = { role: "OWNER" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);

      await expect(service.leave(crewId, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("kickMember", () => {
    it("should remove member and create ban record", async () => {
      const crewId = "crew-123";
      const adminUserId = "user-admin";
      const targetUserId = "user-target";
      const mockCrew = { id: crewId };
      const mockAdmin = { role: "ADMIN" };
      const mockTarget = { role: "MEMBER" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockAdmin);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockTarget);
      mockCrewMemberRepository.removeMember.mockResolvedValue({});
      mockCrewBanRepository.create.mockResolvedValue({});

      const result = await service.kickMember(crewId, adminUserId, targetUserId, "spam");

      expect(mockCrewMemberRepository.removeMember).toHaveBeenCalledWith(crewId, targetUserId);
      expect(mockCrewBanRepository.create).toHaveBeenCalledWith({
        crewId,
        userId: targetUserId,
        bannedBy: adminUserId,
        reason: "spam",
      });
      expect(result).toEqual({ success: true });
    });

    it("should throw NotFoundException if crew not found", async () => {
      mockCrewRepository.findById.mockResolvedValue(null);

      await expect(service.kickMember("non-existent", "user-1", "user-2")).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if requester is not OWNER or ADMIN", async () => {
      const crewId = "crew-123";
      const userId = "user-member";
      const targetUserId = "user-target";
      const mockCrew = { id: crewId };
      const mockMember = { role: "MEMBER" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);

      await expect(service.kickMember(crewId, userId, targetUserId)).rejects.toThrow(ForbiddenException);
    });

    it("should throw BadRequestException if target is not a member", async () => {
      const crewId = "crew-123";
      const adminUserId = "user-admin";
      const targetUserId = "user-non-member";
      const mockCrew = { id: crewId };
      const mockAdmin = { role: "ADMIN" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockAdmin);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(null);

      await expect(service.kickMember(crewId, adminUserId, targetUserId)).rejects.toThrow(BadRequestException);
    });

    it("should throw ForbiddenException if trying to kick OWNER", async () => {
      const crewId = "crew-123";
      const adminUserId = "user-admin";
      const ownerUserId = "user-owner";
      const mockCrew = { id: crewId };
      const mockAdmin = { role: "ADMIN" };
      const mockOwner = { role: "OWNER" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockAdmin);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockOwner);

      await expect(service.kickMember(crewId, adminUserId, ownerUserId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("promoteToAdmin", () => {
    it("should update member role to ADMIN if requester is OWNER", async () => {
      const crewId = "crew-123";
      const ownerId = "user-owner";
      const targetUserId = "user-member";
      const mockCrew = { id: crewId };
      const mockOwner = { role: "OWNER" };
      const mockTarget = { role: "MEMBER" };
      const mockUpdated = { crewId, userId: targetUserId, role: "ADMIN" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockOwner);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockTarget);
      mockCrewMemberRepository.updateRole.mockResolvedValue(mockUpdated);

      const result = await service.promoteToAdmin(crewId, ownerId, targetUserId);

      expect(mockCrewMemberRepository.updateRole).toHaveBeenCalledWith(crewId, targetUserId, "ADMIN");
      expect(result).toEqual(mockUpdated);
    });

    it("should throw NotFoundException if crew not found", async () => {
      mockCrewRepository.findById.mockResolvedValue(null);

      await expect(service.promoteToAdmin("non-existent", "user-1", "user-2")).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if requester is not OWNER", async () => {
      const crewId = "crew-123";
      const userId = "user-admin";
      const targetUserId = "user-member";
      const mockCrew = { id: crewId };
      const mockAdmin = { role: "ADMIN" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockAdmin);

      await expect(service.promoteToAdmin(crewId, userId, targetUserId)).rejects.toThrow(ForbiddenException);
    });

    it("should throw BadRequestException if target is not a member", async () => {
      const crewId = "crew-123";
      const ownerId = "user-owner";
      const targetUserId = "user-non-member";
      const mockCrew = { id: crewId };
      const mockOwner = { role: "OWNER" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockOwner);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(null);

      await expect(service.promoteToAdmin(crewId, ownerId, targetUserId)).rejects.toThrow(BadRequestException);
    });
  });

  describe("demoteToMember", () => {
    it("should update admin role to MEMBER if requester is OWNER", async () => {
      const crewId = "crew-123";
      const ownerId = "user-owner";
      const targetUserId = "user-admin";
      const mockCrew = { id: crewId };
      const mockOwner = { role: "OWNER" };
      const mockTarget = { role: "ADMIN" };
      const mockUpdated = { crewId, userId: targetUserId, role: "MEMBER" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockOwner);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockTarget);
      mockCrewMemberRepository.updateRole.mockResolvedValue(mockUpdated);

      const result = await service.demoteToMember(crewId, ownerId, targetUserId);

      expect(mockCrewMemberRepository.updateRole).toHaveBeenCalledWith(crewId, targetUserId, "MEMBER");
      expect(result).toEqual(mockUpdated);
    });

    it("should throw NotFoundException if crew not found", async () => {
      mockCrewRepository.findById.mockResolvedValue(null);

      await expect(service.demoteToMember("non-existent", "user-1", "user-2")).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if requester is not OWNER", async () => {
      const crewId = "crew-123";
      const userId = "user-admin";
      const targetUserId = "user-other-admin";
      const mockCrew = { id: crewId };
      const mockAdmin = { role: "ADMIN" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockAdmin);

      await expect(service.demoteToMember(crewId, userId, targetUserId)).rejects.toThrow(ForbiddenException);
    });

    it("should throw BadRequestException if target is not a member", async () => {
      const crewId = "crew-123";
      const ownerId = "user-owner";
      const targetUserId = "user-non-member";
      const mockCrew = { id: crewId };
      const mockOwner = { role: "OWNER" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockOwner);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(null);

      await expect(service.demoteToMember(crewId, ownerId, targetUserId)).rejects.toThrow(BadRequestException);
    });
  });

  describe("approveMember", () => {
    it("should change PENDING status to ACTIVE if user is OWNER", async () => {
      const crewId = "crew-123";
      const adminUserId = "user-owner";
      const targetUserId = "user-pending";
      const mockCrew = { id: crewId, maxMembers: null };
      const mockAdmin = { role: "OWNER" };
      const mockTarget = { status: "PENDING" };
      const mockUpdated = { crewId, userId: targetUserId, status: "ACTIVE" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockAdmin);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockTarget);
      mockCrewMemberRepository.updateStatus.mockResolvedValue(mockUpdated);

      const result = await service.approveMember(crewId, adminUserId, targetUserId);

      expect(mockCrewMemberRepository.updateStatus).toHaveBeenCalledWith(crewId, targetUserId, "ACTIVE");
      expect(result).toEqual(mockUpdated);
    });

    it("should change PENDING status to ACTIVE if user is ADMIN", async () => {
      const crewId = "crew-123";
      const adminUserId = "user-admin";
      const targetUserId = "user-pending";
      const mockCrew = { id: crewId, maxMembers: null };
      const mockAdmin = { role: "ADMIN" };
      const mockTarget = { status: "PENDING" };
      const mockUpdated = { crewId, userId: targetUserId, status: "ACTIVE" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockAdmin);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockTarget);
      mockCrewMemberRepository.updateStatus.mockResolvedValue(mockUpdated);

      const result = await service.approveMember(crewId, adminUserId, targetUserId);

      expect(mockCrewMemberRepository.updateStatus).toHaveBeenCalledWith(crewId, targetUserId, "ACTIVE");
      expect(result).toEqual(mockUpdated);
    });

    it("should throw NotFoundException if crew not found", async () => {
      mockCrewRepository.findById.mockResolvedValue(null);

      await expect(service.approveMember("non-existent", "user-1", "user-2")).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if requester is not OWNER or ADMIN", async () => {
      const crewId = "crew-123";
      const userId = "user-member";
      const targetUserId = "user-pending";
      const mockCrew = { id: crewId };
      const mockMember = { role: "MEMBER" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);

      await expect(service.approveMember(crewId, userId, targetUserId)).rejects.toThrow(ForbiddenException);
    });

    it("should throw BadRequestException if target is not a member", async () => {
      const crewId = "crew-123";
      const adminUserId = "user-admin";
      const targetUserId = "user-non-member";
      const mockCrew = { id: crewId };
      const mockAdmin = { role: "ADMIN" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockAdmin);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(null);

      await expect(service.approveMember(crewId, adminUserId, targetUserId)).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if target is not PENDING", async () => {
      const crewId = "crew-123";
      const adminUserId = "user-admin";
      const targetUserId = "user-active";
      const mockCrew = { id: crewId };
      const mockAdmin = { role: "ADMIN" };
      const mockTarget = { status: "ACTIVE" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockAdmin);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockTarget);

      await expect(service.approveMember(crewId, adminUserId, targetUserId)).rejects.toThrow("가입 요청 중인 사용자가 아닙니다.");
    });

    it("should check maxMembers capacity before approving", async () => {
      const crewId = "crew-123";
      const adminUserId = "user-admin";
      const targetUserId = "user-pending";
      const mockCrew = { id: crewId, maxMembers: 50 };
      const mockAdmin = { role: "ADMIN" };
      const mockTarget = { status: "PENDING" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockAdmin);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockTarget);
      mockCrewMemberRepository.countMembers.mockResolvedValue(50);

      await expect(service.approveMember(crewId, adminUserId, targetUserId)).rejects.toThrow("크루 정원이 가득 찼습니다.");
    });
  });

  describe("rejectMember", () => {
    it("should remove PENDING member if user is OWNER", async () => {
      const crewId = "crew-123";
      const adminUserId = "user-owner";
      const targetUserId = "user-pending";
      const mockCrew = { id: crewId };
      const mockAdmin = { role: "OWNER" };
      const mockTarget = { status: "PENDING" };
      const mockRemoved = { crewId, userId: targetUserId };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockAdmin);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockTarget);
      mockCrewMemberRepository.removeMember.mockResolvedValue(mockRemoved);

      const result = await service.rejectMember(crewId, adminUserId, targetUserId);

      expect(mockCrewMemberRepository.removeMember).toHaveBeenCalledWith(crewId, targetUserId);
      expect(result).toEqual(mockRemoved);
    });

    it("should remove PENDING member if user is ADMIN", async () => {
      const crewId = "crew-123";
      const adminUserId = "user-admin";
      const targetUserId = "user-pending";
      const mockCrew = { id: crewId };
      const mockAdmin = { role: "ADMIN" };
      const mockTarget = { status: "PENDING" };
      const mockRemoved = { crewId, userId: targetUserId };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockAdmin);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockTarget);
      mockCrewMemberRepository.removeMember.mockResolvedValue(mockRemoved);

      const result = await service.rejectMember(crewId, adminUserId, targetUserId);

      expect(mockCrewMemberRepository.removeMember).toHaveBeenCalledWith(crewId, targetUserId);
      expect(result).toEqual(mockRemoved);
    });

    it("should throw NotFoundException if crew not found", async () => {
      mockCrewRepository.findById.mockResolvedValue(null);

      await expect(service.rejectMember("non-existent", "user-1", "user-2")).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if requester is not OWNER or ADMIN", async () => {
      const crewId = "crew-123";
      const userId = "user-member";
      const targetUserId = "user-pending";
      const mockCrew = { id: crewId };
      const mockMember = { role: "MEMBER" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);

      await expect(service.rejectMember(crewId, userId, targetUserId)).rejects.toThrow(ForbiddenException);
    });

    it("should throw BadRequestException if target is not a member", async () => {
      const crewId = "crew-123";
      const adminUserId = "user-admin";
      const targetUserId = "user-non-member";
      const mockCrew = { id: crewId };
      const mockAdmin = { role: "ADMIN" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockAdmin);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(null);

      await expect(service.rejectMember(crewId, adminUserId, targetUserId)).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if target is not PENDING", async () => {
      const crewId = "crew-123";
      const adminUserId = "user-admin";
      const targetUserId = "user-active";
      const mockCrew = { id: crewId };
      const mockAdmin = { role: "ADMIN" };
      const mockTarget = { status: "ACTIVE" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockAdmin);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockTarget);

      await expect(service.rejectMember(crewId, adminUserId, targetUserId)).rejects.toThrow("가입 요청 중인 사용자가 아닙니다.");
    });
  });

  describe("getPendingMembers", () => {
    it("should return list of PENDING members if user is OWNER", async () => {
      const crewId = "crew-123";
      const userId = "user-owner";
      const mockCrew = { id: crewId };
      const mockMember = { role: "OWNER" };
      const mockPendingMembers = [
        { id: "member-1", userId: "user-1", status: "PENDING" },
        { id: "member-2", userId: "user-2", status: "PENDING" },
      ];

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);
      mockCrewMemberRepository.findPendingMembers.mockResolvedValue(mockPendingMembers);

      const result = await service.getPendingMembers(crewId, userId);

      expect(mockCrewMemberRepository.findPendingMembers).toHaveBeenCalledWith(crewId);
      expect(result).toEqual(mockPendingMembers);
    });

    it("should return list of PENDING members if user is ADMIN", async () => {
      const crewId = "crew-123";
      const userId = "user-admin";
      const mockCrew = { id: crewId };
      const mockMember = { role: "ADMIN" };
      const mockPendingMembers = [
        { id: "member-1", userId: "user-1", status: "PENDING" },
      ];

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);
      mockCrewMemberRepository.findPendingMembers.mockResolvedValue(mockPendingMembers);

      const result = await service.getPendingMembers(crewId, userId);

      expect(result).toEqual(mockPendingMembers);
    });

    it("should throw NotFoundException if crew not found", async () => {
      mockCrewRepository.findById.mockResolvedValue(null);

      await expect(service.getPendingMembers("non-existent", "user-123")).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if user is not OWNER or ADMIN", async () => {
      const crewId = "crew-123";
      const userId = "user-member";
      const mockCrew = { id: crewId };
      const mockMember = { role: "MEMBER" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);

      await expect(service.getPendingMembers(crewId, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  // ============ Tag Tests ============

  describe("createTag", () => {
    it("should create a tag if user is OWNER", async () => {
      const crewId = "crew-123";
      const userId = "user-owner";
      const mockCrew = { id: crewId };
      const mockMember = { role: "OWNER" };
      const mockTag = { id: "tag-1", crewId, name: "Active", color: "#FF0000" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);
      mockCrewTagRepository.create.mockResolvedValue(mockTag);

      const result = await service.createTag(crewId, userId, "Active", "#FF0000");

      expect(mockCrewTagRepository.create).toHaveBeenCalledWith(crewId, "Active", "#FF0000");
      expect(result).toEqual(mockTag);
    });

    it("should create a tag if user is ADMIN", async () => {
      const crewId = "crew-123";
      const userId = "user-admin";
      const mockCrew = { id: crewId };
      const mockMember = { role: "ADMIN" };
      const mockTag = { id: "tag-2", crewId, name: "New", color: "#00FF00" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);
      mockCrewTagRepository.create.mockResolvedValue(mockTag);

      const result = await service.createTag(crewId, userId, "New");

      expect(result).toEqual(mockTag);
    });

    it("should throw NotFoundException if crew not found", async () => {
      mockCrewRepository.findById.mockResolvedValue(null);

      await expect(service.createTag("non-existent", "user-1", "Tag")).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if user is not OWNER or ADMIN", async () => {
      const crewId = "crew-123";
      const userId = "user-member";
      const mockCrew = { id: crewId };
      const mockMember = { role: "MEMBER" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);

      await expect(service.createTag(crewId, userId, "Tag")).rejects.toThrow(ForbiddenException);
    });
  });

  describe("getTags", () => {
    it("should get all tags for a crew", async () => {
      const crewId = "crew-123";
      const mockCrew = { id: crewId };
      const mockTags = [
        { id: "tag-1", crewId, name: "Active" },
        { id: "tag-2", crewId, name: "New" },
      ];

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewTagRepository.findByCrewId.mockResolvedValue(mockTags);

      const result = await service.getTags(crewId);

      expect(mockCrewTagRepository.findByCrewId).toHaveBeenCalledWith(crewId);
      expect(result).toEqual(mockTags);
    });

    it("should throw NotFoundException if crew not found", async () => {
      mockCrewRepository.findById.mockResolvedValue(null);

      await expect(service.getTags("non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateTag", () => {
    it("should update tag if user is OWNER", async () => {
      const crewId = "crew-123";
      const userId = "user-owner";
      const tagId = "tag-1";
      const mockCrew = { id: crewId };
      const mockMember = { role: "OWNER" };
      const mockUpdated = { id: tagId, crewId, name: "Updated", color: "#0000FF" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);
      mockCrewTagRepository.update.mockResolvedValue(mockUpdated);

      const result = await service.updateTag(tagId, crewId, userId, { name: "Updated", color: "#0000FF" });

      expect(mockCrewTagRepository.update).toHaveBeenCalledWith(tagId, { name: "Updated", color: "#0000FF" });
      expect(result).toEqual(mockUpdated);
    });

    it("should throw ForbiddenException if user is MEMBER", async () => {
      const crewId = "crew-123";
      const userId = "user-member";
      const mockCrew = { id: crewId };
      const mockMember = { role: "MEMBER" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);

      await expect(service.updateTag("tag-1", crewId, userId, { name: "X" })).rejects.toThrow(ForbiddenException);
    });
  });

  describe("deleteTag", () => {
    it("should delete tag if user is ADMIN", async () => {
      const crewId = "crew-123";
      const userId = "user-admin";
      const tagId = "tag-1";
      const mockCrew = { id: crewId };
      const mockMember = { role: "ADMIN" };
      const mockDeleted = { id: tagId, crewId, name: "Old" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);
      mockCrewTagRepository.remove.mockResolvedValue(mockDeleted);

      const result = await service.deleteTag(tagId, crewId, userId);

      expect(mockCrewTagRepository.remove).toHaveBeenCalledWith(tagId);
      expect(result).toEqual(mockDeleted);
    });
  });

  describe("assignTagToMember", () => {
    it("should assign tag to member if user is OWNER", async () => {
      const crewId = "crew-123";
      const adminUserId = "user-owner";
      const memberId = "member-1";
      const tagId = "tag-1";
      const mockCrew = { id: crewId };
      const mockAdmin = { role: "OWNER" };
      const mockTargetMember = { id: memberId, crewId, userId: "user-target" };
      const mockAssigned = { crewMemberId: memberId, crewTagId: tagId };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockAdmin);
      mockDatabaseService.prisma.crewMember.findUnique.mockResolvedValue(mockTargetMember);
      mockDatabaseService.prisma.crewMemberTag.findUnique.mockResolvedValue(null);
      mockCrewTagRepository.assignToMember.mockResolvedValue(mockAssigned);

      const result = await service.assignTagToMember(crewId, adminUserId, memberId, tagId);

      expect(mockCrewTagRepository.assignToMember).toHaveBeenCalledWith(memberId, tagId);
      expect(result).toEqual(mockAssigned);
    });

    it("should throw ConflictException if tag already assigned", async () => {
      const crewId = "crew-123";
      const adminUserId = "user-admin";
      const memberId = "member-1";
      const tagId = "tag-1";
      const mockCrew = { id: crewId };
      const mockAdmin = { role: "ADMIN" };
      const mockTargetMember = { id: memberId, crewId };
      const existing = { crewMemberId: memberId, crewTagId: tagId };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockAdmin);
      mockDatabaseService.prisma.crewMember.findUnique.mockResolvedValue(mockTargetMember);
      mockDatabaseService.prisma.crewMemberTag.findUnique.mockResolvedValue(existing);

      await expect(service.assignTagToMember(crewId, adminUserId, memberId, tagId)).rejects.toThrow(ConflictException);
    });

    it("should throw BadRequestException if member not in crew", async () => {
      const crewId = "crew-123";
      const adminUserId = "user-admin";
      const memberId = "member-other";
      const tagId = "tag-1";
      const mockCrew = { id: crewId };
      const mockAdmin = { role: "ADMIN" };
      const mockTargetMember = { id: memberId, crewId: "other-crew" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockAdmin);
      mockDatabaseService.prisma.crewMember.findUnique.mockResolvedValue(mockTargetMember);

      await expect(service.assignTagToMember(crewId, adminUserId, memberId, tagId)).rejects.toThrow(BadRequestException);
    });
  });

  describe("removeTagFromMember", () => {
    it("should remove tag from member if user is OWNER", async () => {
      const crewId = "crew-123";
      const adminUserId = "user-owner";
      const memberId = "member-1";
      const tagId = "tag-1";
      const mockCrew = { id: crewId };
      const mockAdmin = { role: "OWNER" };
      const mockRemoved = { crewMemberId: memberId, crewTagId: tagId };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockAdmin);
      mockCrewTagRepository.removeFromMember.mockResolvedValue(mockRemoved);

      const result = await service.removeTagFromMember(crewId, adminUserId, memberId, tagId);

      expect(mockCrewTagRepository.removeFromMember).toHaveBeenCalledWith(memberId, tagId);
      expect(result).toEqual(mockRemoved);
    });
  });

  // ============ Activity Tests ============

  describe("createActivity", () => {
    it("should create activity if user is OWNER", async () => {
      const crewId = "crew-123";
      const userId = "user-owner";
      const mockCrew = { id: crewId };
      const mockMember = { role: "OWNER" };
      const activityData = {
        title: "Morning Run",
        description: "5K easy run",
        activityDate: new Date("2026-02-20"),
        location: "Han River",
        latitude: 37.5326,
        longitude: 127.024612,
      };
      const mockActivity = { id: "activity-1", crewId, ...activityData, createdBy: userId, qrCode: expect.any(String) };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);
      mockCrewActivityRepository.create.mockResolvedValue(mockActivity);

      const result = await service.createActivity(crewId, userId, activityData);

      expect(mockCrewActivityRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        crewId,
        ...activityData,
        createdBy: userId,
        qrCode: expect.any(String),
      }));
      expect(result).toEqual(mockActivity);
    });

    it("should throw ForbiddenException if user is MEMBER", async () => {
      const crewId = "crew-123";
      const userId = "user-member";
      const mockCrew = { id: crewId };
      const mockMember = { role: "MEMBER" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);

      await expect(service.createActivity(crewId, userId, {
        title: "Run",
        activityDate: new Date(),
      })).rejects.toThrow(ForbiddenException);
    });
  });

  describe("getActivities", () => {
    it("should get activities with pagination", async () => {
      const crewId = "crew-123";
      const mockCrew = { id: crewId };
      const mockActivities = [
        { id: "activity-1", crewId, title: "Run 1" },
        { id: "activity-2", crewId, title: "Run 2" },
      ];

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewActivityRepository.findByCrewId.mockResolvedValue(mockActivities);

      const result = await service.getActivities(crewId, undefined, 20);

      expect(mockCrewActivityRepository.findByCrewId).toHaveBeenCalledWith(crewId, undefined, 20);
      expect(result).toEqual({ items: mockActivities, nextCursor: null });
    });

    it("should return nextCursor if more items exist", async () => {
      const crewId = "crew-123";
      const mockCrew = { id: crewId };
      const mockActivities = [
        { id: "activity-1", crewId, title: "Run 1" },
        { id: "activity-2", crewId, title: "Run 2" },
        { id: "activity-3", crewId, title: "Run 3" },
      ];

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewActivityRepository.findByCrewId.mockResolvedValue(mockActivities);

      const result = await service.getActivities(crewId, undefined, 2);

      expect(result).toEqual({
        items: [mockActivities[0], mockActivities[1]],
        nextCursor: "activity-2",
      });
    });
  });

  describe("getActivity", () => {
    it("should get activity by id", async () => {
      const activityId = "activity-1";
      const mockActivity = { id: activityId, crewId: "crew-123", title: "Run" };

      mockCrewActivityRepository.findById.mockResolvedValue(mockActivity);

      const result = await service.getActivity(activityId);

      expect(mockCrewActivityRepository.findById).toHaveBeenCalledWith(activityId);
      expect(result).toEqual(mockActivity);
    });

    it("should throw NotFoundException if activity not found", async () => {
      mockCrewActivityRepository.findById.mockResolvedValue(null);

      await expect(service.getActivity("non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateActivity", () => {
    it("should update activity if user is ADMIN", async () => {
      const crewId = "crew-123";
      const userId = "user-admin";
      const activityId = "activity-1";
      const mockCrew = { id: crewId };
      const mockMember = { role: "ADMIN" };
      const updateData = { title: "Updated Run" };
      const mockUpdated = { id: activityId, crewId, ...updateData };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);
      mockCrewActivityRepository.update.mockResolvedValue(mockUpdated);

      const result = await service.updateActivity(activityId, crewId, userId, updateData);

      expect(mockCrewActivityRepository.update).toHaveBeenCalledWith(activityId, updateData);
      expect(result).toEqual(mockUpdated);
    });
  });

  describe("deleteActivity", () => {
    it("should delete activity if user is OWNER", async () => {
      const crewId = "crew-123";
      const userId = "user-owner";
      const activityId = "activity-1";
      const mockCrew = { id: crewId };
      const mockMember = { role: "OWNER" };
      const mockDeleted = { id: activityId };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);
      mockCrewActivityRepository.remove.mockResolvedValue(mockDeleted);

      const result = await service.deleteActivity(activityId, crewId, userId);

      expect(mockCrewActivityRepository.remove).toHaveBeenCalledWith(activityId);
      expect(result).toEqual(mockDeleted);
    });
  });

  describe("checkIn", () => {
    it("should check in member to activity", async () => {
      const activityId = "activity-1";
      const userId = "user-member";
      const crewId = "crew-123";
      const mockActivity = { id: activityId, crewId };
      const mockMember = { crewId, userId, role: "MEMBER" };
      const mockAttendance = { id: "attendance-1", activityId, userId, method: "QR" };

      mockCrewActivityRepository.findById.mockResolvedValue(mockActivity);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);
      mockCrewActivityRepository.findAttendance.mockResolvedValue(null);
      mockCrewActivityRepository.checkIn.mockResolvedValue(mockAttendance);

      const result = await service.checkIn(activityId, userId);

      expect(mockCrewActivityRepository.checkIn).toHaveBeenCalledWith(activityId, userId, "QR");
      expect(result).toEqual(mockAttendance);
    });

    it("should throw ConflictException if already checked in", async () => {
      const activityId = "activity-1";
      const userId = "user-member";
      const mockActivity = { id: activityId, crewId: "crew-123" };
      const mockMember = { crewId: "crew-123", userId };
      const existing = { id: "attendance-1", activityId, userId };

      mockCrewActivityRepository.findById.mockResolvedValue(mockActivity);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);
      mockCrewActivityRepository.findAttendance.mockResolvedValue(existing);

      await expect(service.checkIn(activityId, userId)).rejects.toThrow(ConflictException);
    });

    it("should throw ForbiddenException if not a crew member", async () => {
      const activityId = "activity-1";
      const userId = "user-outsider";
      const mockActivity = { id: activityId, crewId: "crew-123" };

      mockCrewActivityRepository.findById.mockResolvedValue(mockActivity);
      mockCrewMemberRepository.findMember.mockResolvedValue(null);

      await expect(service.checkIn(activityId, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("getAttendees", () => {
    it("should get all attendees for activity", async () => {
      const activityId = "activity-1";
      const mockActivity = { id: activityId, crewId: "crew-123" };
      const mockAttendees = [
        { id: "attendance-1", userId: "user-1", checkedAt: new Date() },
        { id: "attendance-2", userId: "user-2", checkedAt: new Date() },
      ];

      mockCrewActivityRepository.findById.mockResolvedValue(mockActivity);
      mockCrewActivityRepository.getAttendees.mockResolvedValue(mockAttendees);

      const result = await service.getAttendees(activityId);

      expect(mockCrewActivityRepository.getAttendees).toHaveBeenCalledWith(activityId);
      expect(result).toEqual(mockAttendees);
    });

    it("should throw NotFoundException if activity not found", async () => {
      mockCrewActivityRepository.findById.mockResolvedValue(null);

      await expect(service.getAttendees("non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  // ============ Ban Tests ============

  describe("unbanMember", () => {
    it("should unban a banned user", async () => {
      const crewId = "crew-123";
      const adminUserId = "user-admin";
      const targetUserId = "user-banned";
      const mockCrew = { id: crewId };
      const mockAdmin = { role: "ADMIN" };
      const mockBan = { id: "ban-1", crewId, userId: targetUserId };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockAdmin);
      mockCrewBanRepository.findByCrewAndUser.mockResolvedValue(mockBan);
      mockCrewBanRepository.remove.mockResolvedValue(mockBan);

      const result = await service.unbanMember(crewId, adminUserId, targetUserId);

      expect(mockCrewBanRepository.findByCrewAndUser).toHaveBeenCalledWith(crewId, targetUserId);
      expect(mockCrewBanRepository.remove).toHaveBeenCalledWith(crewId, targetUserId);
      expect(result).toEqual({ success: true });
    });

    it("should throw NotFoundException if crew not found", async () => {
      mockCrewRepository.findById.mockResolvedValue(null);

      await expect(service.unbanMember("non-existent", "user-1", "user-2")).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if requester is not OWNER or ADMIN", async () => {
      const crewId = "crew-123";
      const userId = "user-member";
      const mockCrew = { id: crewId };
      const mockMember = { role: "MEMBER" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);

      await expect(service.unbanMember(crewId, userId, "user-banned")).rejects.toThrow(ForbiddenException);
    });

    it("should throw NotFoundException if user is not banned", async () => {
      const crewId = "crew-123";
      const adminUserId = "user-admin";
      const mockCrew = { id: crewId };
      const mockAdmin = { role: "ADMIN" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockAdmin);
      mockCrewBanRepository.findByCrewAndUser.mockResolvedValue(null);

      await expect(service.unbanMember(crewId, adminUserId, "user-not-banned")).rejects.toThrow(NotFoundException);
    });
  });

  describe("getBannedMembers", () => {
    it("should return banned members list if user is OWNER", async () => {
      const crewId = "crew-123";
      const userId = "user-owner";
      const mockCrew = { id: crewId };
      const mockMember = { role: "OWNER" };
      const mockBans = [
        { id: "ban-1", crewId, userId: "user-1", reason: "spam" },
        { id: "ban-2", crewId, userId: "user-2", reason: "harassment" },
      ];

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);
      mockCrewBanRepository.findByCrewId.mockResolvedValue(mockBans);

      const result = await service.getBannedMembers(crewId, userId);

      expect(mockCrewBanRepository.findByCrewId).toHaveBeenCalledWith(crewId);
      expect(result).toEqual(mockBans);
    });

    it("should throw NotFoundException if crew not found", async () => {
      mockCrewRepository.findById.mockResolvedValue(null);

      await expect(service.getBannedMembers("non-existent", "user-1")).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if requester is not OWNER or ADMIN", async () => {
      const crewId = "crew-123";
      const userId = "user-member";
      const mockCrew = { id: crewId };
      const mockMember = { role: "MEMBER" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValue(mockMember);

      await expect(service.getBannedMembers(crewId, userId)).rejects.toThrow(ForbiddenException);
    });
  });
});
