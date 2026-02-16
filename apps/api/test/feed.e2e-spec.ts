import type { INestApplication } from "@nestjs/common";
import { createTestApp, closeTestApp, cleanDatabase } from "./setup";
import { createTestUser, authRequest } from "./helpers/auth.helper";

describe("Feed (E2E)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeTestApp();
  });

  describe("Post feed", () => {
    let viewer: { accessToken: string; userId: string };
    let poster: { accessToken: string; userId: string };
    let stranger: { accessToken: string; userId: string };

    beforeAll(async () => {
      await cleanDatabase();

      viewer = await createTestUser(app, { email: "feed-viewer@test.local", name: "Feed Viewer" });
      poster = await createTestUser(app, { email: "feed-poster@test.local", name: "Feed Poster" });
      stranger = await createTestUser(app, { email: "feed-stranger@test.local", name: "Stranger" });

      // Viewer follows poster
      await authRequest(app, viewer.accessToken)
        .post(`/api/v1/follow/${poster.userId}`);

      // Poster creates public posts
      await authRequest(app, poster.accessToken)
        .post("/api/v1/posts")
        .send({ content: "Poster's first post", visibility: "PUBLIC" });

      await authRequest(app, poster.accessToken)
        .post("/api/v1/posts")
        .send({ content: "Poster's second post", visibility: "PUBLIC" });

      // Stranger creates a post (viewer doesn't follow stranger)
      await authRequest(app, stranger.accessToken)
        .post("/api/v1/posts")
        .send({ content: "Stranger's post", visibility: "PUBLIC" });
    });

    it("GET /api/v1/feed/posts - should return followed users' posts", async () => {
      const res = await authRequest(app, viewer.accessToken)
        .get("/api/v1/feed/posts")
        .expect(200);

      expect(res.body).toHaveProperty("items");
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body).toHaveProperty("hasMore");

      // Should contain poster's posts
      const posterPosts = res.body.items.filter((p: any) => p.userId === poster.userId);
      expect(posterPosts.length).toBeGreaterThanOrEqual(1);

      // Should NOT contain stranger's posts (not followed)
      const strangerPosts = res.body.items.filter((p: any) => p.userId === stranger.userId);
      expect(strangerPosts.length).toBe(0);
    });

    it("should include own posts in feed", async () => {
      // Viewer creates a post
      await authRequest(app, viewer.accessToken)
        .post("/api/v1/posts")
        .send({ content: "Viewer's own post", visibility: "PUBLIC" });

      const res = await authRequest(app, viewer.accessToken)
        .get("/api/v1/feed/posts")
        .expect(200);

      const ownPosts = res.body.items.filter((p: any) => p.userId === viewer.userId);
      expect(ownPosts.length).toBeGreaterThanOrEqual(1);
    });

    it("should support pagination with limit", async () => {
      const res = await authRequest(app, viewer.accessToken)
        .get("/api/v1/feed/posts?limit=1")
        .expect(200);

      expect(res.body.items.length).toBeLessThanOrEqual(1);
    });
  });

  describe("Workout feed", () => {
    let viewer: { accessToken: string; userId: string };
    let runner: { accessToken: string; userId: string };

    beforeAll(async () => {
      await cleanDatabase();

      viewer = await createTestUser(app, { email: "feed-wk-viewer@test.local", name: "WK Viewer" });
      runner = await createTestUser(app, { email: "feed-wk-runner@test.local", name: "WK Runner" });

      // Viewer follows runner
      await authRequest(app, viewer.accessToken)
        .post(`/api/v1/follow/${runner.userId}`);

      // Runner creates workouts
      await authRequest(app, runner.accessToken)
        .post("/api/v1/workouts")
        .send({
          distance: 5000,
          duration: 1800,
          date: "2025-06-15T09:00:00.000Z",
          title: "Runner's morning run",
          visibility: "PUBLIC",
        });
    });

    it("GET /api/v1/feed/workouts - should return followed users' workouts", async () => {
      const res = await authRequest(app, viewer.accessToken)
        .get("/api/v1/feed/workouts")
        .expect(200);

      expect(res.body).toHaveProperty("items");
      expect(Array.isArray(res.body.items)).toBe(true);

      const runnerWorkouts = res.body.items.filter((w: any) => w.userId === runner.userId);
      expect(runnerWorkouts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Block filtering in feed", () => {
    let viewer: { accessToken: string; userId: string };
    let blockedUser: { accessToken: string; userId: string };

    beforeAll(async () => {
      await cleanDatabase();

      viewer = await createTestUser(app, { email: "feed-block-viewer@test.local", name: "Block Viewer" });
      blockedUser = await createTestUser(app, { email: "feed-block-target@test.local", name: "Blocked User" });

      // Viewer follows blockedUser
      await authRequest(app, viewer.accessToken)
        .post(`/api/v1/follow/${blockedUser.userId}`);

      // Blocked user creates a post
      await authRequest(app, blockedUser.accessToken)
        .post("/api/v1/posts")
        .send({ content: "Post from blocked user", visibility: "PUBLIC" });

      // Blocked user creates a workout
      await authRequest(app, blockedUser.accessToken)
        .post("/api/v1/workouts")
        .send({
          distance: 3000,
          duration: 1200,
          date: "2025-06-15T09:00:00.000Z",
          title: "Blocked user workout",
          visibility: "PUBLIC",
        });
    });

    it("should show followed user's content before blocking", async () => {
      const postRes = await authRequest(app, viewer.accessToken)
        .get("/api/v1/feed/posts")
        .expect(200);

      const blockedUserPosts = postRes.body.items.filter(
        (p: any) => p.userId === blockedUser.userId,
      );
      expect(blockedUserPosts.length).toBeGreaterThanOrEqual(1);
    });

    it("should hide blocked user's content from feed after blocking", async () => {
      // Block the user
      await authRequest(app, viewer.accessToken)
        .post(`/api/v1/block/${blockedUser.userId}`)
        .expect(201);

      // Check post feed
      const postRes = await authRequest(app, viewer.accessToken)
        .get("/api/v1/feed/posts")
        .expect(200);

      const blockedUserPosts = postRes.body.items.filter(
        (p: any) => p.userId === blockedUser.userId,
      );
      expect(blockedUserPosts.length).toBe(0);

      // Check workout feed
      const workoutRes = await authRequest(app, viewer.accessToken)
        .get("/api/v1/feed/workouts")
        .expect(200);

      const blockedUserWorkouts = workoutRes.body.items.filter(
        (w: any) => w.userId === blockedUser.userId,
      );
      expect(blockedUserWorkouts.length).toBe(0);
    });

    it("should show content again after unblocking", async () => {
      // Need to re-follow since blocking removes the follow relationship
      await authRequest(app, viewer.accessToken)
        .delete(`/api/v1/block/${blockedUser.userId}`)
        .expect(200);

      await authRequest(app, viewer.accessToken)
        .post(`/api/v1/follow/${blockedUser.userId}`)
        .expect(201);

      const postRes = await authRequest(app, viewer.accessToken)
        .get("/api/v1/feed/posts")
        .expect(200);

      const unblockedUserPosts = postRes.body.items.filter(
        (p: any) => p.userId === blockedUser.userId,
      );
      expect(unblockedUserPosts.length).toBeGreaterThanOrEqual(1);
    });
  });
});
