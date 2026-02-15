import { Test } from "@nestjs/testing";
import { ForbiddenException, NotFoundException, BadRequestException } from "@nestjs/common";
import { CrewsService } from "./crews.service.js";
import { CrewRepository } from "./repositories/crew.repository.js";
import { CrewMemberRepository } from "./repositories/crew-member.repository.js";
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
  findMembers: jest.fn(),
  findMember: jest.fn(),
  countMembers: jest.fn(),
};

const mockDatabaseService = {
  prisma: {
    crewBan: {
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
    it("should delegate to crewRepo.findAll", async () => {
      const options = { isPublic: true, cursor: "crew-100", limit: 20 };
      const mockCrews = [
        { id: "crew-101", name: "Crew A" },
        { id: "crew-102", name: "Crew B" },
      ];
      mockCrewRepository.findAll.mockResolvedValue(mockCrews);

      const result = await service.findAll(options);

      expect(mockCrewRepository.findAll).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockCrews);
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
    it("should add user as MEMBER to crew", async () => {
      const crewId = "crew-123";
      const userId = "user-new";
      const mockCrew = { id: crewId, maxMembers: 50 };
      const mockMembership = { id: "member-new", crewId, userId, role: "MEMBER" };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockDatabaseService.prisma.crewBan.findUnique.mockResolvedValue(null);
      mockCrewMemberRepository.findMember.mockResolvedValue(null);
      mockCrewMemberRepository.countMembers.mockResolvedValue(30);
      mockCrewMemberRepository.addMember.mockResolvedValue(mockMembership);

      const result = await service.join(crewId, userId);

      expect(mockCrewMemberRepository.addMember).toHaveBeenCalledWith(crewId, userId, "MEMBER", "ACTIVE");
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
    it("should remove member if admin kicks member", async () => {
      const crewId = "crew-123";
      const adminUserId = "user-admin";
      const targetUserId = "user-target";
      const mockCrew = { id: crewId };
      const mockAdmin = { role: "ADMIN" };
      const mockTarget = { role: "MEMBER" };
      const mockRemoved = { crewId, userId: targetUserId };

      mockCrewRepository.findById.mockResolvedValue(mockCrew);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockAdmin);
      mockCrewMemberRepository.findMember.mockResolvedValueOnce(mockTarget);
      mockCrewMemberRepository.removeMember.mockResolvedValue(mockRemoved);

      const result = await service.kickMember(crewId, adminUserId, targetUserId);

      expect(mockCrewMemberRepository.removeMember).toHaveBeenCalledWith(crewId, targetUserId);
      expect(result).toEqual(mockRemoved);
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
});
