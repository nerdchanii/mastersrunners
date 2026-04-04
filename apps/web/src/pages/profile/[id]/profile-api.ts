import { api } from "@/lib/api-client";

export type ProfileAccessLevel = "FULL" | "LOCKED";

export interface ProfileUser {
  id: string;
  email: string;
  name: string;
  profileImage: string | null;
  backgroundImage: string | null;
  bio: string | null;
  isPrivate?: boolean;
}

export interface ProfilePost {
  id: string;
  content: string;
  createdAt: string;
  likesCount?: number;
  commentsCount?: number;
  _count?: {
    likes: number;
    comments: number;
  };
  user: ProfileUser;
}

export interface ProfileCrew {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  _count: {
    members: number;
  };
}

export interface ProfileStats {
  postCount: number;
  totalWorkouts: number;
  totalDistance: number;
  totalDuration: number;
  averagePace: number;
}

export interface ProfileApiResponse {
  accessLevel: ProfileAccessLevel;
  user: ProfileUser & {
    workoutSharingDefault?: "PRIVATE" | "FOLLOWERS" | "PUBLIC";
    region?: string | null;
    subRegion?: string | null;
    pb5kSeconds?: number | null;
    pb10kSeconds?: number | null;
    pbHalfMarathonSeconds?: number | null;
    pbMarathonSeconds?: number | null;
    createdAt?: string;
  };
  stats: ProfileStats | null;
  followersCount: number | null;
  followingCount: number | null;
  crewCount: number | null;
  isFollowing?: boolean;
  isPending?: boolean;
  isPrivate?: boolean;
}

function normalizeCollection<T>(data: T[] | { data: T[] } | { items: T[] }) {
  if (Array.isArray(data)) {
    return data;
  }

  if ("data" in data) {
    return data.data;
  }

  if ("items" in data) {
    return data.items;
  }

  return [];
}

export async function fetchUserProfile(userId: string) {
  return api.fetch<ProfileApiResponse>(`/profile/${userId}`);
}

export async function fetchUserPosts(userId: string) {
  const data = await api.fetch<ProfilePost[] | { data: ProfilePost[] }>(
    `/posts?userId=${userId}&limit=12`,
  );
  return normalizeCollection(data);
}

export async function fetchUserCrews(userId: string) {
  const data = await api.fetch<ProfileCrew[] | { data: ProfileCrew[] }>(`/crews?userId=${userId}`);
  return normalizeCollection(data);
}

export async function toggleFollowUser(userId: string, isFollowing: boolean) {
  await api.fetch(`/follow/${userId}`, {
    method: isFollowing ? "DELETE" : "POST",
  });
}

export async function startConversation(userId: string) {
  return api.fetch<{ id: string }>("/conversations", {
    method: "POST",
    body: JSON.stringify({ participantId: userId }),
  });
}
