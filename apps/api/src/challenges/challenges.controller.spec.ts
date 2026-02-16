import { Test } from "@nestjs/testing";
import { ChallengesController } from "./challenges.controller.js";
import { ChallengesService } from "./challenges.service.js";

const mockUser = { userId: "user-123" };
const mockReq = { user: mockUser } as any;

const mockChallengesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findMyChallenges: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  join: jest.fn(),
  leave: jest.fn(),
  updateProgress: jest.fn(),
  getLeaderboard: jest.fn(),
  createTeam: jest.fn(),
  getTeams: jest.fn(),
  joinTeam: jest.fn(),
  leaveTeam: jest.fn(),
  removeTeam: jest.fn(),
  getTeamLeaderboard: jest.fn(),
};

describe("ChallengesController", () => {
  let controller: ChallengesController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [ChallengesController],
      providers: [{ provide: ChallengesService, useValue: mockChallengesService }],
    }).compile();
    controller = module.get(ChallengesController);
  });

  // ============ Teams ============

  describe("createTeam", () => {
    it("should call service.createTeam with challengeId, userId, teamName", async () => {
      const expected = { id: "team-1", name: "Team Alpha" };
      mockChallengesService.createTeam.mockResolvedValue(expected);

      const result = await controller.createTeam("challenge-1", mockReq, "Team Alpha");

      expect(mockChallengesService.createTeam).toHaveBeenCalledWith("challenge-1", "user-123", "Team Alpha");
      expect(result).toEqual(expected);
    });
  });

  describe("getTeams", () => {
    it("should call service.getTeams with challengeId", async () => {
      const expected = [{ id: "team-1", name: "Team Alpha" }];
      mockChallengesService.getTeams.mockResolvedValue(expected);

      const result = await controller.getTeams("challenge-1");

      expect(mockChallengesService.getTeams).toHaveBeenCalledWith("challenge-1");
      expect(result).toEqual(expected);
    });
  });

  describe("joinTeam", () => {
    it("should call service.joinTeam with challengeId, userId, teamId", async () => {
      const expected = { challengeTeamId: "team-1" };
      mockChallengesService.joinTeam.mockResolvedValue(expected);

      const result = await controller.joinTeam("challenge-1", "team-1", mockReq);

      expect(mockChallengesService.joinTeam).toHaveBeenCalledWith("challenge-1", "user-123", "team-1");
      expect(result).toEqual(expected);
    });
  });

  describe("leaveTeam", () => {
    it("should call service.leaveTeam with challengeId, userId", async () => {
      const expected = { challengeTeamId: null };
      mockChallengesService.leaveTeam.mockResolvedValue(expected);

      const result = await controller.leaveTeam("challenge-1", mockReq);

      expect(mockChallengesService.leaveTeam).toHaveBeenCalledWith("challenge-1", "user-123");
      expect(result).toEqual(expected);
    });
  });

  describe("removeTeam", () => {
    it("should call service.removeTeam with teamId, userId", async () => {
      const expected = { id: "team-1" };
      mockChallengesService.removeTeam.mockResolvedValue(expected);

      const result = await controller.removeTeam("challenge-1", "team-1", mockReq);

      expect(mockChallengesService.removeTeam).toHaveBeenCalledWith("team-1", "user-123");
      expect(result).toEqual(expected);
    });
  });

  describe("getTeamLeaderboard", () => {
    it("should call service.getTeamLeaderboard with challengeId", async () => {
      const expected = [
        { teamId: "team-1", teamName: "Alpha", totalValue: 500, memberCount: 5 },
      ];
      mockChallengesService.getTeamLeaderboard.mockResolvedValue(expected);

      const result = await controller.getTeamLeaderboard("challenge-1");

      expect(mockChallengesService.getTeamLeaderboard).toHaveBeenCalledWith("challenge-1");
      expect(result).toEqual(expected);
    });
  });
});
