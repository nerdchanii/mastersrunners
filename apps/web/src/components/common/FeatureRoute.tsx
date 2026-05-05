import type { ReactNode } from "react";

import { LoadingPage } from "@/components/common/LoadingPage";
import {
  defaultPublicRuntimeConfig,
  type PublicFeatureName,
  usePublicRuntimeConfig,
} from "@/lib/public-config";
import NotFoundPage from "@/pages/not-found";

interface FeatureRouteProps {
  children: ReactNode;
  feature: PublicFeatureName;
}

export function FeatureRoute({ children, feature }: FeatureRouteProps) {
  const { data, isPending } = usePublicRuntimeConfig();
  const config = data ?? defaultPublicRuntimeConfig;

  if (isPending) {
    return <LoadingPage />;
  }

  if (!config.features[feature]) {
    return <NotFoundPage />;
  }

  return <>{children}</>;
}
