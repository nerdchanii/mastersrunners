import { ForbiddenException } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { ChallengeAggregationService } from "../challenges/challenge-aggregation.service";
import { StructuredLoggerService } from "../common/logging/structured-logger.service";
import { MonitoringService } from "../common/monitoring/monitoring.service";
import { FollowRepository } from "../follow/repositories/follow.repository";
import { ShoeRepository } from "../shoes/repositories/shoe.repository";
import { UploadsService } from "../uploads/uploads.service";

import { WorkoutRepository } from "./repositories/workout.repository";
import { WorkoutsService } from "./workouts.service";

const mockWorkoutRepo = {
  findAllByUser: jest.fn(),
  findByUserWithCursor: jest.fn(),
  findByIdWithUser: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

const mockChallengeAggregation = {
  onWorkoutCreated: jest.fn(),
};

const mockShoeRepo = {
  addDistance: jest.fn(),
  removeDistance: jest.fn(),
  findById: jest.fn(),
};

const mockLogger = {
  errorWithFields: jest.fn(),
};

const mockMonitoring = {
  captureException: jest.fn(),
};

const mockFollowRepo = {
  findFollow: jest.fn(),
};

const mockUploadsService = {
  downloadFile: jest.fn(),
};

describe("WorkoutsService", () => {
  let service: WorkoutsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        WorkoutsService,
        { provide: WorkoutRepository, useValue: mockWorkoutRepo },
        { provide: ChallengeAggregationService, useValue: mockChallengeAggregation },
        { provide: ShoeRepository, useValue: mockShoeRepo },
        { provide: StructuredLoggerService, useValue: mockLogger },
        { provide: MonitoringService, useValue: mockMonitoring },
        { provide: FollowRepository, useValue: mockFollowRepo },
        { provide: UploadsService, useValue: mockUploadsService },
      ],
    }).compile();

    service = module.get(WorkoutsService);
  });

  describe("findAll", () => {
    it("should delegate to workoutRepo.findAllByUser and omit internal detail blob fields", async () => {
      const mockData = [
        {
          id: "w1",
          detailPath: "workout-details/user-1/run.detail.v1.json",
          detailFormatVersion: 1,
          encodedPolyline: "abc123",
        },
      ];
      mockWorkoutRepo.findAllByUser.mockResolvedValue(mockData);

      const result = await service.findAll("user-1");

      expect(mockWorkoutRepo.findAllByUser).toHaveBeenCalledWith("user-1");
      expect(result).toEqual([{ id: "w1", encodedPolyline: "abc123" }]);
    });
  });

  describe("create", () => {
    it("should calculate pace correctly: duration / (distance / 1000)", async () => {
      const dto = {
        distance: 10000,
        duration: 3600,
        date: "2026-01-01",
        memo: "long run",
        visibility: "PUBLIC",
      };
      mockWorkoutRepo.create.mockResolvedValue({ id: "w1" });
      mockChallengeAggregation.onWorkoutCreated.mockResolvedValue(undefined);

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
      mockChallengeAggregation.onWorkoutCreated.mockResolvedValue(undefined);

      await service.create("u1", dto);

      const call = mockWorkoutRepo.create.mock.calls[0][0];
      expect(call.date).toBeInstanceOf(Date);
      expect(call.date.toISOString().startsWith("2026-06-15")).toBe(true);
    });

    it("should default optional fields to null/FOLLOWERS when not provided", async () => {
      const dto = { distance: 5000, duration: 1500, date: "2026-01-01" };
      mockWorkoutRepo.create.mockResolvedValue({ id: "w1" });
      mockChallengeAggregation.onWorkoutCreated.mockResolvedValue(undefined);

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
      mockChallengeAggregation.onWorkoutCreated.mockResolvedValue(undefined);

      await service.create("u1", dto);

      const call = mockWorkoutRepo.create.mock.calls[0][0];
      expect(call.title).toBe("Morning Run");
      expect(call.workoutTypeId).toBe("wt1");
      expect(call.memo).toBe("Felt great");
      expect(call.visibility).toBe("PUBLIC");
      expect(call.shoeId).toBe("shoe1");
    });

    it("should call challengeAggregation.onWorkoutCreated after creating workout", async () => {
      const dto = { distance: 5000, duration: 1500, date: "2026-01-01" };
      mockWorkoutRepo.create.mockResolvedValue({ id: "w1" });
      mockChallengeAggregation.onWorkoutCreated.mockResolvedValue(undefined);

      await service.create("u1", dto);

      expect(mockChallengeAggregation.onWorkoutCreated).toHaveBeenCalledWith("u1", {
        distance: 5000,
        duration: 1500,
        pace: 1500 / (5000 / 1000), // 300 sec/km
        date: expect.any(Date),
      });
    });

    it("should succeed even if challenge aggregation fails", async () => {
      const dto = { distance: 5000, duration: 1500, date: "2026-01-01" };
      const workout = { id: "w1" };
      mockWorkoutRepo.create.mockResolvedValue(workout);
      mockChallengeAggregation.onWorkoutCreated.mockRejectedValue(new Error("Aggregation failed"));

      const result = await service.create("u1", dto);

      expect(result).toEqual(workout);
      expect(mockLogger.errorWithFields).toHaveBeenCalledWith(
        "Failed to aggregate challenge progress",
        "WorkoutsService",
        expect.objectContaining({
          operation: "create",
          userId: "u1",
          error: expect.any(Error),
        }),
      );
      expect(mockMonitoring.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          context: "WorkoutsService.create",
          operation: "challenge_aggregation",
          userId: "u1",
        }),
      );
    });
  });

  describe("findOne", () => {
    it("should map Prisma relations to frontend field names", async () => {
      const mockData = {
        id: "w1",
        userId: "u1",
        visibility: "PUBLIC",
        user: { id: "u1" },
        file: null,
        route: null,
        laps: [],
        _count: { workoutLikes: 0, workoutComments: 0 },
        workoutLikes: [],
      };
      mockWorkoutRepo.findByIdWithUser.mockResolvedValue(mockData);

      const result = await service.findOne("w1");

      expect(mockWorkoutRepo.findByIdWithUser).toHaveBeenCalledWith("w1", undefined);
      expect(result).toMatchObject({
        id: "w1",
        liked: false,
        likeCount: 0,
        commentCount: 0,
        workoutFiles: [],
        workoutRoutes: [],
        workoutLaps: [],
      });
    });

    it("should return null when workout not found", async () => {
      mockWorkoutRepo.findByIdWithUser.mockResolvedValue(null);
      const result = await service.findOne("nonexistent");
      expect(result).toBeNull();
    });

    it("should fail closed when the auth context is incomplete", async () => {
      mockWorkoutRepo.findByIdWithUser.mockResolvedValue({
        id: "w1",
        detailPath: "workout-details/user-1/run.detail.v1.json",
        user: { id: "u1" },
        file: null,
        route: null,
        laps: [],
        _count: { workoutLikes: 0, workoutComments: 0 },
        workoutLikes: [],
      });

      await expect(service.findOne("w1", "viewer-1")).rejects.toThrow(ForbiddenException);
      expect(mockUploadsService.downloadFile).not.toHaveBeenCalled();
    });

    it("should hydrate workoutRoutes and workoutLaps from the detail blob when detailPath exists", async () => {
      const detailBlob = {
        version: 1,
        sourceFileType: "FIT",
        summary: {
          distance: 2000,
          duration: 590,
          avgPace: 295,
          startTime: "2026-01-01T08:00:00.000Z",
          endTime: "2026-01-01T08:09:50.000Z",
          avgHeartRate: 148,
          maxHeartRate: 162,
          elevationGain: 18,
          avgCadence: 172,
          maxCadence: 180,
          calories: 140,
        },
        track: [
          {
            lat: 37.5,
            lon: 127,
            timestamp: "2026-01-01T08:00:00.000Z",
            elevation: 12,
            heartRate: 145,
            cadence: 170,
          },
          {
            lat: 37.52,
            lon: 127.03,
            timestamp: "2026-01-01T08:09:50.000Z",
            elevation: 14,
            heartRate: 162,
            cadence: 178,
          },
        ],
        laps: [
          {
            lapNumber: 1,
            startTime: "2026-01-01T08:00:00.000Z",
            distance: 1000,
            duration: 300,
            avgPace: 300,
            avgHeartRate: 150,
            maxHeartRate: 158,
            avgCadence: 171,
            calories: 70,
          },
          {
            lapNumber: 2,
            startTime: "2026-01-01T08:05:00.000Z",
            distance: 1000,
            duration: 290,
            avgPace: 290,
            avgHeartRate: 152,
            maxHeartRate: 162,
            avgCadence: 173,
            calories: 70,
          },
        ],
        metrics: {
          hasGps: true,
          firstPoint: {
            lat: 37.5,
            lon: 127,
            timestamp: "2026-01-01T08:00:00.000Z",
            elevation: 12,
          },
          lastPoint: {
            lat: 37.52,
            lon: 127.03,
            timestamp: "2026-01-01T08:09:50.000Z",
            elevation: 14,
          },
          maxHeartRate: 162,
          maxCadence: 180,
        },
      };
      const mockData = {
        id: "w1",
        userId: "u1",
        visibility: "PUBLIC",
        detailPath: "workout-details/user-1/run.detail.v1.json",
        detailFormatVersion: 1,
        encodedPolyline: "summary-polyline",
        user: { id: "u1", name: "Test", profileImage: null },
        workoutType: { id: "wt1", category: "EASY", name: "Easy Run" },
        _count: { workoutLikes: 3, workoutComments: 2 },
        workoutLikes: [{ id: "like-1" }],
        file: {
          id: "f1",
          fileType: "FIT",
          fileUrl: "https://example.com/run.fit",
          originalFileName: "run.fit",
          fileSize: 50000,
        },
        route: {
          id: "r1",
          encodedPolyline: "stale-polyline",
          routeData: '[{"lat":0,"lon":0}]',
          boundNorth: 0,
          boundSouth: 0,
          boundEast: 0,
          boundWest: 0,
          totalPoints: 1,
        },
        laps: [{ id: "l1", lapNumber: 1, distance: 1600, duration: 480, pace: 300 }],
      };
      mockWorkoutRepo.findByIdWithUser.mockResolvedValue(mockData);
      mockUploadsService.downloadFile.mockResolvedValue({
        buffer: Buffer.from(JSON.stringify(detailBlob), "utf-8"),
        size: 1024,
      });

      const result = await service.findOne("w1");

      expect(result).toBeDefined();
      expect(mockUploadsService.downloadFile).toHaveBeenCalledWith(
        "workout-details/user-1/run.detail.v1.json",
      );
      expect(result!.liked).toBe(true);
      expect(result!.likeCount).toBe(3);
      expect(result!.commentCount).toBe(2);
      expect(result!.workoutFiles).toHaveLength(1);
      expect(result!.workoutFiles[0].id).toBe("f1");
      expect(result!.workoutFiles[0]).not.toHaveProperty("fileUrl");
      expect(result!.workoutRoutes).toHaveLength(1);
      expect(result!.workoutRoutes[0]).toEqual(
        expect.objectContaining({
          id: "r1",
          encodedPolyline: "summary-polyline",
          boundNorth: 37.52,
          boundSouth: 37.5,
          boundEast: 127.03,
          boundWest: 127,
          totalPoints: 2,
        }),
      );
      expect(JSON.parse(result!.workoutRoutes[0].routeData)).toEqual(detailBlob.track);
      expect(result).not.toHaveProperty("detailPath");
      expect(result).not.toHaveProperty("detailFormatVersion");
      expect(result!.workoutLaps).toHaveLength(2);
      expect(result!.workoutLaps[0].lapNumber).toBe(1);
      expect(result!.workoutLaps[0].pace).toBe(300);
      expect(result!.workoutLaps[1].lapNumber).toBe(2);
      expect(result!.firstPoint).toEqual({ lat: 37.5, lon: 127, elevation: 12 });
      expect(result!.lastPoint).toEqual({ lat: 37.52, lon: 127.03, elevation: 14 });
    });

    it("should fall back to legacy route and laps when detailPath is absent", async () => {
      mockWorkoutRepo.findByIdWithUser.mockResolvedValue({
        id: "w1",
        userId: "u1",
        visibility: "PUBLIC",
        encodedPolyline: "legacy-polyline",
        user: { id: "u1", name: "Test", profileImage: null },
        _count: { workoutLikes: 0, workoutComments: 0 },
        workoutLikes: [],
        file: null,
        route: {
          id: "r1",
          encodedPolyline: "legacy-polyline",
          routeData: '[{"lat":37.5,"lon":127.0}]',
          boundNorth: 37.5,
          boundSouth: 37.5,
          boundEast: 127,
          boundWest: 127,
          totalPoints: 1,
        },
        laps: [{ id: "l1", lapNumber: 1, distance: 1000, duration: 300, pace: 300 }],
      });

      const result = await service.findOne("w1");

      expect(mockUploadsService.downloadFile).not.toHaveBeenCalled();
      expect(result!.workoutRoutes).toEqual([
        {
          id: "r1",
          encodedPolyline: "legacy-polyline",
          routeData: '[{"lat":37.5,"lon":127.0}]',
          boundNorth: 37.5,
          boundSouth: 37.5,
          boundEast: 127,
          boundWest: 127,
          totalPoints: 1,
        },
      ]);
      expect(result!.workoutLaps).toEqual([
        { id: "l1", lapNumber: 1, distance: 1000, duration: 300, pace: 300 },
      ]);
    });

    it("should omit raw source urls and storage paths from workoutFiles", async () => {
      mockWorkoutRepo.findByIdWithUser.mockResolvedValue({
        id: "w1",
        userId: "u1",
        visibility: "PUBLIC",
        user: { id: "u1", name: "Test", profileImage: null },
        _count: { workoutLikes: 0, workoutComments: 0 },
        workoutLikes: [],
        file: {
          id: "f1",
          fileType: "FIT",
          fileUrl: "https://cdn.example.com/workouts/user-1/run.fit",
          sourcePath: "private/workouts/user-1/run.fit",
          originalFileName: "run.fit",
          fileSize: 50000,
          processStatus: "COMPLETED",
        },
        route: null,
        laps: [],
      });

      const result = await service.findOne("w1");

      expect(result).toBeDefined();
      expect(result!.workoutFiles).toEqual([
        {
          id: "f1",
          fileType: "FIT",
          originalFileName: "run.fit",
          fileSize: 50000,
          processStatus: "COMPLETED",
        },
      ]);
      expect(result!.workoutFiles[0]).not.toHaveProperty("fileUrl");
      expect(result!.workoutFiles[0]).not.toHaveProperty("sourcePath");
    });

    it("should forbid unreadable follower-only detail before downloading the blob", async () => {
      mockWorkoutRepo.findByIdWithUser.mockResolvedValue({
        id: "w1",
        userId: "owner-1",
        visibility: "FOLLOWERS",
        detailPath: "workout-details/owner-1/run.detail.v1.json",
        user: { id: "owner-1", name: "Owner", profileImage: null },
        _count: { workoutLikes: 0, workoutComments: 0 },
        workoutLikes: [],
        file: null,
        route: null,
        laps: [],
      });
      mockFollowRepo.findFollow.mockResolvedValue(null);

      await expect(service.findOne("w1", "viewer-1")).rejects.toThrow(ForbiddenException);

      expect(mockFollowRepo.findFollow).toHaveBeenCalledWith("viewer-1", "owner-1");
      expect(mockUploadsService.downloadFile).not.toHaveBeenCalled();
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
