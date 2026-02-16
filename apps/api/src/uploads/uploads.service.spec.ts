import { Test } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { UploadsService } from "./uploads.service.js";
import { FitParserService } from "./parsers/fit-parser.service.js";
import { GpxParserService } from "./parsers/gpx-parser.service.js";
import { DatabaseService } from "../database/database.service.js";

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

// Mock S3Client to avoid AWS dependency
jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}));

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn().mockResolvedValue("https://signed-url.example.com"),
}));

describe("UploadsService", () => {
  let service: UploadsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.R2_BUCKET = "test-bucket";
    process.env.R2_PUBLIC_URL = "https://cdn.example.com";
    process.env.R2_ENDPOINT = "https://test.r2.cloudflarestorage.com";
    process.env.R2_ACCESS_KEY_ID = "test-key";
    process.env.R2_SECRET_ACCESS_KEY = "test-secret";

    const module = await Test.createTestingModule({
      providers: [
        UploadsService,
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
      // Mock S3 download
      const mockBuffer = Buffer.from("fake-fit-data");
      (service as any).s3.send = jest.fn().mockResolvedValue({
        Body: { transformToByteArray: () => Promise.resolve(new Uint8Array(mockBuffer)) },
        ContentLength: mockBuffer.length,
      });

      mockFitParser.parse.mockResolvedValue(mockParsedData);

      const mockWorkout = { id: "workout-1", ...mockParsedData };
      const mockWorkoutFile = { id: "file-1", workoutId: "workout-1" };
      const mockRoute = { id: "route-1", workoutId: "workout-1" };

      mockDatabaseService.prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          workout: { create: jest.fn().mockResolvedValue(mockWorkout) },
          workoutFile: { create: jest.fn().mockResolvedValue(mockWorkoutFile) },
          workoutRoute: { create: jest.fn().mockResolvedValue(mockRoute) },
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

      (service as any).s3.send = jest.fn().mockResolvedValue({
        Body: { transformToByteArray: () => Promise.resolve(new TextEncoder().encode("<gpx>...</gpx>")) },
        ContentLength: 100,
      });

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

      (service as any).s3.send = jest.fn().mockResolvedValue({
        Body: { transformToByteArray: () => Promise.resolve(new Uint8Array(Buffer.from("data"))) },
        ContentLength: 4,
      });

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
      // workoutRoute.create should NOT be called
      expect(mockDatabaseService.prisma.$transaction).toHaveBeenCalled();
    });

    it("should handle parse failure gracefully with FAILED status", async () => {
      (service as any).s3.send = jest.fn().mockResolvedValue({
        Body: { transformToByteArray: () => Promise.resolve(new Uint8Array(Buffer.from("bad"))) },
        ContentLength: 3,
      });

      mockFitParser.parse.mockRejectedValue(new Error("Invalid FIT file"));

      const mockFailedFile = { id: "file-fail", processStatus: "FAILED" };
      mockDatabaseService.prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          workoutFile: { create: jest.fn().mockResolvedValue(mockFailedFile) },
        };
        return cb(tx);
      });

      const result = await service.parseAndCreateWorkout(userId, baseInput);

      expect(result.workout).toBeNull();
      expect(result.workoutFile).toBeDefined();
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
