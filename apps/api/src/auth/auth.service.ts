import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { DatabaseService } from "../database/database.service.js";

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

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
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
      expiresIn: this.config.get<number>("JWT_REFRESH_TTL", 604800),
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
   *    b. Otherwise: create User + Account in a transaction
   */
  async upsertOAuthUser(profile: OAuthProfile) {
    const { provider, providerAccountId, email, name, profileImage, accessToken, refreshToken } =
      profile;

    // 1. Check if this OAuth account already exists
    const existingAccount = await this.db.prisma.account.findUnique({
      where: {
        provider_providerAccountId: { provider, providerAccountId },
      },
      include: { user: true },
    });

    if (existingAccount) {
      // Update stored OAuth tokens
      await this.db.prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      });
      return existingAccount.user;
    }

    // 2. No existing account -- check if user with same email exists
    if (email) {
      const existingUser = await this.db.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Link new OAuth account to existing user
        await this.db.prisma.account.create({
          data: {
            userId: existingUser.id,
            type: "oauth",
            provider,
            providerAccountId,
            access_token: accessToken,
            refresh_token: refreshToken,
          },
        });
        return existingUser;
      }
    }

    // 3. Brand-new user -- create User + Account in transaction
    const user = await this.db.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email || `${provider}_${providerAccountId}@placeholder.local`,
          name,
          profileImage,
          emailVerified: email ? new Date() : null,
        },
      });

      await tx.account.create({
        data: {
          userId: newUser.id,
          type: "oauth",
          provider,
          providerAccountId,
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      });

      return newUser;
    });

    return user;
  }

  /**
   * Verify refresh token and issue a new token pair.
   */
  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwt.verify<TokenPayload>(refreshToken);

      const user = await this.db.prisma.user.findUnique({
        where: { id: payload.sub },
      });

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
    const user = await this.db.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return user;
  }
}
