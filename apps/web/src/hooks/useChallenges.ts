import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface Challenge {
  id: string;
  name: string;
  description: string | null;
  goalType: string;
  goalValue: number;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  _count?: { participants: number };
  myProgress?: number | null;
  // 확장 필드 (detail용)
  title?: string;
  type?: string;
  goal?: number;
  unit?: string;
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

export const challengeKeys = {
  all: ["challenges"] as const,
  list: (params?: Record<string, string>) =>
    [...challengeKeys.all, "list", params] as const,
  detail: (id: string) => [...challengeKeys.all, "detail", id] as const,
  my: () => [...challengeKeys.all, "my"] as const,
};

export function useChallenges(params?: Record<string, string>) {
  return useQuery({
    queryKey: challengeKeys.list(params),
    queryFn: () => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return api.fetch<Challenge[]>(`/challenges${qs}`);
    },
    select: (data) => (Array.isArray(data) ? data : []),
  });
}

export function useInfiniteChallenges(joined = false) {
  return useInfiniteQuery({
    queryKey: joined ? challengeKeys.my() : challengeKeys.list(),
    queryFn: ({ pageParam }) => {
      const base = joined ? "/challenges?joined=true&limit=12" : "/challenges?limit=12";
      const path = pageParam ? `${base}&cursor=${encodeURIComponent(pageParam as string)}` : base;
      return api.fetch<ChallengeListResponse>(path);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage.nextCursor : undefined,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: challengeKeys.all });
    },
  });
}

export function useLeaveChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (challengeId: string) =>
      api.fetch(`/challenges/${challengeId}/leave`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: challengeKeys.all });
    },
  });
}
