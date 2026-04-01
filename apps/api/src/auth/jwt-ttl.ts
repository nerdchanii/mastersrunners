import type { JwtSignOptions } from "@nestjs/jwt";

export function resolveJwtExpiresIn(
  value: string | number | undefined,
  fallbackSeconds: number,
): JwtSignOptions["expiresIn"] {
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

  return trimmed as JwtSignOptions["expiresIn"];
}

const timeUnitToMs: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
  y: 365 * 24 * 60 * 60 * 1000,
};

export function resolveJwtExpiresInMilliseconds(
  value: string | number | undefined,
  fallbackSeconds: number,
): number {
  if (typeof value === "number") {
    return value * 1000;
  }

  const trimmed = value?.trim();
  if (!trimmed) {
    return fallbackSeconds * 1000;
  }

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed) * 1000;
  }

  const match = trimmed.match(/^(\d+)\s*(ms|s|m|h|d|w|y)$/i);
  if (!match) {
    throw new Error(`Unsupported JWT timespan value: ${trimmed}`);
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  return amount * timeUnitToMs[unit];
}
