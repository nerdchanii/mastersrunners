import { Test } from "@nestjs/testing";
import { WorkoutTypeRepository } from "./workout-type.repository";
import { DatabaseService } from "../../database/database.service";

const mockPrisma = {
  workoutType: {
    findMany: jest.fn(),
  },
};

describe("WorkoutTypeRepository", () => {
  let repository: WorkoutTypeRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        WorkoutTypeRepository,
        { provide: DatabaseService, useValue: { prisma: mockPrisma } },
      ],
    }).compile();

    repository = module.get(WorkoutTypeRepository);
  });

  describe("findAllActive", () => {
    it("should query active workout types ordered by category and sortOrder", async () => {
      const mockData = [
        { id: "1", category: "EASY", name: "EASY_RUN", sortOrder: 0, isActive: true },
        { id: "2", category: "LONG_RUN", name: "LSD", sortOrder: 0, isActive: true },
      ];
      mockPrisma.workoutType.findMany.mockResolvedValue(mockData);

      const result = await repository.findAllActive();

      expect(mockPrisma.workoutType.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      });
      expect(result).toEqual(mockData);
    });
  });

  describe("findByCategory", () => {
    it("should query active workout types by category ordered by sortOrder", async () => {
      const mockData = [
        { id: "1", category: "SPEED", name: "INTERVAL", sortOrder: 0, isActive: true },
        { id: "2", category: "SPEED", name: "FARTLEK", sortOrder: 2, isActive: true },
      ];
      mockPrisma.workoutType.findMany.mockResolvedValue(mockData);

      const result = await repository.findByCategory("SPEED");

      expect(mockPrisma.workoutType.findMany).toHaveBeenCalledWith({
        where: { category: "SPEED", isActive: true },
        orderBy: { sortOrder: "asc" },
      });
      expect(result).toEqual(mockData);
    });
  });
});
