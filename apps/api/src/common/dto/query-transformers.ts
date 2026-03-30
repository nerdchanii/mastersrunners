import type { TransformFnParams } from "class-transformer";

export function toOptionalBoolean({ value }: TransformFnParams): boolean | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false") {
      return false;
    }
  }

  return undefined;
}

export function toOptionalInt({ value }: TransformFnParams): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    if (/^-?\d+$/.test(normalized)) {
      return Number.parseInt(normalized, 10);
    }
  }

  return undefined;
}
