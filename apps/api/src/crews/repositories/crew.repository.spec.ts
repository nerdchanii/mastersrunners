import { Test } from "@nestjs/testing";
import { CrewRepository } from "./crew.repository.js";
import { DatabaseService } from "../../database/database.service.js";

const mockPrisma = {
  crew: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
};

describe("CrewRepository", () => {
  let repository: CrewRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CrewRepository,
        { provide: DatabaseService, useValue: { prisma: mockPrisma } },
      ],
    }).compile();
    repository = module.get(CrewRepository);
  });

  describe("create", () => {
    it("should create crew with all fields", async () => {
      const createData = {
        name: "Morning Runners",
        description: "We run every morning at 6am",
        imageUrl: "https://example.com/crew.jpg",
        creatorId: "user-123",
        isPublic: true,
        maxMembers: 50,
      };
      const mockCreated = {
        id: "crew-new",
        ...createData,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.crew.create.mockResolvedValue(mockCreated);

      const result = await repository.create(createData);

      expect(mockPrisma.crew.create).toHaveBeenCalledWith({ data: createData });
      expect(result).toEqual(mockCreated);
    });

    it("should create crew with minimal fields", async () => {
      const createData = {
        name: "Weekend Warriors",
        creatorId: "user-456",
      };
      const mockCreated = {
        id: "crew-new",
        ...createData,
        description: null,
        imageUrl: null,
        isPublic: true,
        maxMembers: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.crew.create.mockResolvedValue(mockCreated);

      const result = await repository.create(createData);

      expect(mockPrisma.crew.create).toHaveBeenCalledWith({ data: createData });
      expect(result).toEqual(mockCreated);
    });
  });

  describe("findById", () => {
    it("should find crew by id with includes and soft delete filter", async () => {
      const crewId = "crew-123";
      const mockCrew = {
        id: crewId,
        name: "Morning Runners",
        description: "We run every morning",
        deletedAt: null,
        members: [
          { id: "member-1", userId: "user-1", role: "OWNER", user: { id: "user-1", name: "john" } },
          { id: "member-2", userId: "user-2", role: "MEMBER", user: { id: "user-2", name: "jane" } },
        ],
        tags: [
          { id: "tag-1", name: "Beginner", color: "#3B82F6" },
        ],
      };
      mockPrisma.crew.findUnique.mockResolvedValue(mockCrew);

      const result = await repository.findById(crewId);

      expect(mockPrisma.crew.findUnique).toHaveBeenCalledWith({
        where: { id: crewId, deletedAt: null },
        include: {
          members: {
            where: { status: "ACTIVE" },
            include: { user: { select: { id: true, name: true, profileImage: true } } },
          },
          tags: true,
          creator: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          _count: {
            select: {
              members: { where: { status: "ACTIVE" } },
            },
          },
        },
      });
      expect(result).toEqual(mockCrew);
    });

    it("should return null if crew not found or deleted", async () => {
      mockPrisma.crew.findUnique.mockResolvedValue(null);

      const result = await repository.findById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return { data, nextCursor } with cursor pagination", async () => {
      const options = { isPublic: true, cursor: "crew-100", limit: 20 };
      // 21개 반환 → hasMore=true
      const mockCrews = Array.from({ length: 21 }, (_, i) => ({
        id: `crew-${101 + i}`,
        name: `Crew ${i}`,
        isPublic: true,
        deletedAt: null,
      }));
      mockPrisma.crew.findMany.mockResolvedValue(mockCrews);

      const result = await repository.findAll(options);

      expect(mockPrisma.crew.findMany).toHaveBeenCalledWith({
        where: { isPublic: true, deletedAt: null },
        take: 21,
        skip: 1,
        cursor: { id: "crew-100" },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { members: { where: { status: "ACTIVE" } } } },
          creator: { select: { id: true, name: true, profileImage: true } },
        },
      });
      expect(result.data).toHaveLength(20);
      expect(result.nextCursor).toBe("crew-120");
    });

    it("should return nextCursor=null when no more items", async () => {
      const mockCrews = [
        { id: "crew-1", name: "Crew A", deletedAt: null },
        { id: "crew-2", name: "Crew B", deletedAt: null },
      ];
      mockPrisma.crew.findMany.mockResolvedValue(mockCrews);

      const result = await repository.findAll({});

      expect(mockPrisma.crew.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        take: 21,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { members: { where: { status: "ACTIVE" } } } },
          creator: { select: { id: true, name: true, profileImage: true } },
        },
      });
      expect(result.data).toEqual(mockCrews);
      expect(result.nextCursor).toBeNull();
    });

    it("should return nextCursor=null when exactly limit items", async () => {
      const options = { isPublic: true, limit: 2 };
      const mockCrews = [
        { id: "crew-1", name: "Crew A", isPublic: true, deletedAt: null },
        { id: "crew-2", name: "Crew B", isPublic: true, deletedAt: null },
      ];
      mockPrisma.crew.findMany.mockResolvedValue(mockCrews);

      const result = await repository.findAll(options);

      expect(mockPrisma.crew.findMany).toHaveBeenCalledWith({
        where: { isPublic: true, deletedAt: null },
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { members: { where: { status: "ACTIVE" } } } },
          creator: { select: { id: true, name: true, profileImage: true } },
        },
      });
      expect(result.data).toHaveLength(2);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe("findByUser", () => {
    it("should find all crews where user is active member", async () => {
      const userId = "user-123";
      const mockCrews = [
        { id: "crew-1", name: "Morning Runners", deletedAt: null },
        { id: "crew-2", name: "Weekend Warriors", deletedAt: null },
      ];
      mockPrisma.crew.findMany.mockResolvedValue(mockCrews);

      const result = await repository.findByUser(userId);

      expect(mockPrisma.crew.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          members: { some: { userId, status: "ACTIVE" } },
        },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { members: { where: { status: "ACTIVE" } } } },
          creator: { select: { id: true, name: true, profileImage: true } },
        },
      });
      expect(result).toEqual(mockCrews);
    });

    it("should return empty array if user is not member of any crew", async () => {
      mockPrisma.crew.findMany.mockResolvedValue([]);

      const result = await repository.findByUser("user-no-crews");

      expect(result).toEqual([]);
    });
  });

  describe("update", () => {
    it("should update crew with provided fields", async () => {
      const crewId = "crew-123";
      const updateData = {
        name: "Updated Crew Name",
        description: "Updated description",
        maxMembers: 100,
      };
      const mockUpdated = { id: crewId, ...updateData };
      mockPrisma.crew.update.mockResolvedValue(mockUpdated);

      const result = await repository.update(crewId, updateData);

      expect(mockPrisma.crew.update).toHaveBeenCalledWith({
        where: { id: crewId },
        data: updateData,
      });
      expect(result).toEqual(mockUpdated);
    });

    it("should update crew with partial fields", async () => {
      const crewId = "crew-123";
      const updateData = { name: "New Name Only" };
      const mockUpdated = { id: crewId, name: "New Name Only" };
      mockPrisma.crew.update.mockResolvedValue(mockUpdated);

      const result = await repository.update(crewId, updateData);

      expect(mockPrisma.crew.update).toHaveBeenCalledWith({
        where: { id: crewId },
        data: updateData,
      });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe("softDelete", () => {
    it("should set deletedAt to current timestamp", async () => {
      const crewId = "crew-123";
      const now = new Date();
      const mockDeleted = { id: crewId, deletedAt: now };
      mockPrisma.crew.update.mockResolvedValue(mockDeleted);

      const result = await repository.softDelete(crewId);

      expect(mockPrisma.crew.update).toHaveBeenCalledWith({
        where: { id: crewId },
        data: { deletedAt: expect.any(Date) },
      });
      expect(result).toEqual(mockDeleted);
    });
  });
});
