import { api } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  name: string;
  profileImage: string | null;
  backgroundImage: string | null;
  bio: string | null;
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  likesCount?: number;
  commentsCount?: number;
  _count?: {
    likes: number;
    comments: number;
  };
  user: User;
}

interface Workout {
  id: string;
  distance: number;
  duration: number;
  pace: number;
  date: string;
  memo: string | null;
  workoutType?: {
    id: string;
    name: string;
  };
}

interface Crew {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  _count: {
    members: number;
  };
}

interface ProfileApiResponse {
  user: User;
  stats: {
    postCount: number;
    totalWorkouts: number;
    totalDistance: number;
    totalDuration: number;
    averagePace: number;
  };
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  isPending?: boolean;
  isPrivate?: boolean;
}

function normalizeCollection<T>(data: T[] | { data: T[] }) {
  return Array.isArray(data) ? data : (data?.data ?? []);
}

export async function fetchUserProfile(userId: string) {
  return api.fetch<ProfileApiResponse>(`/profile/${userId}`);
}

export async function fetchUserPosts(userId: string) {
  const data = await api.fetch<Post[] | { data: Post[] }>(`/posts?userId=${userId}&limit=12`);
  return normalizeCollection(data);
}

export async function fetchUserWorkouts(userId: string) {
  const data = await api.fetch<Workout[] | { data: Workout[] }>(`/workouts?userId=${userId}`);
  return normalizeCollection(data);
}

export async function fetchUserCrews(userId: string) {
  const data = await api.fetch<Crew[] | { data: Crew[] }>(`/crews?userId=${userId}`);
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
