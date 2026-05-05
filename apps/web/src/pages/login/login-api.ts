import { API_BASE } from "@/lib/api-client";

export function startOAuthLogin(provider: string) {
  window.location.href = `${API_BASE}/auth/${provider}`;
}

export function isLocalApiBase() {
  return API_BASE.includes("localhost");
}

export async function performDevLogin() {
  const res = await fetch(`${API_BASE}/auth/dev-login`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Dev login failed");
  }
}
