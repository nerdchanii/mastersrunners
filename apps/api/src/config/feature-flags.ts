export type PublicFeatureName = "challenges" | "events";
export type SupportedOAuthProvider = "google" | "kakao";

export interface RepoTrackedRuntimeConfig {
  authProviders: Record<SupportedOAuthProvider, boolean>;
  features: Record<PublicFeatureName, boolean>;
}

type AuthProviderContract = {
  callbackEnv: string;
  requiredEnvKeys: string[];
};

export type PublicFeatureFlags = Record<PublicFeatureName, boolean>;
export type PublicAuthProviders = Record<SupportedOAuthProvider, boolean>;

export interface PublicRuntimeConfig {
  authProviders: PublicAuthProviders;
  features: PublicFeatureFlags;
}

// Repo-tracked source of truth until a dedicated backoffice can own runtime edits.
export const repoTrackedRuntimeConfig: RepoTrackedRuntimeConfig = {
  authProviders: {
    google: false,
    kakao: true,
  },
  features: {
    challenges: false,
    events: false,
  },
};

export const oauthProviderContracts: Record<SupportedOAuthProvider, AuthProviderContract> = {
  google: {
    requiredEnvKeys: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    callbackEnv: "GOOGLE_CALLBACK_URL",
  },
  kakao: {
    requiredEnvKeys: ["KAKAO_CLIENT_ID"],
    callbackEnv: "KAKAO_CALLBACK_URL",
  },
};

function hasRequiredValues(keys: string[], env: NodeJS.ProcessEnv) {
  return keys.every((key) => !!env[key]?.trim());
}

export function resolvePublicFeatureFlags(
  runtimeConfig: RepoTrackedRuntimeConfig = repoTrackedRuntimeConfig,
): PublicFeatureFlags {
  return runtimeConfig.features;
}

export function isOAuthProviderEnabledInRepoConfig(
  provider: SupportedOAuthProvider,
  runtimeConfig: RepoTrackedRuntimeConfig = repoTrackedRuntimeConfig,
) {
  return runtimeConfig.authProviders[provider];
}

export function isOAuthProviderConfigured(
  provider: SupportedOAuthProvider,
  env: NodeJS.ProcessEnv = process.env,
) {
  const contract = oauthProviderContracts[provider];
  return hasRequiredValues([...contract.requiredEnvKeys, contract.callbackEnv], env);
}

export function isOAuthProviderEnabled(
  provider: SupportedOAuthProvider,
  env: NodeJS.ProcessEnv = process.env,
  runtimeConfig: RepoTrackedRuntimeConfig = repoTrackedRuntimeConfig,
) {
  return (
    isOAuthProviderEnabledInRepoConfig(provider, runtimeConfig) &&
    isOAuthProviderConfigured(provider, env)
  );
}

export function resolvePublicAuthProviders(
  env: NodeJS.ProcessEnv = process.env,
  runtimeConfig: RepoTrackedRuntimeConfig = repoTrackedRuntimeConfig,
): PublicAuthProviders {
  return {
    google: isOAuthProviderEnabled("google", env, runtimeConfig),
    kakao: isOAuthProviderEnabled("kakao", env, runtimeConfig),
  };
}

export function resolvePublicRuntimeConfig(
  env: NodeJS.ProcessEnv = process.env,
  runtimeConfig: RepoTrackedRuntimeConfig = repoTrackedRuntimeConfig,
): PublicRuntimeConfig {
  return {
    features: resolvePublicFeatureFlags(runtimeConfig),
    authProviders: resolvePublicAuthProviders(env, runtimeConfig),
  };
}
