import type { ConfigService } from "@nestjs/config";

import { validateProductionRuntimeEnv } from "./runtime-env.js";

function createConfig(values: Record<string, string | undefined>) {
  return {
    get: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}

describe("validateProductionRuntimeEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("ignores missing values outside production", () => {
    process.env.NODE_ENV = "development";

    expect(() => validateProductionRuntimeEnv(createConfig({}))).not.toThrow();
  });

  it("requires FRONTEND_URL in production", () => {
    process.env.NODE_ENV = "production";

    expect(() => validateProductionRuntimeEnv(createConfig({}))).toThrow(
      "Missing required production environment variable: FRONTEND_URL",
    );
  });

  it("rejects non-absolute FRONTEND_URL values", () => {
    process.env.NODE_ENV = "production";

    expect(() =>
      validateProductionRuntimeEnv(
        createConfig({
          FRONTEND_URL: "/relative",
        }),
      ),
    ).toThrow("Environment variable FRONTEND_URL must be an absolute http(s) URL in production.");
  });

  it("requires callback URLs only for enabled OAuth providers", () => {
    process.env.NODE_ENV = "production";
    process.env.GOOGLE_CLIENT_ID = "enabled-google-provider";

    expect(() =>
      validateProductionRuntimeEnv(
        createConfig({
          FRONTEND_URL: "https://dev.mastersrunners.com",
        }),
      ),
    ).toThrow("Missing required production environment variable: GOOGLE_CALLBACK_URL");
  });

  it("accepts valid production URLs", () => {
    process.env.NODE_ENV = "production";
    process.env.GOOGLE_CLIENT_ID = "enabled-google-provider";

    expect(() =>
      validateProductionRuntimeEnv(
        createConfig({
          FRONTEND_URL: "https://dev.mastersrunners.com",
          GOOGLE_CALLBACK_URL: "https://dev.mastersrunners.com/api/v1/auth/google/callback",
        }),
      ),
    ).not.toThrow();
  });
});
