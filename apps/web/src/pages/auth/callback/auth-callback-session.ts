import { api } from "@/lib/api-client";

export function applyAuthCallbackTokens(accessToken: string, refreshToken: string) {
  api.setTokens(accessToken, refreshToken);
}
