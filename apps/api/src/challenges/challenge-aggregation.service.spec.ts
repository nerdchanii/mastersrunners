import { Test, TestingModule } from "@nestjs/testing";
import { ChallengeAggregationService } from "./challenge-aggregation.service.js";
import { ChallengeParticipantRepository } from "./repositories/challenge-participant.repository.js";
import { ChallengeRepository } from "./repositories/challenge.repository.js";

describe("ChallengeAggregationService", () => {
  let service: ChallengeAggregationService;
  let participantRepo: ChallengeParticipantRepository;
  let challengeRepo: ChallengeRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChallengeAggregationService,
        {
          provide: ChallengeParticipantRepository,
          useValue: {
            findActiveByUser: jest.fn(),
            updateProgress: jest.fn(),
          },
        },
        {
          provide: ChallengeRepository,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ChallengeAggregationService>(ChallengeAggregationService);
    participantRepo = module.get<ChallengeParticipantRepository>(ChallengeParticipantRepository);
    challengeRepo = module.get<ChallengeRepository>(ChallengeRepository);
  });

  describe("onWorkoutCreated", () => {
    const userId = "user1";
    const workout = {
      distance: 5000, // 5000 meters = 5 km
      duration: 1800, // 30 minutes
      pace: 360, // 6:00/km
      date: new Date("2026-02-16T10:00:00Z"),
    };

    it("should aggregate DISTANCE challenge when workout created", async () => {
      const participation = {
        challengeId: "challenge1",
        userId,
        currentValue: 10,
        isCompleted: false,
        challenge: {
          id: "challenge1",
          type: "DISTANCE" as const,
          targetValue: 100,
          endDate: new Date("2026-12-31"),
        },
      };

      jest.spyOn(participantRepo, "findActiveByUser").mockResolvedValue([participation]);
      jest.spyOn(participantRepo, "updateProgress").mockResolvedValue(participation as any);

      await service.onWorkoutCreated(userId, workout);

      expect(participantRepo.updateProgress).toHaveBeenCalledWith(
        "challenge1",
        userId,
        15, // 10 + 5 (5000m = 5km)
        false
      );
    });

    it("should aggregate FREQUENCY challenge when workout created", async () => {
      const participation = {
        challengeId: "challenge2",
        userId,
        currentValue: 3,
        isCompleted: false,
        challenge: {
          id: "challenge2",
          type: "FREQUENCY" as const,
          targetValue: 10,
          endDate: new Date("2026-12-31"),
        },
      };

      jest.spyOn(participantRepo, "findActiveByUser").mockResolvedValue([participation]);
      jest.spyOn(participantRepo, "updateProgress").mockResolvedValue(participation as any);

      await service.onWorkoutCreated(userId, workout);

      expect(participantRepo.updateProgress).toHaveBeenCalledWith(
        "challenge2",
        userId,
        4, // 3 + 1
        false
      );
    });

    it("should skip STREAK and PACE challenges", async () => {
      const streakParticipation = {
        challengeId: "challenge3",
        userId,
        currentValue: 5,
        isCompleted: false,
        challenge: {
          id: "challenge3",
          type: "STREAK" as const,
          targetValue: 30,
          endDate: new Date("2026-12-31"),
        },
      };

      const paceParticipation = {
        challengeId: "challenge4",
        userId,
        currentValue: 0,
        isCompleted: false,
        challenge: {
          id: "challenge4",
          type: "PACE" as const,
          targetValue: 300, // 5:00/km
          endDate: new Date("2026-12-31"),
        },
      };

      jest.spyOn(participantRepo, "findActiveByUser").mockResolvedValue([streakParticipation, paceParticipation]);
      jest.spyOn(participantRepo, "updateProgress").mockResolvedValue({} as any);

      await service.onWorkoutCreated(userId, workout);

      expect(participantRepo.updateProgress).not.toHaveBeenCalled();
    });

    it("should mark challenge as completed when currentValue >= targetValue", async () => {
      const participation = {
        challengeId: "challenge5",
        userId,
        currentValue: 97,
        isCompleted: false,
        challenge: {
          id: "challenge5",
          type: "DISTANCE" as const,
          targetValue: 100,
          endDate: new Date("2026-12-31"),
        },
      };

      jest.spyOn(participantRepo, "findActiveByUser").mockResolvedValue([participation]);
      jest.spyOn(participantRepo, "updateProgress").mockResolvedValue(participation as any);

      await service.onWorkoutCreated(userId, workout);

      expect(participantRepo.updateProgress).toHaveBeenCalledWith(
        "challenge5",
        userId,
        102, // 97 + 5
        true // completed
      );
    });

    it("should NOT update ended challenges", async () => {
      const participation = {
        challengeId: "challenge6",
        userId,
        currentValue: 10,
        isCompleted: false,
        challenge: {
          id: "challenge6",
          type: "DISTANCE" as const,
          targetValue: 100,
          endDate: new Date("2026-01-01"), // Already ended
        },
      };

      jest.spyOn(participantRepo, "findActiveByUser").mockResolvedValue([participation]);
      jest.spyOn(participantRepo, "updateProgress").mockResolvedValue(participation as any);

      await service.onWorkoutCreated(userId, workout);

      expect(participantRepo.updateProgress).not.toHaveBeenCalled();
    });

    it("should NOT update if no active participations", async () => {
      jest.spyOn(participantRepo, "findActiveByUser").mockResolvedValue([]);
      jest.spyOn(participantRepo, "updateProgress").mockResolvedValue({} as any);

      await service.onWorkoutCreated(userId, workout);

      expect(participantRepo.updateProgress).not.toHaveBeenCalled();
    });

    it("should handle multiple active challenges simultaneously", async () => {
      const distanceParticipation = {
        challengeId: "challenge7",
        userId,
        currentValue: 10,
        isCompleted: false,
        challenge: {
          id: "challenge7",
          type: "DISTANCE" as const,
          targetValue: 100,
          endDate: new Date("2026-12-31"),
        },
      };

      const frequencyParticipation = {
        challengeId: "challenge8",
        userId,
        currentValue: 3,
        isCompleted: false,
        challenge: {
          id: "challenge8",
          type: "FREQUENCY" as const,
          targetValue: 10,
          endDate: new Date("2026-12-31"),
        },
      };

      jest.spyOn(participantRepo, "findActiveByUser").mockResolvedValue([
        distanceParticipation,
        frequencyParticipation,
      ]);
      jest.spyOn(participantRepo, "updateProgress").mockResolvedValue({} as any);

      await service.onWorkoutCreated(userId, workout);

      expect(participantRepo.updateProgress).toHaveBeenCalledTimes(2);
      expect(participantRepo.updateProgress).toHaveBeenCalledWith("challenge7", userId, 15, false);
      expect(participantRepo.updateProgress).toHaveBeenCalledWith("challenge8", userId, 4, false);
    });
  });
});
