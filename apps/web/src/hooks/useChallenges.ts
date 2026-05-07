import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";

import {
  cleanQueryParams,
  cursorlessQueryParams,
  invalidateQueryKeys,
  type QueryParams,
  toQueryString,
} from "./query-key-utils";

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  type: string;
  targetValue: number;
  targetUnit: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  _count?: { participants: number };
  myProgress?: number | null;
  // 확장 필드 (detail용)
  createdAt?: string;
  creator?: { id: string; name: string; profileImage: string | null };
  isParticipating?: boolean;
}

export interface ChallengeDetail extends Challenge {
  participants?: Array<{
    id: string;
    joinedAt: string;
    progress: number;
    user: { id: string; name: string; profileImage: string | null };
  }>;
}

interface ChallengeListResponse {
  items: Challenge[];
  nextCursor: string | null;
  hasMore: boolean;
}

export type ChallengeListParams = QueryParams;
export type ChallengeInfiniteListParams = QueryParams & {
  cursor?: string | null;
  joined: boolean;
  limit?: number;
};
export type ChallengeLeaderboardParams = QueryParams & { limit?: number };

export const challengeKeys = {
  all: ["challenges"] as const,
  listFamily: () => [...challengeKeys.all, "list"] as const,
  list: (params?: ChallengeListParams) =>
    [...challengeKeys.listFamily(), cleanQueryParams(params)] as const,
  infiniteListFamily: () => [...challengeKeys.all, "infinite-list"] as const,
  infiniteList: (params: ChallengeInfiniteListParams) =>
    [...challengeKeys.infiniteListFamily(), cursorlessQueryParams(params)] as const,
  detail: (id: string) => [...challengeKeys.all, "detail", id] as const,
  leaderboard: (id: string, params?: ChallengeLeaderboardParams) =>
    [...challengeKeys.detail(id), "leaderboard", cleanQueryParams(params)] as const,
  my: () => [...challengeKeys.all, "my"] as const,
};

export const challengeInvalidationTargets = {
  join: (challengeId: string) => [
    challengeKeys.detail(challengeId),
    challengeKeys.listFamily(),
    challengeKeys.infiniteListFamily(),
  ],
  leave: (challengeId: string) => [
    challengeKeys.detail(challengeId),
    challengeKeys.listFamily(),
    challengeKeys.infiniteListFamily(),
  ],
  updateProgress: (challengeId: string, leaderboardParams?: ChallengeLeaderboardParams) => [
    challengeKeys.detail(challengeId),
    challengeKeys.leaderboard(challengeId, leaderboardParams),
  ],
  delete: () => [challengeKeys.all],
};

export function useChallenges(params?: ChallengeListParams) {
  return useQuery({
    queryKey: challengeKeys.list(params),
    queryFn: () => api.fetch<Challenge[]>(`/challenges${toQueryString(params)}`),
    select: (data) => (Array.isArray(data) ? data : []),
  });
}

export function useInfiniteChallenges(joined = false) {
  const baseParams = { joined, limit: 12 };

  return useInfiniteQuery({
    queryKey: challengeKeys.infiniteList(baseParams),
    queryFn: ({ pageParam }) => {
      const base = joined
        ? `/challenges/my${toQueryString({ limit: baseParams.limit })}`
        : `/challenges${toQueryString({ limit: baseParams.limit })}`;
      const path = pageParam ? `${base}&cursor=${encodeURIComponent(pageParam as string)}` : base;
      return api.fetch<ChallengeListResponse>(path);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage?.hasMore ? lastPage.nextCursor : undefined),
  });
}

export function useChallenge(id: string) {
  return useQuery({
    queryKey: challengeKeys.detail(id),
    queryFn: () => api.fetch<ChallengeDetail>(`/challenges/${id}`),
    enabled: !!id,
  });
}

export function useJoinChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (challengeId: string) =>
      api.fetch(`/challenges/${challengeId}/join`, { method: "POST" }),
    onSuccess: (_result, challengeId) =>
      invalidateQueryKeys(queryClient, challengeInvalidationTargets.join(challengeId)),
  });
}

export function useLeaveChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (challengeId: string) =>
      api.fetch(`/challenges/${challengeId}/leave`, { method: "DELETE" }),
    onSuccess: (_result, challengeId) =>
      invalidateQueryKeys(queryClient, challengeInvalidationTargets.leave(challengeId)),
  });
}
