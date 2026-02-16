import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createTestApp, closeTestApp, cleanDatabase } from "./setup";
import { loginDevUser, authRequest } from "./helpers/auth.helper";

describe("Auth (E2E)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeTestApp();
  });

  describe("POST /api/v1/auth/dev-login", () => {
    it("should return access and refresh tokens", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/v1/auth/dev-login")
        .expect(201);

      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(typeof res.body.accessToken).toBe("string");
      expect(typeof res.body.refreshToken).toBe("string");

      // Tokens should be valid JWTs (3 dot-separated parts)
      expect(res.body.accessToken.split(".")).toHaveLength(3);
      expect(res.body.refreshToken.split(".")).toHaveLength(3);
    });

    it("should return the same user on repeated dev-login calls", async () => {
      const first = await loginDevUser(app);
      const second = await loginDevUser(app);

      expect(first.userId).toBe(second.userId);
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    it("should issue new tokens with a valid refresh token", async () => {
      const { refreshToken } = await loginDevUser(app);

      const res = await request(app.getHttpServer())
        .post("/api/v1/auth/refresh")
        .send({ refreshToken })
        .expect(201);

      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      // New tokens should be different from the original
      expect(typeof res.body.accessToken).toBe("string");
    });

    it("should reject an invalid refresh token", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/refresh")
        .send({ refreshToken: "invalid.token.here" })
        .expect(401);
    });

    it("should reject missing refresh token", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/refresh")
        .send({})
        .expect(400);
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("should return current user info with valid token", async () => {
      const { accessToken } = await loginDevUser(app);

      const res = await authRequest(app, accessToken)
        .get("/api/v1/auth/me")
        .expect(200);

      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("email", "dev@mastersrunners.local");
      expect(res.body).toHaveProperty("name");
    });

    it("should reject unauthenticated requests", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/auth/me")
        .expect(401);
    });

    it("should reject requests with invalid token", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });
  });
});
