import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";

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

export const profileKeys = {
  all: ["profile"] as const,
  mine: () => [...profileKeys.all, "mine"] as const,
  user: (id: string) => [...profileKeys.all, "user", id] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.mine(),
    queryFn: () => api.fetch<ProfileApiResponse>("/profile"),
  });
}

export function useUserProfile(id: string) {
  return useQuery({
    queryKey: profileKeys.user(id),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) =>
      api.fetch(`/follow/${userId}`, {
        method: isFollowing ? "DELETE" : "POST",
      }),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.user(userId) });
    },
  });
}
