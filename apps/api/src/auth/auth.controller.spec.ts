import type { Response } from "express";

import { AuthController } from "./auth.controller.js";
import type { OAuthProfile } from "./auth.service.js";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "./auth-cookie.util.js";

describe("AuthController", () => {
  it("redirects OAuth callbacks without exposing tokens in the URL", async () => {
    const profile: OAuthProfile = {
      accessToken: "oauth-provider-access",
      email: "runner@test.local",
      name: "Runner",
      profileImage: null,
      provider: "google",
      providerAccountId: "google-1",
      refreshToken: "oauth-provider-refresh",
    };
    const authService = {
      generateTokens: jest.fn().mockReturnValue({
        accessToken: "jwt-access-token",
        refreshToken: "jwt-refresh-token",
      }),
      upsertOAuthUser: jest.fn().mockResolvedValue({
        email: "runner@test.local",
        id: "user-1",
      }),
    };
    const config = {
      get: jest.fn((key: string, fallback?: string) =>
        key === "FRONTEND_URL" ? "https://dev.mastersrunners.com" : fallback,
      ),
    };
    const res = {
      cookie: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
    } as unknown as Response;
    const controller = new AuthController(authService as never, config as never);

    await controller.googleCallback({ user: profile } as never, res);

    expect(authService.upsertOAuthUser).toHaveBeenCalledWith(profile);
    expect(authService.generateTokens).toHaveBeenCalledWith({
      email: "runner@test.local",
      id: "user-1",
    });
    expect((res.cookie as jest.Mock).mock.calls).toEqual(
      expect.arrayContaining([
        [
          ACCESS_TOKEN_COOKIE,
          "jwt-access-token",
          expect.objectContaining({ httpOnly: true, path: "/api/v1" }),
        ],
        [
          REFRESH_TOKEN_COOKIE,
          "jwt-refresh-token",
          expect.objectContaining({ httpOnly: true, path: "/api/v1" }),
        ],
      ]),
    );
    expect(res.redirect).toHaveBeenCalledWith("https://dev.mastersrunners.com/auth/callback");
    expect((res.redirect as jest.Mock).mock.calls[0][0]).not.toContain("accessToken=");
    expect((res.redirect as jest.Mock).mock.calls[0][0]).not.toContain("refreshToken=");
  });
});
