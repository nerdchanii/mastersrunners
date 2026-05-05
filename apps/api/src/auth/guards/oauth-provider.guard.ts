import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  NotFoundException,
  Type,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { isOAuthProviderEnabled, type SupportedOAuthProvider } from "../../config/feature-flags.js";

export function OAuthProviderGuard(provider: SupportedOAuthProvider): Type<CanActivate> {
  @Injectable()
  class OAuthProviderGuardMixin extends AuthGuard(provider) {
    canActivate(context: ExecutionContext) {
      if (!isOAuthProviderEnabled(provider, process.env)) {
        throw new NotFoundException();
      }

      return super.canActivate(context);
    }
  }

  return mixin(OAuthProviderGuardMixin);
}
