import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { AccountRepository } from "./repositories/account.repository.js";
import { UserRepository } from "./repositories/user.repository.js";
import { resolveJwtExpiresIn } from "./jwt-ttl.js";

export interface OAuthProfile {
  provider: string;
  providerAccountId: string;
  email: string | null;
  name: string;
  profileImage: string | null;
  accessToken: string;
  refreshToken: string;
}

interface TokenPayload {
  sub: string;
  email: string;
}

const KAKAO_CDN_HOST = "k.kakaocdn.net";
const KAKAO_CDN_HOST_SUFFIX = ".kakaocdn.net";

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isInsecureKakaoProfileImage(value: string | null): value is string {
  if (!value) {
    return false;
  }

  const parsedUrl = parseUrl(value);
  return (
    parsedUrl?.protocol === "http:" &&
    (parsedUrl.hostname === KAKAO_CDN_HOST || parsedUrl.hostname.endsWith(KAKAO_CDN_HOST_SUFFIX))
  );
}

function normalizeOAuthProfileImage(provider: string, profileImage: string | null) {
  if (provider !== "kakao" || !isInsecureKakaoProfileImage(profileImage)) {
    return profileImage;
  }

  const parsedUrl = parseUrl(profileImage);
  if (!parsedUrl) {
    return profileImage;
  }

  parsedUrl.protocol = "https:";
  return parsedUrl.toString();
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly accountRepo: AccountRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Generate access + refresh JWT token pair.
   */
  generateTokens(user: { id: string; email: string }) {
    const payload: TokenPayload = { sub: user.id, email: user.email };

    const accessToken = this.jwt.sign(payload);

    const refreshToken = this.jwt.sign(payload, {
      expiresIn: resolveJwtExpiresIn(this.config.get<string>("JWT_REFRESH_TTL"), 604800),
    });

    return { accessToken, refreshToken };
  }

  /**
   * Find-or-create User + Account from OAuth profile.
   *
   * 1. Look up Account by provider + providerAccountId
   * 2. If found: update OAuth tokens, return existing user
   * 3. If not found:
   *    a. If email exists in User table: link new Account to existing user
   *    b. Otherwise: create User + Account atomically
   */
  async upsertOAuthUser(profile: OAuthProfile) {
    const {
      provider,
      providerAccountId,
      email,
      name,
      profileImage: rawProfileImage,
      accessToken,
      refreshToken,
    } = profile;
    const profileImage = normalizeOAuthProfileImage(provider, rawProfileImage);

    // 1. Check if this OAuth account already exists
    const existingAccount = await this.accountRepo.findByProviderWithUser(
      provider,
      providerAccountId,
    );

    if (existingAccount) {
      await this.accountRepo.updateTokens(existingAccount.id, accessToken, refreshToken);

      if (isInsecureKakaoProfileImage(existingAccount.user.profileImage) && profileImage) {
        await this.userRepo.update(existingAccount.user.id, { profileImage });
        existingAccount.user.profileImage = profileImage;
      }

      // 탈퇴한 유저가 재로그인하면 deletedAt 초기화
      if (existingAccount.user.deletedAt) {
        await this.userRepo.restoreDeletedUser(existingAccount.user.id, name, profileImage);
      }
      return { ...existingAccount.user, deletedAt: null };
    }

    // 2. No existing account -- check if user with same email exists
    if (email) {
      const existingUser = await this.userRepo.findByEmail(email);

      if (existingUser) {
        await this.accountRepo.createForUser(existingUser.id, {
          type: "oauth",
          provider,
          providerAccountId,
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        return existingUser;
      }
    }

    // 3. Brand-new user -- create User + Account atomically
    return this.userRepo.createWithAccount(
      {
        email: email || `${provider}_${providerAccountId}@placeholder.local`,
        name,
        profileImage,
        emailVerified: email ? new Date() : null,
      },
      {
        type: "oauth",
        provider,
        providerAccountId,
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    );
  }

  /**
   * Verify refresh token and issue a new token pair.
   */
  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwt.verify<TokenPayload>(refreshToken);

      const user = await this.userRepo.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  /**
   * Get user by ID (for /auth/me).
   */
  async getUser(userId: string) {
    const user = await this.userRepo.findByIdWithProfile(userId);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return user;
  }
}
