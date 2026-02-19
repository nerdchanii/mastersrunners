import { Test } from "@nestjs/testing";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { ChallengesService } from "./challenges.service.js";
import { ChallengeRepository } from "./repositories/challenge.repository.js";
import { ChallengeParticipantRepository } from "./repositories/challenge-participant.repository.js";
import { ChallengeTeamRepository } from "./repositories/challenge-team.repository.js";
import type { CreateChallengeDto } from "./dto/create-challenge.dto.js";
import type { UpdateChallengeDto } from "./dto/update-challenge.dto.js";

const mockChallengeRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByUser: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockChallengeParticipantRepository = {
  join: jest.fn(),
  leave: jest.fn(),
  updateProgress: jest.fn(),
  updateTeamId: jest.fn(),
  findParticipant: jest.fn(),
  findLeaderboard: jest.fn(),
};

const mockChallengeTeamRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByChallengeId: jest.fn(),
  remove: jest.fn(),
  getTeamLeaderboard: jest.fn(),
};

describe("ChallengesService", () => {
  let service: ChallengesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ChallengesService,
        { provide: ChallengeRepository, useValue: mockChallengeRepository },
        { provide: ChallengeParticipantRepository, useValue: mockChallengeParticipantRepository },
        { provide: ChallengeTeamRepository, useValue: mockChallengeTeamRepository },
      ],
    }).compile();
    service = module.get(ChallengesService);
  });

  describe("create", () => {
    it("should create challenge and auto-join creator", async () => {
      const userId = "user-123";
      const dto: CreateChallengeDto = {
        title: "100km Challenge",
        description: "Run 100km in a month",
        type: "DISTANCE",
        targetValue: 100000,
        targetUnit: "KM",
        startDate: "2026-03-01",
        endDate: "2026-03-31",
        isPublic: true,
      };
      const mockChallenge = { id: "challenge-new", ...dto, creatorId: userId };
      mockChallengeRepository.create.mockResolvedValue(mockChallenge);
      mockChallengeParticipantRepository.join.mockResolvedValue({ id: "p1", challengeId: "challenge-new", userId });

      const result = await service.create(userId, dto);

      expect(mockChallengeRepository.create).toHaveBeenCalledWith({
        title: dto.title,
        description: dto.description,
        type: dto.type,
        targetValue: dto.targetValue,
        targetUnit: dto.targetUnit,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        creatorId: userId,
        crewId: undefined,
        isPublic: dto.isPublic ?? true,
        imageUrl: undefined,
      });
      expect(mockChallengeParticipantRepository.join).toHaveBeenCalledWith("challenge-new", userId);
      expect(result).toEqual(mockChallenge);
    });

    it("should create challenge with optional fields", async () => {
      const userId = "user-123";
      const dto: CreateChallengeDto = {
        title: "Marathon Pace",
        type: "PACE",
        targetValue: 300,
        targetUnit: "SEC_PER_KM",
        startDate: "2026-03-01",
        endDate: "2026-03-31",
        crewId: "crew-123",
        imageUrl: "https://example.com/challenge.jpg",
      };
      const mockChallenge = { id: "challenge-new", ...dto, creatorId: userId };
      mockChallengeRepository.create.mockResolvedValue(mockChallenge);
      mockChallengeParticipantRepository.join.mockResolvedValue({ id: "p1", challengeId: "challenge-new", userId });

      const result = await service.create(userId, dto);

      expect(mockChallengeRepository.create).toHaveBeenCalledWith({
        title: dto.title,
        description: undefined,
        type: dto.type,
        targetValue: dto.targetValue,
        targetUnit: dto.targetUnit,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        creatorId: userId,
        crewId: dto.crewId,
        isPublic: true,
        imageUrl: dto.imageUrl,
      });
      expect(result).toEqual(mockChallenge);
    });
  });

  describe("findOne", () => {
    it("should return challenge by id", async () => {
      const challengeId = "challenge-123";
      const mockChallenge = {
        id: challengeId,
        title: "100km Challenge",
        description: "Test",
        type: "DISTANCE",
        targetValue: 100000,
        targetUnit: "KM",
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-03-31"),
        isPublic: true,
        creatorId: "user-123",
        creator: { id: "user-123", name: "Test User", profileImage: null },
        _count: { participants: 5 },
        participants: [],
      };
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);

      const result = await service.findOne(challengeId);

      expect(mockChallengeRepository.findById).toHaveBeenCalledWith(challengeId);
      expect(result).toMatchObject({
        id: challengeId,
        title: "100km Challenge",
        type: "DISTANCE",
        targetValue: 100000,
        isPublic: true,
        creatorId: "user-123",
        isJoined: false,
        myProgress: null,
      });
    });

    it("should throw NotFoundException if challenge not found", async () => {
      mockChallengeRepository.findById.mockResolvedValue(null);

      await expect(service.findOne("non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findAll", () => {
    it("should delegate to challengeRepo.findAll with options", async () => {
      const options = { isPublic: true, cursor: "challenge-10", limit: 20 };
      const mockChallenges = [
        {
          id: "challenge-11",
          title: "Challenge 11",
          description: null,
          type: "DISTANCE",
          targetValue: 100000,
          targetUnit: "KM",
          startDate: new Date("2026-03-01"),
          endDate: new Date("2026-03-31"),
          isPublic: true,
          _count: { participants: 5 },
        },
      ];
      mockChallengeRepository.findAll.mockResolvedValue({ data: mockChallenges, nextCursor: null, hasMore: false });

      const result = await service.findAll(options);

      expect(mockChallengeRepository.findAll).toHaveBeenCalledWith(options);
      expect(result).toMatchObject({
        items: expect.arrayContaining([
          expect.objectContaining({ id: "challenge-11", title: "Challenge 11", type: "DISTANCE" }),
        ]),
        nextCursor: null,
        hasMore: false,
      });
    });
  });

  describe("findMyChallenges", () => {
    it("should delegate to challengeRepo.findByUser", async () => {
      const userId = "user-123";
      const mockChallenges = [
        {
          id: "challenge-1",
          title: "Challenge 1",
          description: null,
          type: "DISTANCE",
          targetValue: 100000,
          targetUnit: "KM",
          startDate: new Date("2026-03-01"),
          endDate: new Date("2026-03-31"),
          isPublic: true,
          _count: { participants: 5 },
          participants: [{ currentValue: 50000 }],
        },
      ];
      mockChallengeRepository.findByUser.mockResolvedValue({
        data: mockChallenges,
        nextCursor: null,
        hasMore: false,
      });

      const result = await service.findMyChallenges(userId);

      expect(mockChallengeRepository.findByUser).toHaveBeenCalledWith(userId, undefined);
      expect(result).toMatchObject({
        items: expect.arrayContaining([
          expect.objectContaining({
            id: "challenge-1",
            title: "Challenge 1",
            myProgress: 50000,
          }),
        ]),
        nextCursor: null,
        hasMore: false,
      });
    });
  });

  describe("update", () => {
    it("should update challenge if user is creator", async () => {
      const challengeId = "challenge-123";
      const userId = "user-123";
      const dto: UpdateChallengeDto = { title: "Updated Title", description: "Updated Description" };
      const mockChallenge = { id: challengeId, creatorId: userId };
      const mockUpdated = { ...mockChallenge, ...dto };
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeRepository.update.mockResolvedValue(mockUpdated);

      const result = await service.update(challengeId, userId, dto);

      expect(mockChallengeRepository.findById).toHaveBeenCalledWith(challengeId);
      expect(mockChallengeRepository.update).toHaveBeenCalledWith(challengeId, dto);
      expect(result).toEqual(mockUpdated);
    });

    it("should throw NotFoundException if challenge not found", async () => {
      mockChallengeRepository.findById.mockResolvedValue(null);

      await expect(service.update("non-existent", "user-123", {})).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if user is not creator", async () => {
      const mockChallenge = { id: "challenge-123", creatorId: "user-999" };
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);

      await expect(service.update("challenge-123", "user-123", {})).rejects.toThrow(ForbiddenException);
    });
  });

  describe("remove", () => {
    it("should remove challenge if user is creator", async () => {
      const challengeId = "challenge-123";
      const userId = "user-123";
      const mockChallenge = { id: challengeId, creatorId: userId };
      const mockDeleted = { ...mockChallenge };
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeRepository.remove.mockResolvedValue(mockDeleted);

      const result = await service.remove(challengeId, userId);

      expect(mockChallengeRepository.findById).toHaveBeenCalledWith(challengeId);
      expect(mockChallengeRepository.remove).toHaveBeenCalledWith(challengeId);
      expect(result).toEqual(mockDeleted);
    });

    it("should throw NotFoundException if challenge not found", async () => {
      mockChallengeRepository.findById.mockResolvedValue(null);

      await expect(service.remove("non-existent", "user-123")).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if user is not creator", async () => {
      const mockChallenge = { id: "challenge-123", creatorId: "user-999" };
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);

      await expect(service.remove("challenge-123", "user-123")).rejects.toThrow(ForbiddenException);
    });
  });

  describe("join", () => {
    it("should join challenge if not already joined and dates are valid", async () => {
      const challengeId = "challenge-123";
      const userId = "user-123";
      const mockChallenge = {
        id: challengeId,
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-03-31"),
      };
      const mockParticipant = { id: "p1", challengeId, userId };
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeParticipantRepository.findParticipant.mockResolvedValue(null);
      mockChallengeParticipantRepository.join.mockResolvedValue(mockParticipant);

      const result = await service.join(challengeId, userId);

      expect(mockChallengeRepository.findById).toHaveBeenCalledWith(challengeId);
      expect(mockChallengeParticipantRepository.findParticipant).toHaveBeenCalledWith(challengeId, userId);
      expect(mockChallengeParticipantRepository.join).toHaveBeenCalledWith(challengeId, userId);
      expect(result).toEqual(mockParticipant);
    });

    it("should throw NotFoundException if challenge not found", async () => {
      mockChallengeRepository.findById.mockResolvedValue(null);

      await expect(service.join("non-existent", "user-123")).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if already joined", async () => {
      const mockChallenge = { id: "challenge-123", startDate: new Date("2026-03-01"), endDate: new Date("2026-03-31") };
      const mockParticipant = { id: "p1", challengeId: "challenge-123", userId: "user-123" };
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeParticipantRepository.findParticipant.mockResolvedValue(mockParticipant);

      await expect(service.join("challenge-123", "user-123")).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if challenge has ended", async () => {
      const mockChallenge = {
        id: "challenge-123",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"), // Past date
      };
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeParticipantRepository.findParticipant.mockResolvedValue(null);

      await expect(service.join("challenge-123", "user-123")).rejects.toThrow(BadRequestException);
    });
  });

  describe("leave", () => {
    it("should leave challenge if participating", async () => {
      const challengeId = "challenge-123";
      const userId = "user-123";
      const mockParticipant = { id: "p1", challengeId, userId };
      const mockDeleted = { ...mockParticipant };
      mockChallengeParticipantRepository.findParticipant.mockResolvedValue(mockParticipant);
      mockChallengeParticipantRepository.leave.mockResolvedValue(mockDeleted);

      const result = await service.leave(challengeId, userId);

      expect(mockChallengeParticipantRepository.findParticipant).toHaveBeenCalledWith(challengeId, userId);
      expect(mockChallengeParticipantRepository.leave).toHaveBeenCalledWith(challengeId, userId);
      expect(result).toEqual(mockDeleted);
    });

    it("should throw NotFoundException if not participating", async () => {
      mockChallengeParticipantRepository.findParticipant.mockResolvedValue(null);

      await expect(service.leave("challenge-123", "user-123")).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateProgress", () => {
    it("should update progress and auto-complete when target reached", async () => {
      const challengeId = "challenge-123";
      const userId = "user-123";
      const currentValue = 100000;
      const mockChallenge = { id: challengeId, targetValue: 100000 };
      const mockParticipant = { id: "p1", challengeId, userId, currentValue: 50000 };
      const mockUpdated = { ...mockParticipant, currentValue, completed: true };
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeParticipantRepository.findParticipant.mockResolvedValue(mockParticipant);
      mockChallengeParticipantRepository.updateProgress.mockResolvedValue(mockUpdated);

      const result = await service.updateProgress(challengeId, userId, currentValue);

      expect(mockChallengeRepository.findById).toHaveBeenCalledWith(challengeId);
      expect(mockChallengeParticipantRepository.findParticipant).toHaveBeenCalledWith(challengeId, userId);
      expect(mockChallengeParticipantRepository.updateProgress).toHaveBeenCalledWith(
        challengeId,
        userId,
        currentValue,
        true,
      );
      expect(result).toEqual(mockUpdated);
    });

    it("should update progress without auto-complete when target not reached", async () => {
      const challengeId = "challenge-123";
      const userId = "user-123";
      const currentValue = 50000;
      const mockChallenge = { id: challengeId, targetValue: 100000 };
      const mockParticipant = { id: "p1", challengeId, userId, currentValue: 30000 };
      const mockUpdated = { ...mockParticipant, currentValue, completed: false };
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeParticipantRepository.findParticipant.mockResolvedValue(mockParticipant);
      mockChallengeParticipantRepository.updateProgress.mockResolvedValue(mockUpdated);

      const result = await service.updateProgress(challengeId, userId, currentValue);

      expect(mockChallengeParticipantRepository.updateProgress).toHaveBeenCalledWith(
        challengeId,
        userId,
        currentValue,
        false,
      );
      expect(result).toEqual(mockUpdated);
    });

    it("should throw NotFoundException if challenge not found", async () => {
      mockChallengeRepository.findById.mockResolvedValue(null);

      await expect(service.updateProgress("non-existent", "user-123", 1000)).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if not participating", async () => {
      const mockChallenge = { id: "challenge-123", targetValue: 100000 };
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeParticipantRepository.findParticipant.mockResolvedValue(null);

      await expect(service.updateProgress("challenge-123", "user-123", 1000)).rejects.toThrow(NotFoundException);
    });
  });

  describe("getLeaderboard", () => {
    it("should return leaderboard for challenge", async () => {
      const challengeId = "challenge-123";
      const mockChallenge = { id: challengeId };
      const mockLeaderboard = [
        { id: "p1", userId: "user-1", currentValue: 100000, user: { id: "user-1", name: "User 1", profileImage: null } },
        { id: "p2", userId: "user-2", currentValue: 80000, user: { id: "user-2", name: "User 2", profileImage: null } },
      ];
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeParticipantRepository.findLeaderboard.mockResolvedValue(mockLeaderboard);

      const result = await service.getLeaderboard(challengeId);

      expect(mockChallengeRepository.findById).toHaveBeenCalledWith(challengeId);
      expect(mockChallengeParticipantRepository.findLeaderboard).toHaveBeenCalledWith(challengeId, undefined);
      expect(result).toEqual([
        { rank: 1, progress: 100000, user: { id: "user-1", name: "User 1", profileImage: null } },
        { rank: 2, progress: 80000, user: { id: "user-2", name: "User 2", profileImage: null } },
      ]);
    });

    it("should throw NotFoundException if challenge not found", async () => {
      mockChallengeRepository.findById.mockResolvedValue(null);

      await expect(service.getLeaderboard("non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("createTeam", () => {
    it("should create team if user is challenge creator", async () => {
      const challengeId = "challenge-123";
      const userId = "user-123";
      const teamName = "Team Alpha";
      const mockChallenge = { id: challengeId, creatorId: userId };
      const mockTeam = { id: "team-1", challengeId, name: teamName };
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeParticipantRepository.findParticipant.mockResolvedValue(null);
      mockChallengeTeamRepository.create.mockResolvedValue(mockTeam);

      const result = await service.createTeam(challengeId, userId, teamName);

      expect(mockChallengeRepository.findById).toHaveBeenCalledWith(challengeId);
      expect(mockChallengeTeamRepository.create).toHaveBeenCalledWith(challengeId, teamName);
      expect(result).toEqual(mockTeam);
    });

    it("should create team if user is participant", async () => {
      const challengeId = "challenge-123";
      const userId = "user-999";
      const teamName = "Team Beta";
      const mockChallenge = { id: challengeId, creatorId: "user-creator" };
      const mockParticipant = { id: "p1", challengeId, userId };
      const mockTeam = { id: "team-2", challengeId, name: teamName };
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeParticipantRepository.findParticipant.mockResolvedValue(mockParticipant);
      mockChallengeTeamRepository.create.mockResolvedValue(mockTeam);

      const result = await service.createTeam(challengeId, userId, teamName);

      expect(mockChallengeTeamRepository.create).toHaveBeenCalledWith(challengeId, teamName);
      expect(result).toEqual(mockTeam);
    });

    it("should throw NotFoundException if challenge not found", async () => {
      mockChallengeRepository.findById.mockResolvedValue(null);

      await expect(service.createTeam("non-existent", "user-123", "Team")).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if user is not creator or participant", async () => {
      const mockChallenge = { id: "challenge-123", creatorId: "user-creator" };
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeParticipantRepository.findParticipant.mockResolvedValue(null);

      await expect(service.createTeam("challenge-123", "user-stranger", "Team")).rejects.toThrow(ForbiddenException);
    });
  });

  describe("joinTeam", () => {
    it("should update participant's challengeTeamId", async () => {
      const challengeId = "challenge-123";
      const userId = "user-123";
      const teamId = "team-1";
      const mockChallenge = { id: challengeId };
      const mockParticipant = { id: "p1", challengeId, userId, challengeTeamId: null };
      const mockUpdated = { ...mockParticipant, challengeTeamId: teamId };
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeParticipantRepository.findParticipant.mockResolvedValue(mockParticipant);
      mockChallengeParticipantRepository.updateTeamId.mockResolvedValue(mockUpdated);

      const result = await service.joinTeam(challengeId, userId, teamId);

      expect(mockChallengeRepository.findById).toHaveBeenCalledWith(challengeId);
      expect(mockChallengeParticipantRepository.findParticipant).toHaveBeenCalledWith(challengeId, userId);
      expect(mockChallengeParticipantRepository.updateTeamId).toHaveBeenCalledWith(challengeId, userId, teamId);
      expect(result).toEqual(mockUpdated);
    });

    it("should throw NotFoundException if challenge not found", async () => {
      mockChallengeRepository.findById.mockResolvedValue(null);

      await expect(service.joinTeam("non-existent", "user-123", "team-1")).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if user is not participating", async () => {
      const mockChallenge = { id: "challenge-123" };
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeParticipantRepository.findParticipant.mockResolvedValue(null);

      await expect(service.joinTeam("challenge-123", "user-123", "team-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("leaveTeam", () => {
    it("should set participant's challengeTeamId to null", async () => {
      const challengeId = "challenge-123";
      const userId = "user-123";
      const mockChallenge = { id: challengeId };
      const mockParticipant = { id: "p1", challengeId, userId, challengeTeamId: "team-1" };
      const mockUpdated = { ...mockParticipant, challengeTeamId: null };
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeParticipantRepository.findParticipant.mockResolvedValue(mockParticipant);
      mockChallengeParticipantRepository.updateTeamId.mockResolvedValue(mockUpdated);

      const result = await service.leaveTeam(challengeId, userId);

      expect(mockChallengeRepository.findById).toHaveBeenCalledWith(challengeId);
      expect(mockChallengeParticipantRepository.findParticipant).toHaveBeenCalledWith(challengeId, userId);
      expect(mockChallengeParticipantRepository.updateTeamId).toHaveBeenCalledWith(challengeId, userId, null);
      expect(result).toEqual(mockUpdated);
    });

    it("should throw NotFoundException if challenge not found", async () => {
      mockChallengeRepository.findById.mockResolvedValue(null);

      await expect(service.leaveTeam("non-existent", "user-123")).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if not participating", async () => {
      const mockChallenge = { id: "challenge-123" };
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeParticipantRepository.findParticipant.mockResolvedValue(null);

      await expect(service.leaveTeam("challenge-123", "user-123")).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if not in a team", async () => {
      const mockChallenge = { id: "challenge-123" };
      const mockParticipant = { id: "p1", challengeId: "challenge-123", userId: "user-123", challengeTeamId: null };
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeParticipantRepository.findParticipant.mockResolvedValue(mockParticipant);

      await expect(service.leaveTeam("challenge-123", "user-123")).rejects.toThrow(BadRequestException);
    });
  });

  describe("getTeams", () => {
    it("should return all teams for a challenge", async () => {
      const challengeId = "challenge-123";
      const mockChallenge = { id: challengeId };
      const mockTeams = [
        { id: "team-1", challengeId, name: "Team Alpha" },
        { id: "team-2", challengeId, name: "Team Beta" },
      ];
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeTeamRepository.findByChallengeId.mockResolvedValue(mockTeams);

      const result = await service.getTeams(challengeId);

      expect(mockChallengeRepository.findById).toHaveBeenCalledWith(challengeId);
      expect(mockChallengeTeamRepository.findByChallengeId).toHaveBeenCalledWith(challengeId);
      expect(result).toEqual(mockTeams);
    });

    it("should throw NotFoundException if challenge not found", async () => {
      mockChallengeRepository.findById.mockResolvedValue(null);

      await expect(service.getTeams("non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("removeTeam", () => {
    it("should remove team if user is challenge creator", async () => {
      const teamId = "team-1";
      const challengeId = "challenge-123";
      const userId = "user-123";
      const mockTeam = { id: teamId, challengeId };
      const mockChallenge = { id: challengeId, creatorId: userId };
      const mockDeleted = { ...mockTeam };
      mockChallengeTeamRepository.findById.mockResolvedValue(mockTeam);
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeTeamRepository.remove.mockResolvedValue(mockDeleted);

      const result = await service.removeTeam(teamId, userId);

      expect(mockChallengeTeamRepository.findById).toHaveBeenCalledWith(teamId);
      expect(mockChallengeRepository.findById).toHaveBeenCalledWith(challengeId);
      expect(mockChallengeTeamRepository.remove).toHaveBeenCalledWith(teamId);
      expect(result).toEqual(mockDeleted);
    });

    it("should throw NotFoundException if team not found", async () => {
      mockChallengeTeamRepository.findById.mockResolvedValue(null);

      await expect(service.removeTeam("non-existent", "user-123")).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if user is not challenge creator", async () => {
      const mockTeam = { id: "team-1", challengeId: "challenge-123" };
      const mockChallenge = { id: "challenge-123", creatorId: "user-creator" };
      mockChallengeTeamRepository.findById.mockResolvedValue(mockTeam);
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);

      await expect(service.removeTeam("team-1", "user-stranger")).rejects.toThrow(ForbiddenException);
    });
  });

  describe("getTeamLeaderboard", () => {
    it("should return team leaderboard for a challenge", async () => {
      const challengeId = "challenge-123";
      const mockChallenge = { id: challengeId };
      const mockLeaderboard = [
        { teamId: "team-1", teamName: "Team Alpha", totalValue: 500, memberCount: 5 },
        { teamId: "team-2", teamName: "Team Beta", totalValue: 300, memberCount: 3 },
      ];
      mockChallengeRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengeTeamRepository.getTeamLeaderboard.mockResolvedValue(mockLeaderboard);

      const result = await service.getTeamLeaderboard(challengeId);

      expect(mockChallengeRepository.findById).toHaveBeenCalledWith(challengeId);
      expect(mockChallengeTeamRepository.getTeamLeaderboard).toHaveBeenCalledWith(challengeId);
      expect(result).toEqual(mockLeaderboard);
    });

    it("should throw NotFoundException if challenge not found", async () => {
      mockChallengeRepository.findById.mockResolvedValue(null);

      await expect(service.getTeamLeaderboard("non-existent")).rejects.toThrow(NotFoundException);
    });
  });
});
