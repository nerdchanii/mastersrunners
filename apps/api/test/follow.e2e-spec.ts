import type { INestApplication } from "@nestjs/common";
import { createTestApp, closeTestApp, cleanDatabase } from "./setup";
import { createTestUser, authRequest } from "./helpers/auth.helper";

describe("Follow (E2E)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeTestApp();
  });

  describe("Public user follow flow", () => {
    let userA: { accessToken: string; userId: string };
    let userB: { accessToken: string; userId: string };

    beforeAll(async () => {
      await cleanDatabase();
      userA = await createTestUser(app, { email: "follow-pub-a@test.local", name: "Public A", isPrivate: false });
      userB = await createTestUser(app, { email: "follow-pub-b@test.local", name: "Public B", isPrivate: false });
    });

    it("should follow a public user (auto-accepted)", async () => {
      const res = await authRequest(app, userA.accessToken)
        .post(`/api/v1/follow/${userB.userId}`)
        .expect(201);

      expect(res.body).toHaveProperty("status", "ACCEPTED");
    });

    it("should appear in following list", async () => {
      const res = await authRequest(app, userA.accessToken)
        .get("/api/v1/follow/following")
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((f: any) => f.followingId === userB.userId)).toBe(true);
    });

    it("should appear in followers list of target", async () => {
      const res = await authRequest(app, userB.accessToken)
        .get("/api/v1/follow/followers")
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((f: any) => f.followerId === userA.userId)).toBe(true);
    });

    it("should reject duplicate follow", async () => {
      await authRequest(app, userA.accessToken)
        .post(`/api/v1/follow/${userB.userId}`)
        .expect(409);
    });

    it("should unfollow successfully", async () => {
      await authRequest(app, userA.accessToken)
        .delete(`/api/v1/follow/${userB.userId}`)
        .expect(200);

      // Verify not in following list anymore
      const res = await authRequest(app, userA.accessToken)
        .get("/api/v1/follow/following")
        .expect(200);

      expect(res.body.some((f: any) => f.followingId === userB.userId)).toBe(false);
    });

    it("should reject self-follow", async () => {
      await authRequest(app, userA.accessToken)
        .post(`/api/v1/follow/${userA.userId}`)
        .expect(409);
    });
  });

  describe("Private user follow flow (accept/reject)", () => {
    let userA: { accessToken: string; userId: string };
    let privateUser: { accessToken: string; userId: string };
    let userC: { accessToken: string; userId: string };

    beforeAll(async () => {
      await cleanDatabase();
      userA = await createTestUser(app, { email: "follow-priv-a@test.local", name: "Requester A" });
      privateUser = await createTestUser(app, { email: "follow-priv-target@test.local", name: "Private User", isPrivate: true });
      userC = await createTestUser(app, { email: "follow-priv-c@test.local", name: "Requester C" });
    });

    it("should create a PENDING follow request to private user", async () => {
      const res = await authRequest(app, userA.accessToken)
        .post(`/api/v1/follow/${privateUser.userId}`)
        .expect(201);

      expect(res.body).toHaveProperty("status", "PENDING");
    });

    it("private user should see pending request", async () => {
      const res = await authRequest(app, privateUser.accessToken)
        .get("/api/v1/follow/requests")
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((f: any) => f.followerId === userA.userId)).toBe(true);
    });

    it("private user should accept follow request", async () => {
      const res = await authRequest(app, privateUser.accessToken)
        .post(`/api/v1/follow/${userA.userId}/accept`)
        .expect(201);

      expect(res.body).toHaveProperty("status", "ACCEPTED");
    });

    it("accepted follower should appear in followers list", async () => {
      const res = await authRequest(app, privateUser.accessToken)
        .get("/api/v1/follow/followers")
        .expect(200);

      expect(res.body.some((f: any) => f.followerId === userA.userId)).toBe(true);
    });

    it("should reject a follow request", async () => {
      // userC sends a request
      await authRequest(app, userC.accessToken)
        .post(`/api/v1/follow/${privateUser.userId}`)
        .expect(201);

      // Private user rejects
      await authRequest(app, privateUser.accessToken)
        .post(`/api/v1/follow/${userC.userId}/reject`)
        .expect(201);

      // Rejected user should NOT appear in followers
      const res = await authRequest(app, privateUser.accessToken)
        .get("/api/v1/follow/followers")
        .expect(200);

      expect(res.body.some((f: any) => f.followerId === userC.userId)).toBe(false);
    });
  });
});
