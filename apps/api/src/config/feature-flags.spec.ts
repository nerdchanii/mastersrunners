import {
  isOAuthProviderConfigured,
  isOAuthProviderEnabled,
  isOAuthProviderEnabledInRepoConfig,
  repoTrackedRuntimeConfig,
  resolvePublicAuthProviders,
  resolvePublicFeatureFlags,
  resolvePublicRuntimeConfig,
} from "./feature-flags.js";

describe("feature flags", () => {
  it("uses the repo-tracked defaults for public features", () => {
    expect(resolvePublicFeatureFlags()).toEqual(repoTrackedRuntimeConfig.features);
  });

  it("requires repo config enablement and provider config for kakao availability", () => {
    const env = {
      KAKAO_CALLBACK_URL: "https://dev.mastersrunners.com/api/v1/auth/kakao/callback",
      KAKAO_CLIENT_ID: "kakao-client-id",
      KAKAO_CLIENT_SECRET: "kakao-secret",
    } as NodeJS.ProcessEnv;

    expect(isOAuthProviderEnabledInRepoConfig("kakao")).toBe(true);
    expect(isOAuthProviderConfigured("kakao", env)).toBe(true);
    expect(isOAuthProviderEnabled("kakao", env)).toBe(true);
  });

  it("keeps google unavailable when the repo config leaves it off", () => {
    const env = {
      GOOGLE_CALLBACK_URL: "https://dev.mastersrunners.com/api/v1/auth/google/callback",
      GOOGLE_CLIENT_ID: "google-client-id",
      GOOGLE_CLIENT_SECRET: "google-secret",
    } as NodeJS.ProcessEnv;

    expect(isOAuthProviderEnabledInRepoConfig("google")).toBe(false);
    expect(isOAuthProviderConfigured("google", env)).toBe(true);
    expect(isOAuthProviderEnabled("google", env)).toBe(false);
  });

  it("still disables a repo-enabled provider when credentials are incomplete", () => {
    const env = {
      GOOGLE_CALLBACK_URL: "https://dev.mastersrunners.com/api/v1/auth/google/callback",
      GOOGLE_CLIENT_ID: "google-client-id",
    } as NodeJS.ProcessEnv;
    const runtimeConfig = {
      ...repoTrackedRuntimeConfig,
      authProviders: {
        ...repoTrackedRuntimeConfig.authProviders,
        google: true,
      },
    };

    expect(isOAuthProviderConfigured("google", env)).toBe(false);
    expect(isOAuthProviderEnabled("google", env, runtimeConfig)).toBe(false);
  });

  it("resolves the combined public runtime config", () => {
    const env = {
      KAKAO_CALLBACK_URL: "https://dev.mastersrunners.com/api/v1/auth/kakao/callback",
      KAKAO_CLIENT_ID: "kakao-client-id",
      KAKAO_CLIENT_SECRET: "kakao-secret",
    } as NodeJS.ProcessEnv;

    expect(resolvePublicAuthProviders(env)).toEqual({
      google: false,
      kakao: true,
    });
    expect(resolvePublicRuntimeConfig(env)).toEqual({
      authProviders: {
        google: false,
        kakao: true,
      },
      features: repoTrackedRuntimeConfig.features,
    });
  });

  it("keeps kakao unavailable when the secret is missing", () => {
    const env = {
      KAKAO_CALLBACK_URL: "https://dev.mastersrunners.com/api/v1/auth/kakao/callback",
      KAKAO_CLIENT_ID: "kakao-client-id",
    } as NodeJS.ProcessEnv;

    expect(isOAuthProviderConfigured("kakao", env)).toBe(false);
    expect(isOAuthProviderEnabled("kakao", env)).toBe(false);
  });
});
