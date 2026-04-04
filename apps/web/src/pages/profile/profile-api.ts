import { api } from "@/lib/api-client";

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
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
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
  user: {
    id: string;
    email: string;
    name: string;
    profileImage: string | null;
    backgroundImage: string | null;
    bio: string | null;
    createdAt: string;
    isPrivate: boolean;
    pb5kSeconds?: number | null;
    pb10kSeconds?: number | null;
    pbHalfMarathonSeconds?: number | null;
    pbMarathonSeconds?: number | null;
  };
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
}

function normalizeCollection<T>(data: T[] | { data: T[] }) {
  return Array.isArray(data) ? data : (data?.data ?? []);
}

export async function fetchMyProfile() {
  return api.fetch<ProfileApiResponse>("/profile");
}

export async function fetchMyProfilePosts(userId: string) {
  const data = await api.fetch<Post[] | { data: Post[] }>(`/posts?userId=${userId}&limit=12`);
  return normalizeCollection(data);
}

export async function fetchMyProfileWorkouts(userId: string) {
  const data = await api.fetch<Workout[] | { data: Workout[] }>(`/workouts?userId=${userId}`);
  return normalizeCollection(data);
}

export async function fetchMyProfileCrews() {
  const data = await api.fetch<Crew[] | { data: Crew[] }>("/crews/my");
  return normalizeCollection(data);
}
