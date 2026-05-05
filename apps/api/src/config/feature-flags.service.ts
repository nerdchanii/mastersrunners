import { Injectable } from "@nestjs/common";

import {
  type PublicFeatureFlags,
  type PublicFeatureName,
  type PublicRuntimeConfig,
  type RepoTrackedRuntimeConfig,
  repoTrackedRuntimeConfig,
  resolvePublicAuthProviders,
  resolvePublicFeatureFlags,
  resolvePublicRuntimeConfig,
  type SupportedOAuthProvider,
} from "./feature-flags.js";

@Injectable()
export class FeatureFlagsService {
  getRepoTrackedRuntimeConfig(): RepoTrackedRuntimeConfig {
    return repoTrackedRuntimeConfig;
  }

  getPublicRuntimeConfig(): PublicRuntimeConfig {
    return resolvePublicRuntimeConfig(process.env, this.getRepoTrackedRuntimeConfig());
  }

  getPublicFeatures(): PublicFeatureFlags {
    return resolvePublicFeatureFlags(this.getRepoTrackedRuntimeConfig());
  }

  isFeatureEnabled(feature: PublicFeatureName) {
    return this.getPublicFeatures()[feature];
  }

  getAuthProviders() {
    return resolvePublicAuthProviders(process.env, this.getRepoTrackedRuntimeConfig());
  }

  isAuthProviderEnabled(provider: SupportedOAuthProvider) {
    return this.getAuthProviders()[provider];
  }
}
