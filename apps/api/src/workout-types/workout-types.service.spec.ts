import { Test } from "@nestjs/testing";
import { WorkoutTypesService } from "./workout-types.service";
import { WorkoutTypeRepository } from "./repositories/workout-type.repository";

const mockRepository = {
  findAllActive: jest.fn(),
  findByCategory: jest.fn(),
};

describe("WorkoutTypesService", () => {
  let service: WorkoutTypesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        WorkoutTypesService,
        { provide: WorkoutTypeRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get(WorkoutTypesService);
  });

  describe("findAll", () => {
    it("should delegate to repository and group types by category", async () => {
      const mockData = [
        { id: "1", category: "EASY", name: "EASY_RUN", sortOrder: 0, isActive: true },
        { id: "2", category: "EASY", name: "RECOVERY", sortOrder: 1, isActive: true },
        { id: "3", category: "LONG_RUN", name: "LSD", sortOrder: 0, isActive: true },
        { id: "4", category: "SPEED", name: "INTERVAL", sortOrder: 0, isActive: true },
      ];
      mockRepository.findAllActive.mockResolvedValue(mockData);

      const result = await service.findAll();

      expect(mockRepository.findAllActive).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        EASY: [
          { id: "1", category: "EASY", name: "EASY_RUN", sortOrder: 0, isActive: true },
          { id: "2", category: "EASY", name: "RECOVERY", sortOrder: 1, isActive: true },
        ],
        LONG_RUN: [
          { id: "3", category: "LONG_RUN", name: "LSD", sortOrder: 0, isActive: true },
        ],
        SPEED: [
          { id: "4", category: "SPEED", name: "INTERVAL", sortOrder: 0, isActive: true },
        ],
      });
    });

    it("should return empty object when no active types", async () => {
      mockRepository.findAllActive.mockResolvedValue([]);

      const result = await service.findAll();

      expect(mockRepository.findAllActive).toHaveBeenCalledTimes(1);
      expect(result).toEqual({});
    });
  });

  describe("findByCategory", () => {
    it("should delegate to repository with category", async () => {
      const mockData = [
        { id: "1", category: "SPEED", name: "INTERVAL", sortOrder: 0, isActive: true },
        { id: "2", category: "SPEED", name: "FARTLEK", sortOrder: 2, isActive: true },
      ];
      mockRepository.findByCategory.mockResolvedValue(mockData);

      const result = await service.findByCategory("SPEED");

      expect(mockRepository.findByCategory).toHaveBeenCalledWith("SPEED");
      expect(result).toEqual(mockData);
    });
  });
});
