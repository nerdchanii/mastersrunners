import { Test } from "@nestjs/testing";
import { WorkoutRepository } from "./workout.repository";
import { DatabaseService } from "../../database/database.service";

const mockPrisma = {
  workout: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn(),
  },
};

describe("WorkoutRepository", () => {
  let repository: WorkoutRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        WorkoutRepository,
        { provide: DatabaseService, useValue: { prisma: mockPrisma } },
      ],
    }).compile();

    repository = module.get(WorkoutRepository);
  });

  describe("findAllByUser", () => {
    it("should query workouts by userId ordered by date desc", async () => {
      const mockData = [{ id: "w1" }, { id: "w2" }];
      mockPrisma.workout.findMany.mockResolvedValue(mockData);

      const result = await repository.findAllByUser("user-1");

      expect(mockPrisma.workout.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        orderBy: { date: "desc" },
      });
      expect(result).toEqual(mockData);
    });
  });

  describe("findByIdWithUser", () => {
    it("should query workout by id with user select", async () => {
      const mockData = { id: "w1", user: { id: "u1", name: "Test", profileImage: null } };
      mockPrisma.workout.findUnique.mockResolvedValue(mockData);

      const result = await repository.findByIdWithUser("w1");

      expect(mockPrisma.workout.findUnique).toHaveBeenCalledWith({
        where: { id: "w1" },
        include: {
          user: { select: { id: true, name: true, profileImage: true } },
        },
      });
      expect(result).toEqual(mockData);
    });
  });

  describe("create", () => {
    it("should create a workout with provided data", async () => {
      const data = {
        userId: "u1",
        distance: 10000,
        duration: 3600,
        pace: 360,
        date: new Date("2026-01-01"),
        memo: "test run",
        isPublic: true,
      };
      const mockCreated = { id: "w1", ...data };
      mockPrisma.workout.create.mockResolvedValue(mockCreated);

      const result = await repository.create(data);

      expect(mockPrisma.workout.create).toHaveBeenCalledWith({ data });
      expect(result).toEqual(mockCreated);
    });
  });

  describe("updateVisibility", () => {
    it("should update isPublic flag", async () => {
      mockPrisma.workout.update.mockResolvedValue({ id: "w1", isPublic: true });

      await repository.updateVisibility("w1", true);

      expect(mockPrisma.workout.update).toHaveBeenCalledWith({
        where: { id: "w1" },
        data: { isPublic: true },
      });
    });
  });

  describe("findPublicFeed", () => {
    it("should query public workouts without cursor", async () => {
      mockPrisma.workout.findMany.mockResolvedValue([]);

      await repository.findPublicFeed({ limit: 10 });

      expect(mockPrisma.workout.findMany).toHaveBeenCalledWith({
        where: { isPublic: true },
        include: {
          user: { select: { id: true, name: true, profileImage: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 11,
      });
    });

    it("should include cursor pagination when cursor provided", async () => {
      mockPrisma.workout.findMany.mockResolvedValue([]);

      await repository.findPublicFeed({ cursor: "c1", limit: 10 });

      expect(mockPrisma.workout.findMany).toHaveBeenCalledWith({
        where: { isPublic: true },
        include: {
          user: { select: { id: true, name: true, profileImage: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 11,
        skip: 1,
        cursor: { id: "c1" },
      });
    });
  });

  describe("aggregateByUser", () => {
    it("should aggregate workout stats for user", async () => {
      const mockStats = { _count: 5, _sum: { distance: 50000, duration: 18000 } };
      mockPrisma.workout.aggregate.mockResolvedValue(mockStats);

      const result = await repository.aggregateByUser("u1");

      expect(mockPrisma.workout.aggregate).toHaveBeenCalledWith({
        where: { userId: "u1" },
        _count: true,
        _sum: { distance: true, duration: true },
      });
      expect(result).toEqual(mockStats);
    });
  });
});
