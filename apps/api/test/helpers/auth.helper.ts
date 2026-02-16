import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { getDbService } from "../setup";
import { AuthService } from "../../src/auth/auth.service";

interface TestUserResult {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

let userCounter = 0;

/**
 * Create a test user via dev-login endpoint.
 * This always creates/returns the same hardcoded dev user.
 */
export async function loginDevUser(app: INestApplication): Promise<TestUserResult> {
  const res = await request(app.getHttpServer())
    .post("/api/v1/auth/dev-login")
    .expect(201);

  const { accessToken, refreshToken } = res.body;

  // Decode the token to get userId
  const payload = JSON.parse(
    Buffer.from(accessToken.split(".")[1], "base64").toString(),
  );

  return {
    accessToken,
    refreshToken,
    userId: payload.sub,
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

  // Use the AuthService to generate real JWT tokens
  const authService = app.get(AuthService);
  const tokens = authService.generateTokens({ id: user.id, email: user.email });

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    userId: user.id,
  };
}

/**
 * Create an authorized supertest request with Bearer token.
 */
export function authRequest(app: INestApplication, token: string) {
  return {
    get: (url: string) =>
      request(app.getHttpServer()).get(url).set("Authorization", `Bearer ${token}`),
    post: (url: string) =>
      request(app.getHttpServer()).post(url).set("Authorization", `Bearer ${token}`),
    patch: (url: string) =>
      request(app.getHttpServer()).patch(url).set("Authorization", `Bearer ${token}`),
    delete: (url: string) =>
      request(app.getHttpServer()).delete(url).set("Authorization", `Bearer ${token}`),
  };
}
