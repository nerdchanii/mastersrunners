import type { INestApplication } from "@nestjs/common";
import request from "supertest";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "../src/auth/auth-cookie.util";

import { authRequest, loginDevUser } from "./helpers/auth.helper";
import { cleanDatabase, closeTestApp, createTestApp } from "./setup";

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
    it("should set access and refresh cookies", async () => {
      const res = await request(app.getHttpServer()).post("/api/v1/auth/dev-login").expect(204);

      expect(res.text).toBe("");
      const setCookie = res.headers["set-cookie"]?.join("\n") ?? "";
      expect(setCookie).toContain(`${ACCESS_TOKEN_COOKIE}=`);
      expect(setCookie).toContain(`${REFRESH_TOKEN_COOKIE}=`);
    });

    it("should return the same user on repeated dev-login calls", async () => {
      const first = await loginDevUser(app);
      const second = await loginDevUser(app);

      expect(first.userId).toBe(second.userId);
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    it("should rotate cookies with a valid refresh session", async () => {
      const session = await loginDevUser(app);

      const res = await authRequest(app, session).post("/api/v1/auth/refresh").expect(204);

      expect(res.text).toBe("");
      const setCookie = res.headers["set-cookie"]?.join("\n") ?? "";
      expect(setCookie).toContain(`${ACCESS_TOKEN_COOKIE}=`);
      expect(setCookie).toContain(`${REFRESH_TOKEN_COOKIE}=`);
    });

    it("should reject an invalid refresh token", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/refresh")
        .set("Cookie", [`${REFRESH_TOKEN_COOKIE}=invalid.token.here`])
        .expect(401);
    });

    it("should reject a missing refresh cookie", async () => {
      await request(app.getHttpServer()).post("/api/v1/auth/refresh").expect(401);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("should clear auth cookies", async () => {
      const session = await loginDevUser(app);

      const res = await authRequest(app, session).post("/api/v1/auth/logout").expect(204);

      const setCookie = res.headers["set-cookie"]?.join("\n") ?? "";
      expect(setCookie).toContain(`${ACCESS_TOKEN_COOKIE}=;`);
      expect(setCookie).toContain(`${REFRESH_TOKEN_COOKIE}=;`);
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("should return current user info with valid token", async () => {
      const session = await loginDevUser(app);

      const res = await authRequest(app, session).get("/api/v1/auth/me").expect(200);

      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("email", "dev@mastersrunners.local");
      expect(res.body).toHaveProperty("name");
    });

    it("should reject unauthenticated requests", async () => {
      await request(app.getHttpServer()).get("/api/v1/auth/me").expect(401);
    });

    it("should reject requests with an invalid access cookie", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/auth/me")
        .set("Cookie", [`${ACCESS_TOKEN_COOKIE}=invalid-token`])
        .expect(401);
    });

    it("should reject bearer auth even with a valid JWT", async () => {
      const session = await loginDevUser(app);

      await request(app.getHttpServer())
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${session.accessToken}`)
        .expect(401);
    });
  });
});
