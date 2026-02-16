import { Test, TestingModule } from "@nestjs/testing";
import { WorkoutFileRepository } from "./workout-file.repository.js";
import { DatabaseService } from "../../database/database.service.js";

describe("WorkoutFileRepository", () => {
  let repository: WorkoutFileRepository;
  let mockDb: {
    prisma: {
      workoutFile: {
        create: jest.Mock;
        update: jest.Mock;
        findUnique: jest.Mock;
      };
    };
  };

  beforeEach(async () => {
    mockDb = {
      prisma: {
        workoutFile: {
          create: jest.fn(),
          update: jest.fn(),
          findUnique: jest.fn(),
        },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutFileRepository,
        {
          provide: DatabaseService,
          useValue: mockDb,
        },
      ],
    }).compile();

    repository = module.get<WorkoutFileRepository>(WorkoutFileRepository);
  });

  describe("create", () => {
    it("should create a workout file record", async () => {
      const data = {
        workoutId: "workout-123",
        fileType: "GPX",
        fileUrl: "https://r2.example.com/file.gpx",
        originalFileName: "morning-run.gpx",
        fileSize: 45678,
        checksum: "abc123",
        deviceName: "Garmin Forerunner 945",
      };

      const expected = {
        id: "file-123",
        ...data,
        deviceManufacturer: null,
        processStatus: "PENDING",
        processError: null,
        processedAt: null,
        createdAt: new Date(),
      };

      mockDb.prisma.workoutFile.create.mockResolvedValue(expected);

      const result = await repository.create(data);

      expect(mockDb.prisma.workoutFile.create).toHaveBeenCalledWith({
        data,
      });
      expect(result).toEqual(expected);
    });

    it("should create without optional fields", async () => {
      const data = {
        workoutId: "workout-456",
        fileType: "FIT",
        fileUrl: "https://r2.example.com/file.fit",
        originalFileName: "activity.fit",
        fileSize: 12345,
      };

      const expected = {
        id: "file-456",
        ...data,
        checksum: null,
        deviceName: null,
        deviceManufacturer: null,
        processStatus: "PENDING",
        processError: null,
        processedAt: null,
        createdAt: new Date(),
      };

      mockDb.prisma.workoutFile.create.mockResolvedValue(expected);

      const result = await repository.create(data);

      expect(result).toEqual(expected);
    });
  });

  describe("updateStatus", () => {
    it("should update status to COMPLETED with processedAt", async () => {
      const id = "file-123";
      const now = new Date();

      const expected = {
        id,
        workoutId: "workout-123",
        fileType: "GPX",
        fileUrl: "https://r2.example.com/file.gpx",
        originalFileName: "run.gpx",
        fileSize: 45678,
        checksum: "abc123",
        deviceName: null,
        deviceManufacturer: null,
        processStatus: "COMPLETED",
        processError: null,
        processedAt: now,
        createdAt: new Date(),
      };

      mockDb.prisma.workoutFile.update.mockResolvedValue(expected);

      const result = await repository.updateStatus(id, "COMPLETED");

      expect(mockDb.prisma.workoutFile.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          processStatus: "COMPLETED",
          processError: undefined,
          processedAt: expect.any(Date),
        },
      });
      expect(result.processStatus).toBe("COMPLETED");
      expect(result.processedAt).toBeDefined();
    });

    it("should update status to FAILED with error message", async () => {
      const id = "file-456";
      const error = "Invalid GPX format";

      const expected = {
        id,
        workoutId: "workout-456",
        fileType: "GPX",
        fileUrl: "https://r2.example.com/file.gpx",
        originalFileName: "corrupt.gpx",
        fileSize: 1234,
        checksum: null,
        deviceName: null,
        deviceManufacturer: null,
        processStatus: "FAILED",
        processError: error,
        processedAt: null,
        createdAt: new Date(),
      };

      mockDb.prisma.workoutFile.update.mockResolvedValue(expected);

      const result = await repository.updateStatus(id, "FAILED", error);

      expect(mockDb.prisma.workoutFile.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          processStatus: "FAILED",
          processError: error,
          processedAt: undefined,
        },
      });
      expect(result.processStatus).toBe("FAILED");
      expect(result.processError).toBe(error);
    });

    it("should update status to PROCESSING without processedAt", async () => {
      const id = "file-789";

      const expected = {
        id,
        workoutId: "workout-789",
        fileType: "FIT",
        fileUrl: "https://r2.example.com/file.fit",
        originalFileName: "activity.fit",
        fileSize: 56789,
        checksum: null,
        deviceName: null,
        deviceManufacturer: null,
        processStatus: "PROCESSING",
        processError: null,
        processedAt: null,
        createdAt: new Date(),
      };

      mockDb.prisma.workoutFile.update.mockResolvedValue(expected);

      const result = await repository.updateStatus(id, "PROCESSING");

      expect(mockDb.prisma.workoutFile.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          processStatus: "PROCESSING",
          processError: undefined,
          processedAt: undefined,
        },
      });
      expect(result.processStatus).toBe("PROCESSING");
      expect(result.processedAt).toBeNull();
    });
  });

  describe("findByWorkoutId", () => {
    it("should find workout file by workout ID", async () => {
      const workoutId = "workout-123";
      const expected = {
        id: "file-123",
        workoutId,
        fileType: "GPX",
        fileUrl: "https://r2.example.com/file.gpx",
        originalFileName: "run.gpx",
        fileSize: 45678,
        checksum: "abc123",
        deviceName: "Garmin",
        deviceManufacturer: "Garmin Ltd",
        processStatus: "COMPLETED",
        processError: null,
        processedAt: new Date(),
        createdAt: new Date(),
      };

      mockDb.prisma.workoutFile.findUnique.mockResolvedValue(expected);

      const result = await repository.findByWorkoutId(workoutId);

      expect(mockDb.prisma.workoutFile.findUnique).toHaveBeenCalledWith({
        where: { workoutId },
      });
      expect(result).toEqual(expected);
    });

    it("should return null if no workout file found", async () => {
      mockDb.prisma.workoutFile.findUnique.mockResolvedValue(null);

      const result = await repository.findByWorkoutId("non-existent");

      expect(result).toBeNull();
    });
  });
});
