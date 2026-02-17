import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface Crew {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isPublic: boolean;
  createdAt: string;
  creator: { id: string; name: string; profileImage: string | null };
  _count: { members: number };
}

interface CrewListResponse {
  data: Crew[];
  nextCursor: string | null;
}

interface CrewDetail extends Crew {
  members: Array<{
    id: string;
    role: string;
    joinedAt: string;
    user: { id: string; name: string; profileImage: string | null };
  }>;
}

export const crewKeys = {
  all: ["crews"] as const,
  list: (params?: Record<string, string>) => [...crewKeys.all, "list", params] as const,
  detail: (id: string) => [...crewKeys.all, "detail", id] as const,
  mine: () => [...crewKeys.all, "mine"] as const,
};

export function useCrews(params?: Record<string, string>) {
  return useQuery({
    queryKey: crewKeys.list(params),
    queryFn: () => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return api.fetch<CrewListResponse>(`/crews${qs}`);
    },
    select: (data) => data?.data ?? [],
  });
}

export function useMyCrews() {
  return useQuery({
    queryKey: crewKeys.mine(),
    queryFn: () => api.fetch<Crew[]>("/crews?myCrews=true"),
    select: (data) => (Array.isArray(data) ? data : []),
  });
}

export function useCrew(id: string) {
  return useQuery({
    queryKey: crewKeys.detail(id),
    queryFn: () => api.fetch<CrewDetail>(`/crews/${id}`),
    enabled: !!id,
  });
}

export function useJoinCrew() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (crewId: string) =>
      api.fetch(`/crews/${crewId}/join`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crewKeys.all });
    },
  });
}

export function useLeaveCrew() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (crewId: string) =>
      api.fetch(`/crews/${crewId}/leave`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crewKeys.all });
    },
  });
}
