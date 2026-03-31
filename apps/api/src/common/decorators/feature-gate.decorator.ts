import { SetMetadata } from "@nestjs/common";

import { type PublicFeatureName } from "../../config/feature-flags.js";
import { FEATURE_FLAG_KEY } from "../guards/feature-flag.guard.js";

export function FeatureGate(feature: PublicFeatureName) {
  return SetMetadata(FEATURE_FLAG_KEY, feature);
}
