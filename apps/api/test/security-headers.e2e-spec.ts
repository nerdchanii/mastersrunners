import type { INestApplication } from "@nestjs/common";
import request from "supertest";

import { closeTestApp, createTestApp } from "./setup";

describe("Security headers (E2E)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  it("serves the API header contract on the health endpoint", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/health").expect(200);

    expect(res.headers["strict-transport-security"]).toBe("max-age=31536000");
    expect(res.headers["x-frame-options"]).toBe("DENY");
    expect(res.headers["permissions-policy"]).toContain("camera=()");
    expect(res.headers["content-security-policy"]).toContain("default-src 'none'");
  });

  it("serves a swagger-safe CSP on the docs surface", async () => {
    const res = await request(app.getHttpServer()).get("/api-docs").expect(200);

    expect(res.headers["strict-transport-security"]).toBe("max-age=31536000");
    expect(res.headers["x-frame-options"]).toBe("DENY");
    expect(res.headers["permissions-policy"]).toContain("microphone=()");
    expect(res.headers["content-security-policy"]).toContain("default-src 'self'");
    expect(res.headers["content-security-policy"]).toContain("script-src 'self' 'unsafe-inline'");
  });
});
