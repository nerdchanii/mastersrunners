import { Test } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { UserRepository } from "../auth/repositories/user.repository";
import { WorkoutRepository } from "../workouts/repositories/workout.repository";

const mockUserRepo = {
  findByIdBasicSelect: jest.fn(),
};

const mockWorkoutRepo = {
  aggregateByUser: jest.fn(),
};

describe("ProfileService", () => {
  let service: ProfileService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: WorkoutRepository, useValue: mockWorkoutRepo },
      ],
    }).compile();

    service = module.get(ProfileService);
  });

  describe("getProfile", () => {
    it("should return user with stats", async () => {
      const mockUser = { id: "u1", email: "t@t.com", name: "Test", profileImage: null, createdAt: new Date() };
      mockUserRepo.findByIdBasicSelect.mockResolvedValue(mockUser);
      mockWorkoutRepo.aggregateByUser.mockResolvedValue({
        _count: 10,
        _sum: { distance: 100000, duration: 36000 },
      });

      const result = await service.getProfile("u1");

      expect(result.user).toEqual(mockUser);
      expect(result.stats.totalWorkouts).toBe(10);
      expect(result.stats.totalDistance).toBe(100000);
      expect(result.stats.totalDuration).toBe(36000);
    });

    it("should calculate averagePace as totalDuration / (totalDistance / 1000)", async () => {
      mockUserRepo.findByIdBasicSelect.mockResolvedValue({ id: "u1" });
      mockWorkoutRepo.aggregateByUser.mockResolvedValue({
        _count: 5,
        _sum: { distance: 50000, duration: 18000 },
      });

      const result = await service.getProfile("u1");

      // 18000 / (50000 / 1000) = 360 sec/km
      expect(result.stats.averagePace).toBe(360);
    });

    it("should return averagePace=0 when distance is 0 (prevent division by zero)", async () => {
      mockUserRepo.findByIdBasicSelect.mockResolvedValue({ id: "u1" });
      mockWorkoutRepo.aggregateByUser.mockResolvedValue({
        _count: 0,
        _sum: { distance: null, duration: null },
      });

      const result = await service.getProfile("u1");

      expect(result.stats.averagePace).toBe(0);
      expect(result.stats.totalDistance).toBe(0);
      expect(result.stats.totalDuration).toBe(0);
    });

    it("should throw NotFoundException when user not found", async () => {
      mockUserRepo.findByIdBasicSelect.mockResolvedValue(null);

      await expect(service.getProfile("unknown")).rejects.toThrow(NotFoundException);
    });
  });
});
