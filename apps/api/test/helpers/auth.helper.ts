import type { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import request from "supertest";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "../../src/auth/auth-cookie.util";
import { resolveJwtExpiresIn } from "../../src/auth/jwt-ttl";
import { getDbService } from "../setup";

export interface TestUserResult {
  accessToken: string;
  cookies: string[];
  refreshToken: string;
  userId: string;
}

let userCounter = 0;

/**
 * Create a test user via dev-login endpoint.
 * This always creates/returns the same hardcoded dev user.
 */
export async function loginDevUser(app: INestApplication): Promise<TestUserResult> {
  const res = await request(app.getHttpServer()).post("/api/v1/auth/dev-login").expect(204);
  const cookies = extractCookies(res.headers["set-cookie"]);
  const accessToken = extractCookieValue(cookies, ACCESS_TOKEN_COOKIE);
  const refreshToken = extractCookieValue(cookies, REFRESH_TOKEN_COOKIE);
  const meRes = await request(app.getHttpServer()).get("/api/v1/auth/me").set("Cookie", cookies);

  return {
    accessToken,
    cookies,
    refreshToken,
    userId: meRes.body.id,
  };
}

/**
 * Create an additional test user directly via DB + generate JWT tokens.
 * Use this when you need multiple distinct users in a single test.
 */
export async function createTestUser(
  app: INestApplication,
  overrides?: { email?: string; name?: string; isPrivate?: boolean },
): Promise<TestUserResult> {
  userCounter++;
  const email = overrides?.email || `test-user-${userCounter}-${Date.now()}@test.local`;
  const name = overrides?.name || `Test User ${userCounter}`;
  const isPrivate = overrides?.isPrivate ?? false;

  const db = getDbService();
  const user = await db.prisma.user.create({
    data: {
      email,
      name,
      isPrivate,
      accounts: {
        create: {
          type: "oauth",
          provider: "dev",
          providerAccountId: `dev-test-${userCounter}-${Date.now()}`,
          access_token: "test-token",
          refresh_token: "test-refresh",
        },
      },
    },
  });

  const jwtService = app.get(JwtService);
  const configService = app.get(ConfigService);
  const payload = { sub: user.id, email: user.email };
  const tokens = {
    accessToken: jwtService.sign(payload),
    refreshToken: jwtService.sign(payload, {
      expiresIn: resolveJwtExpiresIn(configService.get<string>("JWT_REFRESH_TTL"), 604800),
    }),
  };

  return {
    accessToken: tokens.accessToken,
    cookies: [
      `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(tokens.accessToken)}`,
      `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(tokens.refreshToken)}`,
    ],
    refreshToken: tokens.refreshToken,
    userId: user.id,
  };
}

/**
 * Create an authorized supertest request with auth cookies.
 */
export function authRequest(
  app: INestApplication,
  credentials: string | Pick<TestUserResult, "accessToken" | "cookies">,
) {
  const cookies = resolveCookies(credentials);

  return {
    get: (url: string) => request(app.getHttpServer()).get(url).set("Cookie", cookies),
    post: (url: string) => request(app.getHttpServer()).post(url).set("Cookie", cookies),
    patch: (url: string) => request(app.getHttpServer()).patch(url).set("Cookie", cookies),
    delete: (url: string) => request(app.getHttpServer()).delete(url).set("Cookie", cookies),
  };
}

function extractCookies(setCookieHeader: string[] | undefined) {
  if (!setCookieHeader?.length) {
    throw new Error("Expected auth cookies to be set");
  }

  return setCookieHeader.map((cookie) => cookie.split(";")[0]);
}

function extractCookieValue(cookies: string[], name: string) {
  const cookie = cookies.find((entry) => entry.startsWith(`${name}=`));
  if (!cookie) {
    throw new Error(`Expected cookie ${name} to be present`);
  }

  return decodeURIComponent(cookie.slice(name.length + 1));
}

function resolveCookies(credentials: string | Pick<TestUserResult, "accessToken" | "cookies">) {
  if (typeof credentials === "string") {
    return [`${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(credentials)}`];
  }

  if (credentials.cookies.length > 0) {
    return credentials.cookies;
  }

  return [`${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(credentials.accessToken)}`];
}
