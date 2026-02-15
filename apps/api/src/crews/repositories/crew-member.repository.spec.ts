import { Test } from "@nestjs/testing";
import { CrewMemberRepository } from "./crew-member.repository.js";
import { DatabaseService } from "../../database/database.service.js";

const mockPrisma = {
  crewMember: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
};

describe("CrewMemberRepository", () => {
  let repository: CrewMemberRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CrewMemberRepository,
        { provide: DatabaseService, useValue: { prisma: mockPrisma } },
      ],
    }).compile();
    repository = module.get(CrewMemberRepository);
  });

  describe("addMember", () => {
    it("should add member with default role and status", async () => {
      const crewId = "crew-123";
      const userId = "user-456";
      const mockCreated = {
        id: "member-new",
        crewId,
        userId,
        role: "MEMBER",
        status: "ACTIVE",
        joinedAt: new Date(),
      };
      mockPrisma.crewMember.create.mockResolvedValue(mockCreated);

      const result = await repository.addMember(crewId, userId);

      expect(mockPrisma.crewMember.create).toHaveBeenCalledWith({
        data: { crewId, userId, role: "MEMBER", status: "ACTIVE" },
      });
      expect(result).toEqual(mockCreated);
    });

    it("should add member with custom role and status", async () => {
      const crewId = "crew-123";
      const userId = "user-456";
      const mockCreated = {
        id: "member-new",
        crewId,
        userId,
        role: "ADMIN",
        status: "PENDING",
        joinedAt: new Date(),
      };
      mockPrisma.crewMember.create.mockResolvedValue(mockCreated);

      const result = await repository.addMember(crewId, userId, "ADMIN", "PENDING");

      expect(mockPrisma.crewMember.create).toHaveBeenCalledWith({
        data: { crewId, userId, role: "ADMIN", status: "PENDING" },
      });
      expect(result).toEqual(mockCreated);
    });

    it("should add owner member", async () => {
      const crewId = "crew-123";
      const userId = "user-owner";
      const mockCreated = {
        id: "member-owner",
        crewId,
        userId,
        role: "OWNER",
        status: "ACTIVE",
        joinedAt: new Date(),
      };
      mockPrisma.crewMember.create.mockResolvedValue(mockCreated);

      const result = await repository.addMember(crewId, userId, "OWNER", "ACTIVE");

      expect(mockPrisma.crewMember.create).toHaveBeenCalledWith({
        data: { crewId, userId, role: "OWNER", status: "ACTIVE" },
      });
      expect(result).toEqual(mockCreated);
    });
  });

  describe("removeMember", () => {
    it("should delete crew member by crewId and userId", async () => {
      const crewId = "crew-123";
      const userId = "user-456";
      const mockDeleted = {
        id: "member-123",
        crewId,
        userId,
        role: "MEMBER",
        status: "ACTIVE",
      };
      mockPrisma.crewMember.delete.mockResolvedValue(mockDeleted);

      const result = await repository.removeMember(crewId, userId);

      expect(mockPrisma.crewMember.delete).toHaveBeenCalledWith({
        where: { crewId_userId: { crewId, userId } },
      });
      expect(result).toEqual(mockDeleted);
    });
  });

  describe("updateRole", () => {
    it("should update member role", async () => {
      const crewId = "crew-123";
      const userId = "user-456";
      const newRole = "ADMIN";
      const mockUpdated = {
        id: "member-123",
        crewId,
        userId,
        role: newRole,
        status: "ACTIVE",
      };
      mockPrisma.crewMember.update.mockResolvedValue(mockUpdated);

      const result = await repository.updateRole(crewId, userId, newRole);

      expect(mockPrisma.crewMember.update).toHaveBeenCalledWith({
        where: { crewId_userId: { crewId, userId } },
        data: { role: newRole },
      });
      expect(result).toEqual(mockUpdated);
    });

    it("should promote member to owner", async () => {
      const crewId = "crew-123";
      const userId = "user-456";
      const mockUpdated = {
        id: "member-123",
        crewId,
        userId,
        role: "OWNER",
        status: "ACTIVE",
      };
      mockPrisma.crewMember.update.mockResolvedValue(mockUpdated);

      const result = await repository.updateRole(crewId, userId, "OWNER");

      expect(mockPrisma.crewMember.update).toHaveBeenCalledWith({
        where: { crewId_userId: { crewId, userId } },
        data: { role: "OWNER" },
      });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe("findMembers", () => {
    it("should find all members with user info", async () => {
      const crewId = "crew-123";
      const mockMembers = [
        {
          id: "member-1",
          crewId,
          userId: "user-1",
          role: "OWNER",
          status: "ACTIVE",
          user: { id: "user-1", name: "owner" },
        },
        {
          id: "member-2",
          crewId,
          userId: "user-2",
          role: "MEMBER",
          status: "ACTIVE",
          user: { id: "user-2", name: "member" },
        },
      ];
      mockPrisma.crewMember.findMany.mockResolvedValue(mockMembers);

      const result = await repository.findMembers(crewId);

      expect(mockPrisma.crewMember.findMany).toHaveBeenCalledWith({
        where: { crewId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      });
      expect(result).toEqual(mockMembers);
    });

    it("should find members by status filter", async () => {
      const crewId = "crew-123";
      const mockActiveMembers = [
        {
          id: "member-1",
          crewId,
          userId: "user-1",
          role: "OWNER",
          status: "ACTIVE",
          user: { id: "user-1", name: "owner" },
        },
      ];
      mockPrisma.crewMember.findMany.mockResolvedValue(mockActiveMembers);

      const result = await repository.findMembers(crewId, "ACTIVE");

      expect(mockPrisma.crewMember.findMany).toHaveBeenCalledWith({
        where: { crewId, status: "ACTIVE" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      });
      expect(result).toEqual(mockActiveMembers);
    });

    it("should return empty array if no members found", async () => {
      mockPrisma.crewMember.findMany.mockResolvedValue([]);

      const result = await repository.findMembers("crew-empty");

      expect(result).toEqual([]);
    });
  });

  describe("findMember", () => {
    it("should find specific member by crewId and userId", async () => {
      const crewId = "crew-123";
      const userId = "user-456";
      const mockMember = {
        id: "member-123",
        crewId,
        userId,
        role: "MEMBER",
        status: "ACTIVE",
      };
      mockPrisma.crewMember.findUnique.mockResolvedValue(mockMember);

      const result = await repository.findMember(crewId, userId);

      expect(mockPrisma.crewMember.findUnique).toHaveBeenCalledWith({
        where: { crewId_userId: { crewId, userId } },
      });
      expect(result).toEqual(mockMember);
    });

    it("should return null if member not found", async () => {
      mockPrisma.crewMember.findUnique.mockResolvedValue(null);

      const result = await repository.findMember("crew-123", "user-nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("countMembers", () => {
    it("should count active members in crew", async () => {
      const crewId = "crew-123";
      mockPrisma.crewMember.count.mockResolvedValue(42);

      const result = await repository.countMembers(crewId);

      expect(mockPrisma.crewMember.count).toHaveBeenCalledWith({
        where: { crewId, status: "ACTIVE" },
      });
      expect(result).toBe(42);
    });

    it("should return zero if no members", async () => {
      mockPrisma.crewMember.count.mockResolvedValue(0);

      const result = await repository.countMembers("crew-empty");

      expect(result).toBe(0);
    });
  });
});
