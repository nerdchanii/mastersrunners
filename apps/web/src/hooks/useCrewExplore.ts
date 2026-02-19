import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface ExploreCrewItem {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  region: string | null;
  subRegion: string | null;
  _count: { members: number; activities: number };
  creator: { id: string; name: string; profileImage: string | null };
}

interface RegionItem {
  region: string;
  crewCount: number;
}

interface SubRegionItem {
  subRegion: string;
  crewCount: number;
}

export const exploreKeys = {
  explore: (params: Record<string, string | undefined>) => ["crews", "explore", params] as const,
  recommend: () => ["crews", "recommend"] as const,
  regions: () => ["crews", "regions"] as const,
  subRegions: (region: string) => ["crews", "regions", region] as const,
};

export function useCrewExplore(params: { region?: string; subRegion?: string; sort?: string; cursor?: string }) {
  return useQuery({
    queryKey: exploreKeys.explore(params),
    queryFn: () => {
      const sp = new URLSearchParams();
      if (params.region) sp.set("region", params.region);
      if (params.subRegion) sp.set("subRegion", params.subRegion);
      if (params.sort) sp.set("sort", params.sort);
      if (params.cursor) sp.set("cursor", params.cursor);
      const qs = sp.toString();
      return api.fetch<{ items: ExploreCrewItem[]; nextCursor: string | null }>(
        `/crews/explore${qs ? `?${qs}` : ""}`
      );
    },
  });
}

export function useCrewRecommend() {
  return useQuery({
    queryKey: exploreKeys.recommend(),
    queryFn: () => api.fetch<ExploreCrewItem[]>("/crews/recommend"),
  });
}

export function useRegions() {
  return useQuery({
    queryKey: exploreKeys.regions(),
    queryFn: () => api.fetch<RegionItem[]>("/crews/regions"),
  });
}

export function useSubRegions(region: string) {
  return useQuery({
    queryKey: exploreKeys.subRegions(region),
    queryFn: () => api.fetch<SubRegionItem[]>(`/crews/regions/${encodeURIComponent(region)}`),
    enabled: !!region,
  });
}
