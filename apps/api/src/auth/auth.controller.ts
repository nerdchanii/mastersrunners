import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";

import { Public } from "../common/decorators/public.decorator.js";
import { resolvePublicAuthProviders } from "../config/feature-flags.js";

import { RefreshTokenDto } from "./dto/refresh-token.dto.js";
import { OAuthProviderGuard } from "./guards/oauth-provider.guard.js";
import type { OAuthProfile } from "./auth.service.js";
import { AuthService } from "./auth.service.js";

const KakaoOAuthGuard = OAuthProviderGuard("kakao");
const GoogleOAuthGuard = OAuthProviderGuard("google");

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  // ─── Kakao ──────────────────────────────────────────

  @Public()
  @Get("providers")
  getProviders() {
    return resolvePublicAuthProviders(process.env);
  }

  @Public()
  @Get("kakao")
  @UseGuards(KakaoOAuthGuard)
  kakaoLogin() {
    // Passport redirects to Kakao
  }

  @Public()
  @Get("kakao/callback")
  @UseGuards(KakaoOAuthGuard)
  async kakaoCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req.user as OAuthProfile, res);
  }

  // ─── Google ─────────────────────────────────────────

  @Public()
  @Get("google")
  @UseGuards(GoogleOAuthGuard)
  googleLogin() {
    // Passport redirects to Google
  }

  @Public()
  @Get("google/callback")
  @UseGuards(GoogleOAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req.user as OAuthProfile, res);
  }

  // ─── Dev Login (development only) ──────────────────

  @Public()
  @Post("dev-login")
  async devLogin() {
    const env = process.env.NODE_ENV;
    if (env !== "development" && env !== "test") {
      throw new ForbiddenException("Dev login is only available in development/test environments.");
    }

    const profile: OAuthProfile = {
      provider: "dev",
      providerAccountId: "dev-1",
      email: "dev@mastersrunners.local",
      name: "개발 테스터",
      profileImage: null,
      accessToken: "dev-access-token",
      refreshToken: "dev-refresh-token",
    };

    const user = await this.authService.upsertOAuthUser(profile);
    return this.authService.generateTokens(user);
  }

  // ─── Token Refresh ─────────────────────────────────

  @Public()
  @Post("refresh")
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  // ─── Current User ──────────────────────────────────

  @Get("me")
  async me(@Req() req: Request) {
    const user = req.user as { userId: string; email: string };
    return this.authService.getUser(user.userId);
  }

  // ─── Shared ────────────────────────────────────────

  private async handleOAuthCallback(profile: OAuthProfile, res: Response) {
    const user = await this.authService.upsertOAuthUser(profile);
    const tokens = this.authService.generateTokens(user);
    const frontendUrl = this.config.get<string>("FRONTEND_URL", "http://localhost:3000");

    const redirectUrl =
      `${frontendUrl}/auth/callback` +
      `?accessToken=${encodeURIComponent(tokens.accessToken)}` +
      `&refreshToken=${encodeURIComponent(tokens.refreshToken)}`;

    return res.redirect(redirectUrl);
  }
}
