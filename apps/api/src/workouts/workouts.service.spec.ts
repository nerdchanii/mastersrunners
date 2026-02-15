import { Test } from "@nestjs/testing";
import { WorkoutsService } from "./workouts.service";
import { WorkoutRepository } from "./repositories/workout.repository";

const mockWorkoutRepo = {
  findAllByUser: jest.fn(),
  findByIdWithUser: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
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
      const dto = { distance: 10000, duration: 3600, date: "2026-01-01", memo: "long run", visibility: "PUBLIC" };
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

    it("should default optional fields to null/FOLLOWERS when not provided", async () => {
      const dto = { distance: 5000, duration: 1500, date: "2026-01-01" };
      mockWorkoutRepo.create.mockResolvedValue({ id: "w1" });

      await service.create("u1", dto);

      const call = mockWorkoutRepo.create.mock.calls[0][0];
      expect(call.title).toBeNull();
      expect(call.workoutTypeId).toBeNull();
      expect(call.memo).toBeNull();
      expect(call.visibility).toBe("FOLLOWERS");
      expect(call.shoeId).toBeNull();
    });

    it("should pass all optional fields when provided", async () => {
      const dto = {
        distance: 10000,
        duration: 3600,
        date: "2026-01-01",
        title: "Morning Run",
        workoutTypeId: "wt1",
        memo: "Felt great",
        visibility: "PUBLIC",
        shoeId: "shoe1",
      };
      mockWorkoutRepo.create.mockResolvedValue({ id: "w1" });

      await service.create("u1", dto);

      const call = mockWorkoutRepo.create.mock.calls[0][0];
      expect(call.title).toBe("Morning Run");
      expect(call.workoutTypeId).toBe("wt1");
      expect(call.memo).toBe("Felt great");
      expect(call.visibility).toBe("PUBLIC");
      expect(call.shoeId).toBe("shoe1");
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
    it("should build update data object from provided fields", async () => {
      const dto = {
        distance: 12000,
        duration: 4200,
        title: "Updated Run",
        visibility: "PRIVATE",
      };
      mockWorkoutRepo.update.mockResolvedValue({ id: "w1", ...dto });

      await service.update("w1", dto);

      const call = mockWorkoutRepo.update.mock.calls[0][1];
      expect(call.distance).toBe(12000);
      expect(call.duration).toBe(4200);
      expect(call.title).toBe("Updated Run");
      expect(call.visibility).toBe("PRIVATE");
    });

    it("should recalculate pace when both distance and duration are updated", async () => {
      const dto = { distance: 10000, duration: 3500 };
      mockWorkoutRepo.update.mockResolvedValue({ id: "w1" });

      await service.update("w1", dto);

      const call = mockWorkoutRepo.update.mock.calls[0][1];
      expect(call.pace).toBe(3500 / (10000 / 1000)); // 350 sec/km
    });

    it("should convert date string to Date object when updating", async () => {
      const dto = { date: "2026-07-01" };
      mockWorkoutRepo.update.mockResolvedValue({ id: "w1" });

      await service.update("w1", dto);

      const call = mockWorkoutRepo.update.mock.calls[0][1];
      expect(call.date).toBeInstanceOf(Date);
      expect(call.date.toISOString().startsWith("2026-07-01")).toBe(true);
    });

    it("should recalculate pace when only distance is updated", async () => {
      const currentWorkout = { id: "w1", distance: 10000, duration: 3600 };
      mockWorkoutRepo.findByIdWithUser.mockResolvedValue(currentWorkout);
      mockWorkoutRepo.update.mockResolvedValue({ id: "w1" });

      const dto = { distance: 12000 };
      await service.update("w1", dto);

      const call = mockWorkoutRepo.update.mock.calls[0][1];
      expect(call.pace).toBe(3600 / (12000 / 1000)); // 300 sec/km
      expect(mockWorkoutRepo.findByIdWithUser).toHaveBeenCalledWith("w1");
    });

    it("should recalculate pace when only duration is updated", async () => {
      const currentWorkout = { id: "w1", distance: 10000, duration: 3600 };
      mockWorkoutRepo.findByIdWithUser.mockResolvedValue(currentWorkout);
      mockWorkoutRepo.update.mockResolvedValue({ id: "w1" });

      const dto = { duration: 4200 };
      await service.update("w1", dto);

      const call = mockWorkoutRepo.update.mock.calls[0][1];
      expect(call.pace).toBe(4200 / (10000 / 1000)); // 420 sec/km
      expect(mockWorkoutRepo.findByIdWithUser).toHaveBeenCalledWith("w1");
    });
  });

  describe("remove", () => {
    it("should delegate to workoutRepo.softDelete", async () => {
      mockWorkoutRepo.softDelete.mockResolvedValue({ id: "w1", deletedAt: new Date() });

      await service.remove("w1");

      expect(mockWorkoutRepo.softDelete).toHaveBeenCalledWith("w1");
    });
  });
});
