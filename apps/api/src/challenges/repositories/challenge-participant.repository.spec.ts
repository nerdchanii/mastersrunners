import { Test } from "@nestjs/testing";
import { ChallengeParticipantRepository } from "./challenge-participant.repository.js";
import { DatabaseService } from "../../database/database.service.js";

const mockPrisma = {
  challengeParticipant: {
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
};

describe("ChallengeParticipantRepository", () => {
  let repository: ChallengeParticipantRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ChallengeParticipantRepository,
        { provide: DatabaseService, useValue: { prisma: mockPrisma } },
      ],
    }).compile();
    repository = module.get(ChallengeParticipantRepository);
  });

  describe("join", () => {
    it("should create participant with teamId", async () => {
      const challengeId = "challenge-123";
      const userId = "user-123";
      const teamId = "team-123";
      const mockParticipant = {
        id: "participant-new",
        challengeId,
        userId,
        teamId,
        currentValue: 0,
        completed: false,
        joinedAt: new Date(),
      };
      mockPrisma.challengeParticipant.create.mockResolvedValue(mockParticipant);

      const result = await repository.join(challengeId, userId, teamId);

      expect(mockPrisma.challengeParticipant.create).toHaveBeenCalledWith({
        data: { challengeId, userId, challengeTeamId: teamId },
      });
      expect(result).toEqual(mockParticipant);
    });

    it("should create participant without teamId", async () => {
      const challengeId = "challenge-123";
      const userId = "user-123";
      const mockParticipant = {
        id: "participant-new",
        challengeId,
        userId,
        teamId: null,
        currentValue: 0,
        completed: false,
        joinedAt: new Date(),
      };
      mockPrisma.challengeParticipant.create.mockResolvedValue(mockParticipant);

      const result = await repository.join(challengeId, userId);

      expect(mockPrisma.challengeParticipant.create).toHaveBeenCalledWith({
        data: { challengeId, userId, challengeTeamId: undefined },
      });
      expect(result).toEqual(mockParticipant);
    });
  });

  describe("leave", () => {
    it("should delete participant by challengeId and userId", async () => {
      const challengeId = "challenge-123";
      const userId = "user-123";
      const mockDeleted = { id: "participant-1", challengeId, userId };
      mockPrisma.challengeParticipant.delete.mockResolvedValue(mockDeleted);

      const result = await repository.leave(challengeId, userId);

      expect(mockPrisma.challengeParticipant.delete).toHaveBeenCalledWith({
        where: { challengeId_userId: { challengeId, userId } },
      });
      expect(result).toEqual(mockDeleted);
    });
  });

  describe("updateProgress", () => {
    it("should update currentValue and completed status", async () => {
      const challengeId = "challenge-123";
      const userId = "user-123";
      const currentValue = 50000;
      const completed = true;
      const mockUpdated = {
        id: "participant-1",
        challengeId,
        userId,
        currentValue,
        completed,
        completedAt: new Date(),
      };
      mockPrisma.challengeParticipant.update.mockResolvedValue(mockUpdated);

      const result = await repository.updateProgress(challengeId, userId, currentValue, completed);

      expect(mockPrisma.challengeParticipant.update).toHaveBeenCalledWith({
        where: { challengeId_userId: { challengeId, userId } },
        data: { currentValue, isCompleted: completed, completedAt: expect.any(Date) },
      });
      expect(result).toEqual(mockUpdated);
    });

    it("should update only currentValue when completed is false", async () => {
      const challengeId = "challenge-123";
      const userId = "user-123";
      const currentValue = 30000;
      const mockUpdated = {
        id: "participant-1",
        challengeId,
        userId,
        currentValue,
        completed: false,
        completedAt: null,
      };
      mockPrisma.challengeParticipant.update.mockResolvedValue(mockUpdated);

      const result = await repository.updateProgress(challengeId, userId, currentValue, false);

      expect(mockPrisma.challengeParticipant.update).toHaveBeenCalledWith({
        where: { challengeId_userId: { challengeId, userId } },
        data: { currentValue, isCompleted: false, completedAt: null },
      });
      expect(result).toEqual(mockUpdated);
    });

    it("should update only currentValue when completed not provided", async () => {
      const challengeId = "challenge-123";
      const userId = "user-123";
      const currentValue = 20000;
      const mockUpdated = {
        id: "participant-1",
        challengeId,
        userId,
        currentValue,
        completed: false,
      };
      mockPrisma.challengeParticipant.update.mockResolvedValue(mockUpdated);

      const result = await repository.updateProgress(challengeId, userId, currentValue);

      expect(mockPrisma.challengeParticipant.update).toHaveBeenCalledWith({
        where: { challengeId_userId: { challengeId, userId } },
        data: { currentValue },
      });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe("findParticipant", () => {
    it("should find participant by challengeId and userId", async () => {
      const challengeId = "challenge-123";
      const userId = "user-123";
      const mockParticipant = {
        id: "participant-1",
        challengeId,
        userId,
        currentValue: 15000,
        completed: false,
      };
      mockPrisma.challengeParticipant.findUnique.mockResolvedValue(mockParticipant);

      const result = await repository.findParticipant(challengeId, userId);

      expect(mockPrisma.challengeParticipant.findUnique).toHaveBeenCalledWith({
        where: { challengeId_userId: { challengeId, userId } },
      });
      expect(result).toEqual(mockParticipant);
    });

    it("should return null if participant not found", async () => {
      mockPrisma.challengeParticipant.findUnique.mockResolvedValue(null);

      const result = await repository.findParticipant("challenge-123", "user-123");

      expect(result).toBeNull();
    });
  });

  describe("findLeaderboard", () => {
    it("should find participants ordered by currentValue desc with limit", async () => {
      const challengeId = "challenge-123";
      const limit = 10;
      const mockLeaderboard = [
        { id: "p1", userId: "user-1", currentValue: 100000, user: { name: "runner1" } },
        { id: "p2", userId: "user-2", currentValue: 80000, user: { name: "runner2" } },
      ];
      mockPrisma.challengeParticipant.findMany.mockResolvedValue(mockLeaderboard);

      const result = await repository.findLeaderboard(challengeId, limit);

      expect(mockPrisma.challengeParticipant.findMany).toHaveBeenCalledWith({
        where: { challengeId },
        include: { user: { select: { id: true, name: true, profileImage: true } } },
        orderBy: { currentValue: "desc" },
        take: 10,
      });
      expect(result).toEqual(mockLeaderboard);
    });

    it("should find all participants when limit not provided", async () => {
      const challengeId = "challenge-123";
      const mockLeaderboard = [
        { id: "p1", userId: "user-1", currentValue: 100000, user: { name: "runner1" } },
      ];
      mockPrisma.challengeParticipant.findMany.mockResolvedValue(mockLeaderboard);

      const result = await repository.findLeaderboard(challengeId);

      expect(mockPrisma.challengeParticipant.findMany).toHaveBeenCalledWith({
        where: { challengeId },
        include: { user: { select: { id: true, name: true, profileImage: true } } },
        orderBy: { currentValue: "desc" },
        take: undefined,
      });
      expect(result).toEqual(mockLeaderboard);
    });
  });
});
