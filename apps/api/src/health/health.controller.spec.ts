import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { HealthController } from "./health.controller.js";

describe("HealthController", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1", {
      exclude: ["health", "api/v1/health"],
    });

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("responds on both the legacy and prefixed health endpoints", async () => {
    const server = app.getHttpServer();

    const legacy = await request(server).get("/health").expect(200);
    const prefixed = await request(server).get("/api/v1/health").expect(200);

    expect(legacy.body.status).toBe("ok");
    expect(prefixed.body.status).toBe("ok");
    expect(typeof legacy.body.timestamp).toBe("string");
    expect(typeof prefixed.body.timestamp).toBe("string");
  });
});
