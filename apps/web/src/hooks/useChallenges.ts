import {
  type QueryClient,
  type QueryKey,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";

import { api } from "@/lib/api-client";

import {
  cleanQueryParams,
  cursorlessQueryParams,
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
  creatorId?: string;
  creator?: { id: string; name: string; profileImage: string | null };
  isJoined?: boolean;
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

export interface LeaderboardEntry {
  rank: number;
  progress: number;
  user: { id: string; name: string; profileImage: string | null };
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

const defaultLeaderboardParams = { limit: 50 } as const;

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

export const challengeQueries = {
  detail: (id: string) =>
    queryOptions({
      queryKey: challengeKeys.detail(id),
      queryFn: () => api.fetch<ChallengeDetail>(`/challenges/${id}`),
    }),
  leaderboard: (id: string, params: ChallengeLeaderboardParams = defaultLeaderboardParams) =>
    queryOptions({
      queryKey: challengeKeys.leaderboard(id, params),
      queryFn: async () => {
        const data = await api.fetch<LeaderboardEntry[]>(
          `/challenges/${id}/leaderboard${toQueryString(params)}`,
        );
        return Array.isArray(data) ? data : [];
      },
    }),
};

function isChallengeDetailScopedKey(queryKey: QueryKey) {
  return queryKey[0] === challengeKeys.all[0] && queryKey[1] === "detail";
}

function invalidateChallengeMutationTargets(
  queryClient: QueryClient,
  queryKeys: readonly QueryKey[],
) {
  return Promise.all(
    queryKeys.map((queryKey) =>
      queryClient.invalidateQueries(
        isChallengeDetailScopedKey(queryKey) ? { queryKey, exact: true } : { queryKey },
      ),
    ),
  );
}

export function useInvalidateChallengeMutationTargets() {
  const queryClient = useQueryClient();

  return useCallback(
    (queryKeys: readonly QueryKey[]) => invalidateChallengeMutationTargets(queryClient, queryKeys),
    [queryClient],
  );
}

export function useInvalidateDeletedChallenges() {
  const invalidateChallengeMutationTargets = useInvalidateChallengeMutationTargets();

  return useCallback(
    () => invalidateChallengeMutationTargets(challengeInvalidationTargets.delete()),
    [invalidateChallengeMutationTargets],
  );
}

type ChallengeQueryOptions = {
  enabled?: boolean;
};

type UpdateChallengeProgressVariables = {
  challengeId: string;
  currentValue: number;
};

function isEnabledChallengeId(id: string, enabled = true) {
  return enabled && !!id && id !== "_";
}

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
    ...challengeQueries.detail(id),
    enabled: isEnabledChallengeId(id),
  });
}

export function useChallengeLeaderboard(id: string, options: ChallengeQueryOptions = {}) {
  return useQuery({
    ...challengeQueries.leaderboard(id),
    enabled: isEnabledChallengeId(id, options.enabled),
  });
}

export function useJoinChallenge() {
  const invalidateChallengeMutationTargets = useInvalidateChallengeMutationTargets();
  return useMutation({
    mutationFn: (challengeId: string) =>
      api.fetch(`/challenges/${challengeId}/join`, { method: "POST" }),
    onSuccess: (_result, challengeId) =>
      invalidateChallengeMutationTargets(challengeInvalidationTargets.join(challengeId)),
  });
}

export function useLeaveChallenge() {
  const invalidateChallengeMutationTargets = useInvalidateChallengeMutationTargets();
  return useMutation({
    mutationFn: (challengeId: string) =>
      api.fetch(`/challenges/${challengeId}/leave`, { method: "DELETE" }),
    onSuccess: (_result, challengeId) =>
      invalidateChallengeMutationTargets(challengeInvalidationTargets.leave(challengeId)),
  });
}

export function useUpdateChallengeProgress() {
  const invalidateChallengeMutationTargets = useInvalidateChallengeMutationTargets();
  return useMutation({
    mutationFn: ({ challengeId, currentValue }: UpdateChallengeProgressVariables) =>
      api.fetch(`/challenges/${challengeId}/progress`, {
        method: "PATCH",
        body: JSON.stringify({ currentValue }),
      }),
    onSuccess: (_result, { challengeId }) =>
      invalidateChallengeMutationTargets(
        challengeInvalidationTargets.updateProgress(challengeId, defaultLeaderboardParams),
      ),
  });
}

export function useDeleteChallenge() {
  return useMutation({
    mutationFn: (challengeId: string) =>
      api.fetch(`/challenges/${challengeId}`, { method: "DELETE" }),
  });
}
