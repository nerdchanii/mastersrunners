import { Controller, Get, Post, Body, Req, Res, UseGuards, NotFoundException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import type { OAuthProfile } from "./auth.service.js";
import { RefreshTokenDto } from "./dto/refresh-token.dto.js";
import { Public } from "../common/decorators/public.decorator.js";

@SkipThrottle()
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  // ─── Kakao ──────────────────────────────────────────

  @Public()
  @Get("kakao")
  @UseGuards(AuthGuard("kakao"))
  kakaoLogin() {
    // Passport redirects to Kakao
  }

  @Public()
  @Get("kakao/callback")
  @UseGuards(AuthGuard("kakao"))
  async kakaoCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req.user as OAuthProfile, res);
  }

  // ─── Google ─────────────────────────────────────────

  @Public()
  @Get("google")
  @UseGuards(AuthGuard("google"))
  googleLogin() {
    // Passport redirects to Google
  }

  @Public()
  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req.user as OAuthProfile, res);
  }

  // ─── Naver ──────────────────────────────────────────

  @Public()
  @Get("naver")
  @UseGuards(AuthGuard("naver"))
  naverLogin() {
    // Passport redirects to Naver
  }

  @Public()
  @Get("naver/callback")
  @UseGuards(AuthGuard("naver"))
  async naverCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req.user as OAuthProfile, res);
  }

  // ─── Dev Login (development only) ──────────────────

  @Public()
  @Post("dev-login")
  async devLogin() {
    if (process.env.NODE_ENV === "production") {
      throw new NotFoundException();
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
