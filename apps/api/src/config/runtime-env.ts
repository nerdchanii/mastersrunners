import type { ConfigService } from "@nestjs/config";

import {
  isOAuthProviderEnabledInRepoConfig,
  oauthProviderContracts,
  type RepoTrackedRuntimeConfig,
  repoTrackedRuntimeConfig,
  type SupportedOAuthProvider,
} from "./feature-flags.js";

function readConfigValue(config: ConfigService, key: string) {
  return config.get<string>(key)?.trim() || "";
}

function readEnvValue(key: string) {
  return process.env[key]?.trim() || "";
}

function assertPresentEnvValue(key: string, value: string) {
  if (!value) {
    throw new Error(`Missing required production environment variable: ${key}`);
  }
}

function assertAbsoluteHttpUrl(key: string, value: string) {
  if (!value) {
    throw new Error(`Missing required production environment variable: ${key}`);
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Environment variable ${key} must be an absolute http(s) URL in production.`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Environment variable ${key} must be an absolute http(s) URL in production.`);
  }
}

export function validateProductionRuntimeEnv(
  config: ConfigService,
  runtimeConfig: RepoTrackedRuntimeConfig = repoTrackedRuntimeConfig,
) {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  assertAbsoluteHttpUrl("FRONTEND_URL", readConfigValue(config, "FRONTEND_URL"));

  for (const provider of Object.keys(oauthProviderContracts) as SupportedOAuthProvider[]) {
    if (!isOAuthProviderEnabledInRepoConfig(provider, runtimeConfig)) {
      continue;
    }

    const contract = oauthProviderContracts[provider];
    for (const requiredEnvKey of contract.requiredEnvKeys) {
      assertPresentEnvValue(requiredEnvKey, readEnvValue(requiredEnvKey));
    }

    const callbackEnv = contract.callbackEnv;
    assertAbsoluteHttpUrl(callbackEnv, readConfigValue(config, callbackEnv));
  }
}
