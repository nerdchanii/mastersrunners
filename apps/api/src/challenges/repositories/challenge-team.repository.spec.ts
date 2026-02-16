import { Test } from "@nestjs/testing";
import { ChallengeTeamRepository } from "./challenge-team.repository.js";
import { DatabaseService } from "../../database/database.service.js";

describe("ChallengeTeamRepository", () => {
  let repository: ChallengeTeamRepository;
  let db: DatabaseService;

  const mockDb = {
    prisma: {
      challengeTeam: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
      challengeParticipant: {
        groupBy: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ChallengeTeamRepository,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile();

    repository = module.get(ChallengeTeamRepository);
    db = module.get(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should call prisma.challengeTeam.create with correct data", async () => {
      const challengeId = "challenge-1";
      const name = "Team Alpha";
      const mockTeam = { id: "team-1", challengeId, name, createdAt: new Date() };

      mockDb.prisma.challengeTeam.create.mockResolvedValue(mockTeam);

      const result = await repository.create(challengeId, name);

      expect(mockDb.prisma.challengeTeam.create).toHaveBeenCalledWith({
        data: { challengeId, name },
      });
      expect(result).toEqual(mockTeam);
    });
  });

  describe("findById", () => {
    it("should call prisma.challengeTeam.findUnique with participants included", async () => {
      const teamId = "team-1";
      const mockTeam = {
        id: teamId,
        challengeId: "challenge-1",
        name: "Team Alpha",
        createdAt: new Date(),
        participants: [
          {
            id: "p1",
            userId: "user-1",
            user: { id: "user-1", name: "User One", profileImage: null },
            currentValue: 100,
            isCompleted: false,
          },
        ],
      };

      mockDb.prisma.challengeTeam.findUnique.mockResolvedValue(mockTeam);

      const result = await repository.findById(teamId);

      expect(mockDb.prisma.challengeTeam.findUnique).toHaveBeenCalledWith({
        where: { id: teamId },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockTeam);
    });
  });

  describe("findByChallengeId", () => {
    it("should return all teams for a challenge", async () => {
      const challengeId = "challenge-1";
      const mockTeams = [
        { id: "team-1", challengeId, name: "Team Alpha", createdAt: new Date() },
        { id: "team-2", challengeId, name: "Team Beta", createdAt: new Date() },
      ];

      mockDb.prisma.challengeTeam.findMany.mockResolvedValue(mockTeams);

      const result = await repository.findByChallengeId(challengeId);

      expect(mockDb.prisma.challengeTeam.findMany).toHaveBeenCalledWith({
        where: { challengeId },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockTeams);
    });
  });

  describe("remove", () => {
    it("should delete a team", async () => {
      const teamId = "team-1";
      const mockTeam = { id: teamId, challengeId: "challenge-1", name: "Team Alpha", createdAt: new Date() };

      mockDb.prisma.challengeTeam.delete.mockResolvedValue(mockTeam);

      const result = await repository.remove(teamId);

      expect(mockDb.prisma.challengeTeam.delete).toHaveBeenCalledWith({
        where: { id: teamId },
      });
      expect(result).toEqual(mockTeam);
    });
  });

  describe("getTeamLeaderboard", () => {
    it("should aggregate team scores using groupBy", async () => {
      const challengeId = "challenge-1";
      const mockAggregated = [
        {
          challengeTeamId: "team-1",
          _sum: { currentValue: 500 },
          _count: { userId: 5 },
        },
        {
          challengeTeamId: "team-2",
          _sum: { currentValue: 300 },
          _count: { userId: 3 },
        },
      ];

      const mockTeams = [
        { id: "team-1", name: "Team Alpha" },
        { id: "team-2", name: "Team Beta" },
      ];

      mockDb.prisma.challengeParticipant.groupBy.mockResolvedValue(mockAggregated);
      mockDb.prisma.challengeTeam.findMany.mockResolvedValue(mockTeams);

      const result = await repository.getTeamLeaderboard(challengeId);

      expect(mockDb.prisma.challengeParticipant.groupBy).toHaveBeenCalledWith({
        where: {
          challengeId,
          challengeTeamId: { not: null },
        },
        by: ["challengeTeamId"],
        _sum: { currentValue: true },
        _count: { userId: true },
      });

      expect(mockDb.prisma.challengeTeam.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ["team-1", "team-2"] },
        },
        select: {
          id: true,
          name: true,
        },
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        teamId: "team-1",
        teamName: "Team Alpha",
        totalValue: 500,
        memberCount: 5,
      });
      expect(result[1]).toMatchObject({
        teamId: "team-2",
        teamName: "Team Beta",
        totalValue: 300,
        memberCount: 3,
      });
    });

    it("should return empty array if no teams have participants", async () => {
      const challengeId = "challenge-1";
      mockDb.prisma.challengeParticipant.groupBy.mockResolvedValue([]);

      const result = await repository.getTeamLeaderboard(challengeId);

      expect(result).toEqual([]);
    });
  });
});
