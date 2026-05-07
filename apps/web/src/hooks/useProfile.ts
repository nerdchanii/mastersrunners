import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";

import { cleanQueryParams, invalidateQueryKeys, type QueryParams } from "./query-key-utils";

interface ProfileApiResponse {
  user: {
    id: string;
    email: string;
    name: string;
    profileImage: string | null;
    backgroundImage: string | null;
    bio: string | null;
    isPrivate: boolean;
    workoutSharingDefault: "PRIVATE" | "FOLLOWERS" | "PUBLIC";
    region: string | null;
    subRegion: string | null;
    pb5kSeconds: number | null;
    pb10kSeconds: number | null;
    pbHalfMarathonSeconds: number | null;
    pbMarathonSeconds: number | null;
    createdAt: string;
  };
  stats: {
    totalWorkouts: number;
    totalDistance: number;
    totalDuration: number;
    averagePace: number;
  };
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

interface UpdateProfileDto {
  name?: string;
  bio?: string | null;
  profileImage?: string | null;
  backgroundImage?: string | null;
  region?: string | null;
  subRegion?: string | null;
  isPrivate?: boolean;
  workoutSharingDefault?: "PRIVATE" | "FOLLOWERS" | "PUBLIC";
  pb5kSeconds?: number | null;
  pb10kSeconds?: number | null;
  pbHalfMarathonSeconds?: number | null;
  pbMarathonSeconds?: number | null;
}

export type ProfileTab = "posts" | "workouts" | "crews" | "followers" | "following";
export type ProfileTabParams = QueryParams;

export const profileKeys = {
  all: ["profile"] as const,
  mine: () => [...profileKeys.all, "mine"] as const,
  detail: (id: string) => [...profileKeys.all, "detail", id] as const,
  stats: (id: string) => [...profileKeys.detail(id), "stats"] as const,
  tabFamily: (id: string) => [...profileKeys.detail(id), "tab"] as const,
  tab: (id: string, tab: ProfileTab, params?: ProfileTabParams) =>
    [...profileKeys.tabFamily(id), tab, cleanQueryParams(params)] as const,
  user: (id: string) => profileKeys.detail(id),
};

export const profileInvalidationTargets = {
  edit: (userId: string) => [
    profileKeys.mine(),
    profileKeys.detail(userId),
    profileKeys.stats(userId),
    profileKeys.tabFamily(userId),
  ],
  follow: (userId: string) => [
    profileKeys.detail(userId),
    profileKeys.stats(userId),
    profileKeys.tabFamily(userId),
  ],
};

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.mine(),
    queryFn: () => api.fetch<ProfileApiResponse>("/profile"),
  });
}

export function useUserProfile(id: string) {
  return useQuery({
    queryKey: profileKeys.detail(id),
    queryFn: () => api.fetch<ProfileApiResponse>(`/profile/${id}`),
    enabled: !!id,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProfileDto) =>
      api.fetch<ProfileApiResponse>("/profile", {
        method: "PATCH",
        body: JSON.stringify(dto),
      }),
    onSuccess: (profile) =>
      invalidateQueryKeys(queryClient, profileInvalidationTargets.edit(profile.user.id)),
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) =>
      api.fetch(`/follow/${userId}`, {
        method: isFollowing ? "DELETE" : "POST",
      }),
    onSuccess: (_data, { userId }) =>
      invalidateQueryKeys(queryClient, profileInvalidationTargets.follow(userId)),
  });
}
