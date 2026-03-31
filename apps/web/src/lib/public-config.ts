import { useQuery } from "@tanstack/react-query";

import { api } from "./api-client";

export type PublicFeatureName = "challenges" | "events";
export type SupportedOAuthProvider = "google" | "kakao";

export interface PublicRuntimeConfig {
  authProviders: Record<SupportedOAuthProvider, boolean>;
  features: Record<PublicFeatureName, boolean>;
}

export const defaultPublicRuntimeConfig: PublicRuntimeConfig = {
  authProviders: {
    google: false,
    kakao: false,
  },
  features: {
    challenges: false,
    events: false,
  },
};

export const publicConfigKeys = {
  runtime: () => ["public-runtime-config"] as const,
};

type LegacyAuthProvidersResponse = Partial<Record<SupportedOAuthProvider | "naver", boolean>>;

async function fetchLegacyAuthProviders() {
  return api.fetch<LegacyAuthProvidersResponse>("/auth/providers");
}

export async function fetchPublicRuntimeConfig() {
  try {
    return await api.fetch<PublicRuntimeConfig>("/config/public");
  } catch {
    const providers = await fetchLegacyAuthProviders();

    return {
      ...defaultPublicRuntimeConfig,
      authProviders: {
        google: !!providers.google,
        kakao: !!providers.kakao,
      },
    };
  }
}

export function usePublicRuntimeConfig() {
  return useQuery({
    queryKey: publicConfigKeys.runtime(),
    queryFn: fetchPublicRuntimeConfig,
  });
}
