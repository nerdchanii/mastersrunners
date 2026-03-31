import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  NotFoundException,
  Type,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { type SupportedOAuthProvider } from "../../config/feature-flags.js";
import { FeatureFlagsService } from "../../config/feature-flags.service.js";

export function OAuthProviderGuard(provider: SupportedOAuthProvider): Type<CanActivate> {
  @Injectable()
  class OAuthProviderGuardMixin extends AuthGuard(provider) {
    constructor(private readonly featureFlags: FeatureFlagsService) {
      super();
    }

    canActivate(context: ExecutionContext) {
      if (!this.featureFlags.isAuthProviderEnabled(provider)) {
        throw new NotFoundException();
      }

      return super.canActivate(context);
    }
  }

  return mixin(OAuthProviderGuardMixin);
}
