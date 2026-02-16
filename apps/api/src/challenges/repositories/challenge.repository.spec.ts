import { Test } from "@nestjs/testing";
import { ChallengeRepository } from "./challenge.repository.js";
import { DatabaseService } from "../../database/database.service.js";

const mockPrisma = {
  challenge: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe("ChallengeRepository", () => {
  let repository: ChallengeRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ChallengeRepository,
        { provide: DatabaseService, useValue: { prisma: mockPrisma } },
      ],
    }).compile();
    repository = module.get(ChallengeRepository);
  });

  describe("create", () => {
    it("should create challenge with all fields", async () => {
      const createData = {
        title: "100km Challenge",
        description: "Run 100km in a month",
        type: "DISTANCE",
        targetValue: 100000,
        targetUnit: "KM",
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-03-31"),
        creatorId: "user-123",
        crewId: "crew-123",
        isPublic: true,
        imageUrl: "https://example.com/challenge.jpg",
      };
      const mockCreated = { id: "challenge-new", ...createData, createdAt: new Date(), updatedAt: new Date() };
      mockPrisma.challenge.create.mockResolvedValue(mockCreated);

      const result = await repository.create(createData);

      expect(mockPrisma.challenge.create).toHaveBeenCalledWith({ data: createData });
      expect(result).toEqual(mockCreated);
    });

    it("should create challenge with minimal fields", async () => {
      const createData = {
        title: "Daily Run",
        type: "FREQUENCY",
        targetValue: 30,
        targetUnit: "COUNT",
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-03-31"),
        creatorId: "user-123",
        isPublic: false,
      };
      const mockCreated = { id: "challenge-new", ...createData, createdAt: new Date(), updatedAt: new Date() };
      mockPrisma.challenge.create.mockResolvedValue(mockCreated);

      const result = await repository.create(createData);

      expect(mockPrisma.challenge.create).toHaveBeenCalledWith({ data: createData });
      expect(result).toEqual(mockCreated);
    });
  });

  describe("findById", () => {
    it("should find challenge by id with participants and teams", async () => {
      const challengeId = "challenge-123";
      const mockChallenge = {
        id: challengeId,
        title: "100km Challenge",
        participants: [
          { id: "p1", userId: "user-1", user: { id: "user-1", name: "runner1" } },
        ],
        teams: [{ id: "team-1", name: "Team A" }],
      };
      mockPrisma.challenge.findUnique.mockResolvedValue(mockChallenge);

      const result = await repository.findById(challengeId);

      expect(mockPrisma.challenge.findUnique).toHaveBeenCalledWith({
        where: { id: challengeId },
        include: {
          participants: { include: { user: true } },
          teams: true,
          creator: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          _count: {
            select: {
              participants: true,
            },
          },
        },
      });
      expect(result).toEqual(mockChallenge);
    });

    it("should return null if challenge not found", async () => {
      mockPrisma.challenge.findUnique.mockResolvedValue(null);

      const result = await repository.findById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should find all public challenges with cursor pagination", async () => {
      const options = { isPublic: true, cursor: "challenge-10", limit: 20 };
      const mockChallenges = [
        { id: "challenge-11", title: "Challenge 11", isPublic: true },
        { id: "challenge-12", title: "Challenge 12", isPublic: true },
      ];
      mockPrisma.challenge.findMany.mockResolvedValue(mockChallenges);

      const result = await repository.findAll(options);

      expect(mockPrisma.challenge.findMany).toHaveBeenCalledWith({
        where: { isPublic: true },
        cursor: { id: "challenge-10" },
        skip: 1,
        take: 21,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              participants: true,
            },
          },
        },
      });
      expect(result).toMatchObject({ data: mockChallenges, nextCursor: null, hasMore: false });
    });

    it("should find challenges by crewId", async () => {
      const options = { crewId: "crew-123", limit: 10 };
      const mockChallenges = [{ id: "challenge-1", crewId: "crew-123" }];
      mockPrisma.challenge.findMany.mockResolvedValue(mockChallenges);

      const result = await repository.findAll(options);

      expect(mockPrisma.challenge.findMany).toHaveBeenCalledWith({
        where: { crewId: "crew-123" },
        take: 11,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              participants: true,
            },
          },
        },
      });
      expect(result).toMatchObject({ data: mockChallenges, nextCursor: null, hasMore: false });
    });

    it("should find all challenges without filters", async () => {
      const options = {};
      const mockChallenges = [
        { id: "challenge-1", title: "Challenge 1" },
        { id: "challenge-2", title: "Challenge 2" },
      ];
      mockPrisma.challenge.findMany.mockResolvedValue(mockChallenges);

      const result = await repository.findAll(options);

      expect(mockPrisma.challenge.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: "desc" },
        take: 21,
        include: {
          _count: {
            select: {
              participants: true,
            },
          },
        },
      });
      expect(result).toMatchObject({ data: mockChallenges, nextCursor: null, hasMore: false });
    });
  });

  describe("findByUser", () => {
    it("should find challenges user participates in", async () => {
      const userId = "user-123";
      const mockChallenges = [
        { id: "challenge-1", title: "Challenge 1" },
        { id: "challenge-2", title: "Challenge 2" },
      ];
      mockPrisma.challenge.findMany.mockResolvedValue(mockChallenges);

      const result = await repository.findByUser(userId);

      expect(mockPrisma.challenge.findMany).toHaveBeenCalledWith({
        where: { participants: { some: { userId } } },
        take: 21,
        orderBy: { createdAt: "desc" },
        include: {
          participants: {
            where: { userId },
            select: { currentValue: true },
          },
          _count: {
            select: {
              participants: true,
            },
          },
        },
      });
      expect(result).toEqual({
        data: mockChallenges,
        nextCursor: null,
        hasMore: false,
      });
    });
  });

  describe("update", () => {
    it("should update challenge with provided fields", async () => {
      const challengeId = "challenge-123";
      const updateData = {
        title: "Updated Title",
        description: "Updated Description",
        imageUrl: "https://example.com/new.jpg",
      };
      const mockUpdated = { id: challengeId, ...updateData, updatedAt: new Date() };
      mockPrisma.challenge.update.mockResolvedValue(mockUpdated);

      const result = await repository.update(challengeId, updateData);

      expect(mockPrisma.challenge.update).toHaveBeenCalledWith({
        where: { id: challengeId },
        data: updateData,
      });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe("remove", () => {
    it("should hard delete challenge by id", async () => {
      const challengeId = "challenge-123";
      const mockDeleted = { id: challengeId, title: "Deleted Challenge" };
      mockPrisma.challenge.delete.mockResolvedValue(mockDeleted);

      const result = await repository.remove(challengeId);

      expect(mockPrisma.challenge.delete).toHaveBeenCalledWith({ where: { id: challengeId } });
      expect(result).toEqual(mockDeleted);
    });
  });
});
