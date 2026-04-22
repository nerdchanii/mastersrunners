import type { INestApplication } from "@nestjs/common";
import request from "supertest";

import {
  STORAGE_ADAPTER,
  type StorageAdapter,
} from "../src/uploads/storage/storage-adapter.interface.js";

import { authRequest, createTestUser } from "./helpers/auth.helper";
import { cleanDatabase, closeTestApp, createTestApp, getDbService } from "./setup";

describe("Workouts (E2E)", () => {
  let app: INestApplication;
  let storage: StorageAdapter;
  let userA: { accessToken: string; userId: string };
  let userB: { accessToken: string; userId: string };

  beforeAll(async () => {
    app = await createTestApp();
    storage = app.get<StorageAdapter>(STORAGE_ADAPTER);
    await cleanDatabase();
    userA = await createTestUser(app, { email: "workout-a@test.local", name: "User A" });
    userB = await createTestUser(app, { email: "workout-b@test.local", name: "User B" });
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeTestApp();
  });

  const validWorkout = {
    distance: 5000,
    duration: 1800,
    date: "2025-06-15T09:00:00.000Z",
    title: "Morning run",
    memo: "Felt great!",
    visibility: "PUBLIC",
  };

  describe("Full CRUD lifecycle", () => {
    let workoutId: string;

    it("POST /api/v1/workouts - should create a workout", async () => {
      const res = await authRequest(app, userA)
        .post("/api/v1/workouts")
        .send(validWorkout)
        .expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body.distance).toBe(5000);
      expect(res.body.duration).toBe(1800);
      expect(res.body.title).toBe("Morning run");
      expect(res.body.userId).toBe(userA.userId);
      workoutId = res.body.id;
    });

    it("GET /api/v1/workouts - should list own workouts", async () => {
      const res = await authRequest(app, userA).get("/api/v1/workouts").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body.some((w: any) => w.id === workoutId)).toBe(true);
    });

    it("GET /api/v1/workouts/:id - should get workout by id", async () => {
      const res = await authRequest(app, userA).get(`/api/v1/workouts/${workoutId}`).expect(200);

      expect(res.body.id).toBe(workoutId);
      expect(res.body.title).toBe("Morning run");
    });

    it("PATCH /api/v1/workouts/:id - should update workout", async () => {
      const res = await authRequest(app, userA)
        .patch(`/api/v1/workouts/${workoutId}`)
        .send({ title: "Updated morning run", distance: 6000 })
        .expect(200);

      expect(res.body.title).toBe("Updated morning run");
      expect(res.body.distance).toBe(6000);
    });

    it("DELETE /api/v1/workouts/:id - should soft delete workout", async () => {
      await authRequest(app, userA).delete(`/api/v1/workouts/${workoutId}`).expect(200);

      // After soft delete, workout should not be found
      await authRequest(app, userA).get(`/api/v1/workouts/${workoutId}`).expect(404);
    });
  });

  describe("Visibility filtering", () => {
    let privateWorkoutId: string;
    let publicWorkoutId: string;

    beforeAll(async () => {
      // Create a private workout by userA
      const privateRes = await authRequest(app, userA)
        .post("/api/v1/workouts")
        .send({ ...validWorkout, title: "Private workout", visibility: "PRIVATE" })
        .expect(201);
      privateWorkoutId = privateRes.body.id;

      // Create a public workout by userA
      const publicRes = await authRequest(app, userA)
        .post("/api/v1/workouts")
        .send({ ...validWorkout, title: "Public workout", visibility: "PUBLIC" })
        .expect(201);
      publicWorkoutId = publicRes.body.id;

      const db = getDbService();
      await db.prisma.workoutLike.create({
        data: {
          userId: userB.userId,
          workoutId: publicWorkoutId,
        },
      });
      await db.prisma.workoutComment.create({
        data: {
          userId: userB.userId,
          workoutId: publicWorkoutId,
          content: "Strong finish",
        },
      });
    });

    it("owner should see their private workout", async () => {
      await authRequest(app, userA).get(`/api/v1/workouts/${privateWorkoutId}`).expect(200);
    });

    it("other user should be denied access to private workout", async () => {
      await authRequest(app, userB).get(`/api/v1/workouts/${privateWorkoutId}`).expect(403);
    });

    it("other user can see public workout", async () => {
      const res = await authRequest(app, userB)
        .get(`/api/v1/workouts/${publicWorkoutId}`)
        .expect(200);

      expect(res.body.title).toBe("Public workout");
      expect(res.body.liked).toBe(true);
      expect(res.body.likeCount).toBe(1);
      expect(res.body.commentCount).toBe(1);
      expect(Array.isArray(res.body.workoutFiles)).toBe(true);
      for (const file of res.body.workoutFiles) {
        expect(file).not.toHaveProperty("fileUrl");
        expect(file).not.toHaveProperty("sourcePath");
      }
    });

    it("unauthenticated user is denied access to public workout detail", async () => {
      await request(app.getHttpServer()).get(`/api/v1/workouts/${publicWorkoutId}`).expect(401);
    });

    it("unauthenticated user is denied access to private workout", async () => {
      await request(app.getHttpServer()).get(`/api/v1/workouts/${privateWorkoutId}`).expect(401);
    });
  });

  describe("Authorization", () => {
    let workoutId: string;

    beforeAll(async () => {
      const res = await authRequest(app, userA)
        .post("/api/v1/workouts")
        .send(validWorkout)
        .expect(201);
      workoutId = res.body.id;
    });

    it("should reject unauthenticated create", async () => {
      await request(app.getHttpServer()).post("/api/v1/workouts").send(validWorkout).expect(401);
    });

    it("should reject update by non-owner", async () => {
      await authRequest(app, userB)
        .patch(`/api/v1/workouts/${workoutId}`)
        .send({ title: "Hacked!" })
        .expect(403);
    });

    it("should reject delete by non-owner", async () => {
      await authRequest(app, userB).delete(`/api/v1/workouts/${workoutId}`).expect(403);
    });
  });

  describe("Validation", () => {
    it("should reject workout with missing required fields", async () => {
      await authRequest(app, userA)
        .post("/api/v1/workouts")
        .send({ title: "No distance" })
        .expect(400);
    });

    it("should reject workout with invalid distance", async () => {
      await authRequest(app, userA)
        .post("/api/v1/workouts")
        .send({ ...validWorkout, distance: -1 })
        .expect(400);
    });

    it("should reject workout with invalid duration", async () => {
      await authRequest(app, userA)
        .post("/api/v1/workouts")
        .send({ ...validWorkout, duration: 100000 })
        .expect(400);
    });
  });

  describe("Workout source upload boundary", () => {
    it("should issue a source upload target without exposing a publicUrl", async () => {
      const res = await authRequest(app, userA)
        .post("/api/v1/workouts/source/presign")
        .send({
          filename: "tempo-run.fit",
          contentType: "application/octet-stream",
        })
        .expect(201);

      expect(res.body).toEqual(
        expect.objectContaining({
          uploadUrl: expect.any(String),
          key: expect.stringMatching(/^workouts\//),
        }),
      );
      expect(res.body).not.toHaveProperty("publicUrl");
    });

    it("should reject unsupported workout source file extensions", async () => {
      await authRequest(app, userA)
        .post("/api/v1/workouts/source/presign")
        .send({
          filename: "tempo-run.tcx",
          contentType: "application/octet-stream",
        })
        .expect(400);
    });

    it("should reject unauthenticated workout source presign requests", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/workouts/source/presign")
        .send({
          filename: "tempo-run.fit",
          contentType: "application/octet-stream",
        })
        .expect(401);
    });
  });

  describe("Blob-backed detail hydration", () => {
    beforeAll(async () => {
      await cleanDatabase();
      userA = await createTestUser(app, { email: "workout-blob-a@test.local", name: "Blob A" });
      userB = await createTestUser(app, { email: "workout-blob-b@test.local", name: "Blob B" });

      const detailPath = `workout-details/${userA.userId}/hydrated.detail.v1.json`;
      const detailBlob = {
        version: 1,
        track: [
          {
            lat: 37.5,
            lon: 127.0,
            timestamp: "2026-04-23T06:00:00.000Z",
            elevation: 11,
            heartRate: 145,
            cadence: 171,
          },
          {
            lat: 37.52,
            lon: 127.03,
            timestamp: "2026-04-23T06:09:40.000Z",
            elevation: 16,
            heartRate: 156,
            cadence: 176,
          },
        ],
        laps: [
          {
            lapNumber: 1,
            startTime: "2026-04-23T06:00:00.000Z",
            distance: 1000,
            duration: 300,
            avgPace: 300,
            avgHeartRate: 148,
            maxHeartRate: 153,
            avgCadence: 172,
            calories: 70,
          },
          {
            lapNumber: 2,
            startTime: "2026-04-23T06:05:00.000Z",
            distance: 1000,
            duration: 280,
            avgPace: 280,
            avgHeartRate: 152,
            maxHeartRate: 156,
            avgCadence: 176,
            calories: 72,
          },
        ],
        metrics: {
          firstPoint: {
            lat: 37.5,
            lon: 127.0,
            timestamp: "2026-04-23T06:00:00.000Z",
            elevation: 11,
          },
          lastPoint: {
            lat: 37.52,
            lon: 127.03,
            timestamp: "2026-04-23T06:09:40.000Z",
            elevation: 16,
          },
        },
      };

      await storage.saveFile(
        detailPath,
        Buffer.from(JSON.stringify(detailBlob), "utf-8"),
        "application/json",
      );

      const db = getDbService();
      const workout = await db.prisma.workout.create({
        data: {
          userId: userA.userId,
          distance: 2000,
          duration: 580,
          pace: 290,
          date: new Date("2026-04-23T06:00:00.000Z"),
          startedAt: new Date("2026-04-23T06:00:00.000Z"),
          finishedAt: new Date("2026-04-23T06:09:40.000Z"),
          visibility: "PUBLIC",
          title: "Blob hydration run",
          hasGps: true,
          encodedPolyline: "summary-polyline",
          detailPath,
          detailFormatVersion: 1,
        },
      });

      await db.prisma.workoutFile.create({
        data: {
          workoutId: workout.id,
          fileType: "FIT",
          sourcePath: `workouts/${userA.userId}/hydrated.fit`,
          originalFileName: "hydrated.fit",
          fileSize: 4096,
          processStatus: "COMPLETED",
        },
      });
    });

    it("hydrates legacy route/lap wire shape from Workout.detailPath without leaking private paths", async () => {
      const db = getDbService();
      const workout = await db.prisma.workout.findFirstOrThrow({
        where: { userId: userA.userId, title: "Blob hydration run" },
      });

      const res = await authRequest(app, userB).get(`/api/v1/workouts/${workout.id}`).expect(200);

      expect(res.body.workoutRoutes).toHaveLength(1);
      expect(res.body.workoutRoutes[0]).toEqual(
        expect.objectContaining({
          id: `${workout.id}:route`,
          encodedPolyline: "summary-polyline",
          totalPoints: 2,
        }),
      );
      expect(JSON.parse(res.body.workoutRoutes[0].routeData)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ lat: 37.5, lon: 127.0 }),
          expect.objectContaining({ lat: 37.52, lon: 127.03 }),
        ]),
      );
      expect(res.body.workoutLaps).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ lapNumber: 1, pace: 300 }),
          expect.objectContaining({ lapNumber: 2, pace: 280 }),
        ]),
      );
      expect(res.body.workoutFiles).toEqual([
        expect.objectContaining({
          fileType: "FIT",
          originalFileName: "hydrated.fit",
          fileSize: 4096,
        }),
      ]);
      expect(res.body.workoutFiles[0]).not.toHaveProperty("sourcePath");
      expect(res.body).not.toHaveProperty("detailPath");
      expect(res.body).not.toHaveProperty("detailFormatVersion");
    });
  });

  describe("Imported workout with missing detail blob", () => {
    beforeAll(async () => {
      await cleanDatabase();
      userA = await createTestUser(app, {
        email: "workout-missing-detail-a@test.local",
        name: "Missing Detail A",
      });
      userB = await createTestUser(app, {
        email: "workout-missing-detail-b@test.local",
        name: "Missing Detail B",
      });

      const db = getDbService();
      const workout = await db.prisma.workout.create({
        data: {
          userId: userA.userId,
          distance: 5000,
          duration: 1500,
          pace: 300,
          date: new Date("2026-04-23T07:00:00.000Z"),
          startedAt: new Date("2026-04-23T07:00:00.000Z"),
          finishedAt: new Date("2026-04-23T07:25:00.000Z"),
          visibility: "PUBLIC",
          title: "Missing detail run",
          hasGps: true,
          encodedPolyline: "degraded-summary-polyline",
          detailPath: `workout-details/${userA.userId}/missing.detail.v1.json`,
          detailFormatVersion: 1,
        },
      });

      await db.prisma.workoutFile.create({
        data: {
          workoutId: workout.id,
          fileType: "FIT",
          sourcePath: `workouts/${userA.userId}/missing.fit`,
          originalFileName: "missing.fit",
          fileSize: 2048,
          processStatus: "COMPLETED",
        },
      });
    });

    it("returns summary detail safely without leaking private paths when the blob is unreadable", async () => {
      const db = getDbService();
      const workout = await db.prisma.workout.findFirstOrThrow({
        where: { userId: userA.userId, title: "Missing detail run" },
      });

      const res = await authRequest(app, userB).get(`/api/v1/workouts/${workout.id}`).expect(200);

      expect(res.body.title).toBe("Missing detail run");
      expect(res.body.distance).toBe(5000);
      expect(res.body.duration).toBe(1500);
      expect(res.body.workoutRoutes).toEqual([]);
      expect(res.body.workoutLaps).toEqual([]);
      expect(res.body.workoutFiles).toEqual([
        expect.objectContaining({
          fileType: "FIT",
          originalFileName: "missing.fit",
          fileSize: 2048,
        }),
      ]);
      expect(res.body.workoutFiles[0]).not.toHaveProperty("sourcePath");
      expect(res.body).not.toHaveProperty("detailPath");
      expect(res.body).not.toHaveProperty("detailFormatVersion");
    });
  });
});
