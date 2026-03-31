import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { type PublicFeatureName } from "../../config/feature-flags.js";
import { FeatureFlagsService } from "../../config/feature-flags.service.js";

export const FEATURE_FLAG_KEY = "feature_flag";

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly featureFlags: FeatureFlagsService,
  ) {}

  canActivate(context: ExecutionContext) {
    const feature = this.reflector.getAllAndOverride<PublicFeatureName | undefined>(
      FEATURE_FLAG_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!feature) {
      return true;
    }

    if (!this.featureFlags.isFeatureEnabled(feature)) {
      throw new NotFoundException();
    }

    return true;
  }
}
