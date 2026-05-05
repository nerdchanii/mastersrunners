import { hasR2RuntimeConfig, resolveR2Endpoint } from "./r2-runtime.js";

describe("r2-runtime", () => {
  it("prefers an explicit endpoint when it is present", () => {
    expect(
      resolveR2Endpoint({
        R2_ENDPOINT: "https://custom.example.com/",
        R2_ACCOUNT_ID: "ignored-account",
      } as NodeJS.ProcessEnv),
    ).toBe("https://custom.example.com");
  });

  it("derives the standard Cloudflare R2 endpoint from the account id", () => {
    expect(
      resolveR2Endpoint({
        R2_ACCOUNT_ID: "4c06e7b26178217eaee38b57bbcbd2d1",
      } as NodeJS.ProcessEnv),
    ).toBe("https://4c06e7b26178217eaee38b57bbcbd2d1.r2.cloudflarestorage.com");
  });

  it("treats production-style R2 runtime config as complete without an explicit endpoint", () => {
    expect(
      hasR2RuntimeConfig({
        R2_ACCOUNT_ID: "4c06e7b26178217eaee38b57bbcbd2d1",
        R2_ACCESS_KEY_ID: "access-key",
        R2_SECRET_ACCESS_KEY: "secret-key",
      } as NodeJS.ProcessEnv),
    ).toBe(true);
  });

  it("still requires credentials before enabling the R2 adapter", () => {
    expect(
      hasR2RuntimeConfig({
        R2_ACCOUNT_ID: "4c06e7b26178217eaee38b57bbcbd2d1",
      } as NodeJS.ProcessEnv),
    ).toBe(false);
  });
});
