import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface SearchUser {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
  bio: string | null;
  _count?: {
    followers: number;
    following: number;
    workouts: number;
  };
  isFollowing?: boolean;
}

export const userSearchKeys = {
  all: ["user-search"] as const,
  search: (query: string) => [...userSearchKeys.all, query] as const,
};

export function useUserSearch(query: string) {
  return useQuery({
    queryKey: userSearchKeys.search(query),
    queryFn: () =>
      api.fetch<SearchUser[]>(`/users/search?q=${encodeURIComponent(query)}&limit=20`),
    enabled: query.trim().length >= 1,
    select: (data) => (Array.isArray(data) ? data : []),
    staleTime: 1000 * 30, // 30초
  });
}
