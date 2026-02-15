import { Test } from "@nestjs/testing";
import { WorkoutsService } from "./workouts.service";
import { WorkoutRepository } from "./repositories/workout.repository";

const mockWorkoutRepo = {
  findAllByUser: jest.fn(),
  findByIdWithUser: jest.fn(),
  create: jest.fn(),
  updateVisibility: jest.fn(),
};

describe("WorkoutsService", () => {
  let service: WorkoutsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        WorkoutsService,
        { provide: WorkoutRepository, useValue: mockWorkoutRepo },
      ],
    }).compile();

    service = module.get(WorkoutsService);
  });

  describe("findAll", () => {
    it("should delegate to workoutRepo.findAllByUser", async () => {
      const mockData = [{ id: "w1" }];
      mockWorkoutRepo.findAllByUser.mockResolvedValue(mockData);

      const result = await service.findAll("user-1");

      expect(mockWorkoutRepo.findAllByUser).toHaveBeenCalledWith("user-1");
      expect(result).toEqual(mockData);
    });
  });

  describe("create", () => {
    it("should calculate pace correctly: duration / (distance / 1000)", async () => {
      const dto = { distance: 10000, duration: 3600, date: "2026-01-01", memo: "long run", isPublic: true };
      mockWorkoutRepo.create.mockResolvedValue({ id: "w1" });

      await service.create("u1", dto);

      const call = mockWorkoutRepo.create.mock.calls[0][0];
      expect(call.pace).toBe(3600 / (10000 / 1000)); // 360 sec/km
      expect(call.userId).toBe("u1");
      expect(call.distance).toBe(10000);
      expect(call.duration).toBe(3600);
    });

    it("should convert date string to Date object", async () => {
      const dto = { distance: 5000, duration: 1500, date: "2026-06-15" };
      mockWorkoutRepo.create.mockResolvedValue({ id: "w1" });

      await service.create("u1", dto);

      const call = mockWorkoutRepo.create.mock.calls[0][0];
      expect(call.date).toBeInstanceOf(Date);
      expect(call.date.toISOString().startsWith("2026-06-15")).toBe(true);
    });

    it("should default memo to null and isPublic to false", async () => {
      const dto = { distance: 5000, duration: 1500, date: "2026-01-01" };
      mockWorkoutRepo.create.mockResolvedValue({ id: "w1" });

      await service.create("u1", dto);

      const call = mockWorkoutRepo.create.mock.calls[0][0];
      expect(call.memo).toBeNull();
      expect(call.isPublic).toBe(false);
    });
  });

  describe("findOne", () => {
    it("should delegate to workoutRepo.findByIdWithUser", async () => {
      const mockData = { id: "w1", user: { id: "u1" } };
      mockWorkoutRepo.findByIdWithUser.mockResolvedValue(mockData);

      const result = await service.findOne("w1");

      expect(mockWorkoutRepo.findByIdWithUser).toHaveBeenCalledWith("w1");
      expect(result).toEqual(mockData);
    });
  });

  describe("update", () => {
    it("should delegate to workoutRepo.updateVisibility", async () => {
      mockWorkoutRepo.updateVisibility.mockResolvedValue({ id: "w1", isPublic: true });

      await service.update("w1", { isPublic: true });

      expect(mockWorkoutRepo.updateVisibility).toHaveBeenCalledWith("w1", true);
    });
  });
});
