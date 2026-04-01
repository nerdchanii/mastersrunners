import type { ConfigService } from "@nestjs/config";
import type { CookieOptions, Request, Response } from "express";

import { resolveJwtExpiresInMilliseconds } from "./jwt-ttl.js";

export const ACCESS_TOKEN_COOKIE = "mr_access_token";
export const REFRESH_TOKEN_COOKIE = "mr_refresh_token";
const AUTH_COOKIE_PATH = "/api/v1";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function getCookieBaseOptions(config: ConfigService): CookieOptions {
  const frontendUrl = config.get<string>("FRONTEND_URL", "http://localhost:3000");
  const secure = new URL(frontendUrl).protocol === "https:";

  return {
    httpOnly: true,
    path: AUTH_COOKIE_PATH,
    sameSite: "lax",
    secure,
  };
}

export function getAccessTokenCookieOptions(config: ConfigService): CookieOptions {
  return {
    ...getCookieBaseOptions(config),
    maxAge: resolveJwtExpiresInMilliseconds(config.get<string>("JWT_ACCESS_TTL"), 900),
  };
}

export function getRefreshTokenCookieOptions(config: ConfigService): CookieOptions {
  return {
    ...getCookieBaseOptions(config),
    maxAge: resolveJwtExpiresInMilliseconds(config.get<string>("JWT_REFRESH_TTL"), 604800),
  };
}

export function setAuthCookies(config: ConfigService, res: Response, tokens: AuthTokens) {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, getAccessTokenCookieOptions(config));
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, getRefreshTokenCookieOptions(config));
}

export function clearAuthCookies(config: ConfigService, res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, getCookieBaseOptions(config));
  res.clearCookie(REFRESH_TOKEN_COOKIE, getCookieBaseOptions(config));
}

function parseCookieHeader(cookieHeader: string | undefined) {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce<Record<string, string>>((cookies, part) => {
    const [rawName, ...rawValueParts] = part.trim().split("=");
    if (!rawName || rawValueParts.length === 0) {
      return cookies;
    }

    cookies[rawName] = decodeURIComponent(rawValueParts.join("="));
    return cookies;
  }, {});
}

function extractCookie(request: Request, cookieName: string) {
  const cookies = parseCookieHeader(request.headers.cookie);
  return cookies[cookieName];
}

export function extractAccessTokenFromRequest(request: Request) {
  return extractCookie(request, ACCESS_TOKEN_COOKIE);
}

export function extractRefreshTokenFromRequest(request: Request) {
  return extractCookie(request, REFRESH_TOKEN_COOKIE);
}

export function buildAuthCookieHeader(tokens: AuthTokens) {
  return [
    `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(tokens.accessToken)}`,
    `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(tokens.refreshToken)}`,
  ];
}
