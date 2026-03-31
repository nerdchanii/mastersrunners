import type { SignOptions } from "jsonwebtoken";

export function resolveJwtExpiresIn(
  value: string | number | undefined,
  fallbackSeconds: number,
): SignOptions["expiresIn"] {
  if (typeof value === "number") {
    return value;
  }

  const trimmed = value?.trim();
  if (!trimmed) {
    return fallbackSeconds;
  }

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed as SignOptions["expiresIn"];
}
