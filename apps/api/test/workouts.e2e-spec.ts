import type { INestApplication } from "@nestjs/common";
import request from "supertest";

import { authRequest, createTestUser } from "./helpers/auth.helper";
import { cleanDatabase, closeTestApp, createTestApp, getDbService } from "./setup";

describe("Workouts (E2E)", () => {
  let app: INestApplication;
  let userA: { accessToken: string; userId: string };
  let userB: { accessToken: string; userId: string };

  beforeAll(async () => {
    app = await createTestApp();
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
    });

    it("unauthenticated user can see public workout (public route)", async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/workouts/${publicWorkoutId}`)
        .expect(200);

      expect(res.body.title).toBe("Public workout");
      expect(res.body.liked).toBe(false);
      expect(res.body.likeCount).toBe(1);
      expect(res.body.commentCount).toBe(1);
    });

    it("unauthenticated user is denied access to private workout", async () => {
      await request(app.getHttpServer()).get(`/api/v1/workouts/${privateWorkoutId}`).expect(403);
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
});
