import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { StructuredLoggerService } from "../common/logging/structured-logger.service.js";
import { DatabaseService } from "../database/database.service.js";

import { FitParserService } from "./parsers/fit-parser.service.js";
import { GpxParserService } from "./parsers/gpx-parser.service.js";
import { STORAGE_ADAPTER } from "./storage/storage-adapter.interface.js";
import { UploadsService } from "./uploads.service.js";

const mockStorageAdapter = {
  getUploadUrl: jest.fn(),
  getDownloadUrl: jest.fn(),
  getPublicUrl: jest.fn(),
  downloadFile: jest.fn(),
  saveFile: jest.fn(),
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

const mockLogger = {
  logEvent: jest.fn(),
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
        { provide: StructuredLoggerService, useValue: mockLogger },
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

  describe("createPublicAssetUploadTarget", () => {
    it("should generate a public asset key and keep the publicUrl response", async () => {
      mockStorageAdapter.getUploadUrl.mockResolvedValue({
        uploadUrl: "http://upload",
        key: "posts/user123/123-test.jpg",
        publicUrl: "http://cdn/posts/user123/123-test.jpg",
      });

      const result = await service.createPublicAssetUploadTarget(
        "user123",
        "posts",
        "test.jpg",
        "image/jpeg",
      );

      expect(result).toEqual({
        uploadUrl: "http://upload",
        key: "posts/user123/123-test.jpg",
        publicUrl: "http://cdn/posts/user123/123-test.jpg",
      });
      expect(mockStorageAdapter.getUploadUrl).toHaveBeenCalledWith(
        expect.stringMatching(/^posts\/user123\/\d+-test\.jpg$/),
        "image/jpeg",
        3600,
      );
    });
  });

  describe("createWorkoutSourceUploadTarget", () => {
    it("should return uploadUrl and key only for workout sources", async () => {
      mockStorageAdapter.getUploadUrl.mockResolvedValue({
        uploadUrl: "http://upload",
        key: "workouts/user123/123-run.fit",
        publicUrl: "http://cdn/workouts/user123/123-run.fit",
      });

      const result = await service.createWorkoutSourceUploadTarget(
        "user123",
        "run.fit",
        "application/octet-stream",
      );

      expect(result).toEqual({
        uploadUrl: "http://upload",
        key: expect.stringMatching(/^workouts\/user123\/\d+-run\.fit$/),
      });
      expect(mockStorageAdapter.getUploadUrl).toHaveBeenCalledWith(
        expect.stringMatching(/^workouts\/user123\/\d+-run\.fit$/),
        "application/octet-stream",
        3600,
      );
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
      laps: [
        {
          lapNumber: 1,
          startTime: new Date("2026-01-01T08:00:00Z"),
          distance: 1000,
          duration: 300,
          avgPace: 300,
          avgHeartRate: 148,
          maxHeartRate: 155,
          avgCadence: 170,
          calories: 80,
        },
      ],
    };

    it("stores canonical detail fields and detail blob without legacy route or lap writes", async () => {
      const mockBuffer = Buffer.from("fake-fit-data");
      mockStorageAdapter.downloadFile.mockResolvedValue({
        buffer: mockBuffer,
        size: mockBuffer.length,
      });
      mockStorageAdapter.saveFile.mockResolvedValue(undefined);

      mockFitParser.parse.mockResolvedValue(mockParsedData);

      const mockWorkout = { id: "workout-1", ...mockParsedData };
      const mockWorkoutFile = { id: "file-1", workoutId: "workout-1" };
      const workoutCreate = jest.fn().mockResolvedValue(mockWorkout);
      const workoutFileCreate = jest.fn().mockResolvedValue(mockWorkoutFile);
      mockDatabaseService.prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          workout: { create: workoutCreate },
          workoutFile: { create: workoutFileCreate },
        };
        return cb(tx);
      });

      const result = await service.parseAndCreateWorkout(userId, baseInput);

      expect(mockFitParser.parse).toHaveBeenCalled();
      expect(mockStorageAdapter.deleteFile).not.toHaveBeenCalled();
      expect(mockStorageAdapter.saveFile).toHaveBeenCalledWith(
        expect.stringMatching(/^workout-details\/user-1\/\d+-run\.detail\.v1\.json$/),
        expect.any(Buffer),
        "application/json",
      );
      const [detailPath, detailBuffer] = mockStorageAdapter.saveFile.mock.calls[0];
      const detailPayload = JSON.parse((detailBuffer as Buffer).toString("utf-8"));
      expect(detailPayload).toMatchObject({
        version: 1,
        track: expect.arrayContaining([expect.objectContaining({ lat: 37.5, lon: 127.0 })]),
        laps: [expect.objectContaining({ lapNumber: 1, distance: 1000 })],
        metrics: expect.objectContaining({
          maxHeartRate: 180,
          maxCadence: 185,
          hasGps: true,
          firstPoint: expect.objectContaining({ lat: 37.5, lon: 127.0 }),
          lastPoint: expect.objectContaining({ lat: 37.5, lon: 127.0 }),
        }),
      });
      expect(mockDatabaseService.prisma.$transaction).toHaveBeenCalled();
      expect(workoutCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          detailPath,
          detailFormatVersion: 1,
          encodedPolyline: expect.any(String),
        }),
      });
      expect(workoutFileCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          sourcePath: baseInput.fileKey,
        }),
      });
      expect(result.workout).toBeDefined();
      expect(result.workoutFile).toBeDefined();
    });

    it("should parse GPX file and create workout", async () => {
      const gpxInput = {
        ...baseInput,
        fileKey: "files/user-1/run.gpx",
        fileType: "GPX" as const,
        originalFileName: "run.gpx",
      };

      mockStorageAdapter.downloadFile.mockResolvedValue({
        buffer: Buffer.from("<gpx>...</gpx>"),
        size: 100,
      });
      mockStorageAdapter.saveFile.mockResolvedValue(undefined);

      mockGpxParser.parse.mockResolvedValue(mockParsedData);

      const mockWorkout = { id: "workout-2" };
      mockDatabaseService.prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          workout: { create: jest.fn().mockResolvedValue(mockWorkout) },
          workoutFile: { create: jest.fn().mockResolvedValue({ id: "file-2" }) },
        };
        return cb(tx);
      });

      const result = await service.parseAndCreateWorkout(userId, gpxInput);

      expect(mockGpxParser.parse).toHaveBeenCalled();
      expect(mockStorageAdapter.deleteFile).not.toHaveBeenCalled();
      expect(mockStorageAdapter.saveFile).toHaveBeenCalled();
      expect(result.workout).toBeDefined();
    });

    it("should create workout without route when no GPS data", async () => {
      const noGpsData = { ...mockParsedData, gpsTrack: undefined };

      mockStorageAdapter.downloadFile.mockResolvedValue({ buffer: Buffer.from("data"), size: 4 });
      mockStorageAdapter.saveFile.mockResolvedValue(undefined);

      mockFitParser.parse.mockResolvedValue(noGpsData);

      const mockWorkout = { id: "workout-3" };
      const workoutCreate = jest.fn().mockResolvedValue(mockWorkout);
      const workoutFileCreate = jest.fn().mockResolvedValue({ id: "file-3" });
      mockDatabaseService.prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          workout: { create: workoutCreate },
          workoutFile: { create: workoutFileCreate },
        };
        return cb(tx);
      });

      const result = await service.parseAndCreateWorkout(userId, baseInput);

      expect(result.workout).toBeDefined();
      expect(mockStorageAdapter.deleteFile).not.toHaveBeenCalled();
      expect(mockStorageAdapter.saveFile).toHaveBeenCalled();
      expect(workoutCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          detailPath: expect.stringMatching(/^workout-details\/user-1\/\d+-run\.detail\.v1\.json$/),
          detailFormatVersion: 1,
          encodedPolyline: null,
        }),
      });
      expect(workoutFileCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          sourcePath: baseInput.fileKey,
        }),
      });
      expect(mockDatabaseService.prisma.$transaction).toHaveBeenCalled();
    });

    it("should handle parse failure gracefully", async () => {
      mockStorageAdapter.downloadFile.mockResolvedValue({ buffer: Buffer.from("bad"), size: 3 });
      mockStorageAdapter.deleteFile.mockResolvedValue(undefined);

      mockFitParser.parse.mockRejectedValue(new Error("Invalid FIT file"));

      const result = await service.parseAndCreateWorkout(userId, baseInput);

      expect(result.workout).toBeNull();
      expect(result.workoutFile).toBeNull();
      expect(result.error).toBe("Invalid FIT file");
      expect(mockStorageAdapter.deleteFile).toHaveBeenCalledWith(baseInput.fileKey);
      expect(mockLogger.logEvent).not.toHaveBeenCalled();
    });

    it("should preserve parse error details when raw source cleanup fails", async () => {
      mockStorageAdapter.downloadFile.mockResolvedValue({ buffer: Buffer.from("bad"), size: 3 });
      mockStorageAdapter.deleteFile.mockRejectedValue(new Error("cleanup failed"));
      mockFitParser.parse.mockRejectedValue(new Error("Invalid FIT file"));

      const result = await service.parseAndCreateWorkout(userId, baseInput);

      expect(result.workout).toBeNull();
      expect(result.workoutFile).toBeNull();
      expect(result.error).toBe("Invalid FIT file");
      expect(mockStorageAdapter.deleteFile).toHaveBeenCalledWith(baseInput.fileKey);
      expect(mockLogger.logEvent).toHaveBeenCalledWith(
        "warn",
        "Failed to discard transient workout source",
        "UploadsService",
        expect.objectContaining({
          fileKey: baseInput.fileKey,
          error: expect.objectContaining({ message: "cleanup failed" }),
        }),
      );
    });

    it("should retain the raw source and canonical sourcePath after a successful parse", async () => {
      mockStorageAdapter.downloadFile.mockResolvedValue({
        buffer: Buffer.from("fake-fit-data"),
        size: 12,
      });
      mockStorageAdapter.saveFile.mockResolvedValue(undefined);
      mockFitParser.parse.mockResolvedValue(mockParsedData);

      const mockWorkout = { id: "workout-4", ...mockParsedData };
      const mockWorkoutFile = { id: "file-4", workoutId: "workout-4" };
      const workoutFileCreate = jest.fn().mockResolvedValue(mockWorkoutFile);
      mockDatabaseService.prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          workout: { create: jest.fn().mockResolvedValue(mockWorkout) },
          workoutFile: { create: workoutFileCreate },
        };
        return cb(tx);
      });

      const result = await service.parseAndCreateWorkout(userId, baseInput);

      expect(result.workout).toEqual(mockWorkout);
      expect(result.workoutFile).toEqual(mockWorkoutFile);
      expect(mockStorageAdapter.deleteFile).not.toHaveBeenCalled();
      expect(workoutFileCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          sourcePath: baseInput.fileKey,
        }),
      });
      expect(mockDatabaseService.prisma.$transaction).toHaveBeenCalled();
      expect(mockLogger.logEvent).not.toHaveBeenCalled();
    });

    it("should clean up the persisted detail blob if the database transaction fails", async () => {
      const mockBuffer = Buffer.from("fake-fit-data");
      mockStorageAdapter.downloadFile.mockResolvedValue({
        buffer: mockBuffer,
        size: mockBuffer.length,
      });
      mockStorageAdapter.saveFile.mockResolvedValue(undefined);
      mockStorageAdapter.deleteFile.mockResolvedValue(undefined);
      mockFitParser.parse.mockResolvedValue(mockParsedData);

      mockDatabaseService.prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          workout: { create: jest.fn().mockRejectedValue(new Error("db failed")) },
          workoutFile: { create: jest.fn() },
        };
        return cb(tx);
      });

      await expect(service.parseAndCreateWorkout(userId, baseInput)).rejects.toThrow("db failed");

      const [detailPath] = mockStorageAdapter.saveFile.mock.calls[0];
      expect(mockStorageAdapter.deleteFile).toHaveBeenCalledWith(detailPath);
      expect(mockStorageAdapter.deleteFile).not.toHaveBeenCalledWith(baseInput.fileKey);
    });

    it("should throw BadRequestException for unsupported file type", async () => {
      const badInput = { ...baseInput, fileType: "TCX" as any };

      await expect(service.parseAndCreateWorkout(userId, badInput)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
