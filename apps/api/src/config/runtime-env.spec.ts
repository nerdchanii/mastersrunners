import type { ConfigService } from "@nestjs/config";

import { repoTrackedRuntimeConfig } from "./feature-flags.js";
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

  it("requires google credentials when the repo runtime config enables google auth", () => {
    process.env.NODE_ENV = "production";
    const runtimeConfig = {
      ...repoTrackedRuntimeConfig,
      authProviders: {
        ...repoTrackedRuntimeConfig.authProviders,
        kakao: false,
        google: true,
      },
    };

    expect(() =>
      validateProductionRuntimeEnv(
        createConfig({
          FRONTEND_URL: "https://dev.mastersrunners.com",
        }),
        runtimeConfig,
      ),
    ).toThrow("Missing required production environment variable: GOOGLE_CLIENT_ID");
  });

  it("requires callback URLs for repo-enabled OAuth providers", () => {
    process.env.NODE_ENV = "production";
    process.env.GOOGLE_CLIENT_ID = "enabled-google-provider";
    process.env.GOOGLE_CLIENT_SECRET = "google-secret";
    const runtimeConfig = {
      ...repoTrackedRuntimeConfig,
      authProviders: {
        ...repoTrackedRuntimeConfig.authProviders,
        kakao: false,
        google: true,
      },
    };

    expect(() =>
      validateProductionRuntimeEnv(
        createConfig({
          FRONTEND_URL: "https://dev.mastersrunners.com",
        }),
        runtimeConfig,
      ),
    ).toThrow("Missing required production environment variable: GOOGLE_CALLBACK_URL");
  });

  it("ignores disabled OAuth providers even when credentials are absent", () => {
    process.env.NODE_ENV = "production";
    const runtimeConfig = {
      ...repoTrackedRuntimeConfig,
      authProviders: {
        google: false,
        kakao: false,
      },
    };

    expect(() =>
      validateProductionRuntimeEnv(
        createConfig({
          FRONTEND_URL: "https://dev.mastersrunners.com",
        }),
        runtimeConfig,
      ),
    ).not.toThrow();
  });

  it("accepts valid production URLs", () => {
    process.env.NODE_ENV = "production";
    process.env.KAKAO_CLIENT_ID = "enabled-kakao-provider";
    process.env.GOOGLE_CLIENT_ID = "enabled-google-provider";
    process.env.GOOGLE_CLIENT_SECRET = "google-secret";
    const runtimeConfig = {
      ...repoTrackedRuntimeConfig,
      authProviders: {
        ...repoTrackedRuntimeConfig.authProviders,
        google: true,
      },
    };

    expect(() =>
      validateProductionRuntimeEnv(
        createConfig({
          FRONTEND_URL: "https://dev.mastersrunners.com",
          KAKAO_CALLBACK_URL: "https://dev.mastersrunners.com/api/v1/auth/kakao/callback",
          GOOGLE_CALLBACK_URL: "https://dev.mastersrunners.com/api/v1/auth/google/callback",
        }),
        runtimeConfig,
      ),
    ).not.toThrow();
  });
});
