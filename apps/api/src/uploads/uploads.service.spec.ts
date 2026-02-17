import { Test } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { UploadsService } from "./uploads.service.js";
import { FitParserService } from "./parsers/fit-parser.service.js";
import { GpxParserService } from "./parsers/gpx-parser.service.js";
import { DatabaseService } from "../database/database.service.js";
import { STORAGE_ADAPTER } from "./storage/storage-adapter.interface.js";

const mockStorageAdapter = {
  getUploadUrl: jest.fn(),
  getDownloadUrl: jest.fn(),
  getPublicUrl: jest.fn(),
  downloadFile: jest.fn(),
  deleteFile: jest.fn(),
};

const mockFitParser = {
  parse: jest.fn(),
};

const mockGpxParser = {
  parse: jest.fn(),
};

const mockDatabaseService = {
  prisma: {
    $transaction: jest.fn(),
  },
};

describe("UploadsService", () => {
  let service: UploadsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        UploadsService,
        { provide: STORAGE_ADAPTER, useValue: mockStorageAdapter },
        { provide: FitParserService, useValue: mockFitParser },
        { provide: GpxParserService, useValue: mockGpxParser },
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get(UploadsService);
  });

  describe("generateKey", () => {
    it("should format key correctly", () => {
      const result = service.generateKey("user123", "images", "test.jpg");
      expect(result).toMatch(/^images\/user123\/\d+-test\.jpg$/);
    });

    it("should sanitize special characters", () => {
      const result = service.generateKey("user456", "files", "my file@#$.txt");
      expect(result).toMatch(/^files\/user456\/\d+-my_file___.txt$/);
    });
  });

  describe("getUploadUrl", () => {
    it("should delegate to storage adapter", async () => {
      const expected = { uploadUrl: "http://upload", key: "k", publicUrl: "http://pub" };
      mockStorageAdapter.getUploadUrl.mockResolvedValue(expected);

      const result = await service.getUploadUrl("k", "image/png");
      expect(result).toEqual(expected);
      expect(mockStorageAdapter.getUploadUrl).toHaveBeenCalledWith("k", "image/png", 3600);
    });
  });

  describe("getDownloadUrl", () => {
    it("should delegate to storage adapter", async () => {
      mockStorageAdapter.getDownloadUrl.mockResolvedValue("http://download");

      const result = await service.getDownloadUrl("k");
      expect(result).toBe("http://download");
    });
  });

  describe("deleteFile", () => {
    it("should delegate to storage adapter", async () => {
      mockStorageAdapter.deleteFile.mockResolvedValue(undefined);

      await service.deleteFile("k");
      expect(mockStorageAdapter.deleteFile).toHaveBeenCalledWith("k");
    });
  });

  describe("downloadFile", () => {
    it("should delegate to storage adapter", async () => {
      const expected = { buffer: Buffer.from("data"), size: 4 };
      mockStorageAdapter.downloadFile.mockResolvedValue(expected);

      const result = await service.downloadFile("k");
      expect(result).toEqual(expected);
    });
  });

  describe("parseAndCreateWorkout", () => {
    const userId = "user-1";
    const baseInput = {
      fileKey: "files/user-1/12345-run.fit",
      fileType: "FIT" as const,
      originalFileName: "run.fit",
    };

    const mockParsedData = {
      distance: 10000,
      duration: 3000,
      startTime: new Date("2026-01-01T08:00:00Z"),
      endTime: new Date("2026-01-01T08:50:00Z"),
      avgPace: 300,
      avgHeartRate: 150,
      maxHeartRate: 180,
      elevationGain: 120,
      avgCadence: 170,
      maxCadence: 185,
      gpsTrack: [
        { lat: 37.5, lon: 127.0, timestamp: new Date("2026-01-01T08:00:00Z") },
        { lat: 37.51, lon: 127.01, timestamp: new Date("2026-01-01T08:25:00Z") },
        { lat: 37.5, lon: 127.0, timestamp: new Date("2026-01-01T08:50:00Z") },
      ],
    };

    it("should parse FIT file and create workout with route", async () => {
      const mockBuffer = Buffer.from("fake-fit-data");
      mockStorageAdapter.downloadFile.mockResolvedValue({ buffer: mockBuffer, size: mockBuffer.length });
      mockStorageAdapter.getPublicUrl.mockReturnValue("https://cdn.example.com/files/user-1/12345-run.fit");

      mockFitParser.parse.mockResolvedValue(mockParsedData);

      const mockWorkout = { id: "workout-1", ...mockParsedData };
      const mockWorkoutFile = { id: "file-1", workoutId: "workout-1" };

      mockDatabaseService.prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          workout: { create: jest.fn().mockResolvedValue(mockWorkout) },
          workoutFile: { create: jest.fn().mockResolvedValue(mockWorkoutFile) },
          workoutRoute: { create: jest.fn().mockResolvedValue({ id: "route-1" }) },
        };
        return cb(tx);
      });

      const result = await service.parseAndCreateWorkout(userId, baseInput);

      expect(mockFitParser.parse).toHaveBeenCalled();
      expect(mockDatabaseService.prisma.$transaction).toHaveBeenCalled();
      expect(result.workout).toBeDefined();
      expect(result.workoutFile).toBeDefined();
    });

    it("should parse GPX file and create workout", async () => {
      const gpxInput = { ...baseInput, fileKey: "files/user-1/run.gpx", fileType: "GPX" as const, originalFileName: "run.gpx" };

      mockStorageAdapter.downloadFile.mockResolvedValue({ buffer: Buffer.from("<gpx>...</gpx>"), size: 100 });
      mockStorageAdapter.getPublicUrl.mockReturnValue("https://cdn.example.com/files/user-1/run.gpx");

      mockGpxParser.parse.mockResolvedValue(mockParsedData);

      const mockWorkout = { id: "workout-2" };
      mockDatabaseService.prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          workout: { create: jest.fn().mockResolvedValue(mockWorkout) },
          workoutFile: { create: jest.fn().mockResolvedValue({ id: "file-2" }) },
          workoutRoute: { create: jest.fn().mockResolvedValue({ id: "route-2" }) },
        };
        return cb(tx);
      });

      const result = await service.parseAndCreateWorkout(userId, gpxInput);

      expect(mockGpxParser.parse).toHaveBeenCalled();
      expect(result.workout).toBeDefined();
    });

    it("should create workout without route when no GPS data", async () => {
      const noGpsData = { ...mockParsedData, gpsTrack: undefined };

      mockStorageAdapter.downloadFile.mockResolvedValue({ buffer: Buffer.from("data"), size: 4 });
      mockStorageAdapter.getPublicUrl.mockReturnValue("https://cdn.example.com/files/user-1/12345-run.fit");

      mockFitParser.parse.mockResolvedValue(noGpsData);

      const mockWorkout = { id: "workout-3" };
      mockDatabaseService.prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          workout: { create: jest.fn().mockResolvedValue(mockWorkout) },
          workoutFile: { create: jest.fn().mockResolvedValue({ id: "file-3" }) },
          workoutRoute: { create: jest.fn() },
        };
        return cb(tx);
      });

      const result = await service.parseAndCreateWorkout(userId, baseInput);

      expect(result.workout).toBeDefined();
      expect(mockDatabaseService.prisma.$transaction).toHaveBeenCalled();
    });

    it("should handle parse failure gracefully", async () => {
      mockStorageAdapter.downloadFile.mockResolvedValue({ buffer: Buffer.from("bad"), size: 3 });

      mockFitParser.parse.mockRejectedValue(new Error("Invalid FIT file"));

      const result = await service.parseAndCreateWorkout(userId, baseInput);

      expect(result.workout).toBeNull();
      expect(result.workoutFile).toBeNull();
      expect(result.error).toBe("Invalid FIT file");
    });

    it("should throw BadRequestException for unsupported file type", async () => {
      const badInput = { ...baseInput, fileType: "TCX" as any };

      await expect(service.parseAndCreateWorkout(userId, badInput)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
