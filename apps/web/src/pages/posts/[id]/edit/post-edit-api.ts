import { api } from "@/lib/api-client";

interface User {
  id: string;
  name: string;
  profileImage: string | null;
}

interface Workout {
  id: string;
  distance: number;
  duration: number;
  date: string;
  title?: string;
  workoutType?: { name: string };
}

interface PostImage {
  id: string;
  url: string;
  order: number;
}

interface PostWorkoutRelation {
  workout: Workout;
}

interface Post {
  id: string;
  content: string;
  hashtags?: string[];
  visibility: string;
  createdAt: string;
  user: User;
  workouts?: PostWorkoutRelation[];
  images?: PostImage[];
}

export async function fetchEditablePost(postId: string) {
  return api.fetch<Post>(`/posts/${postId}`);
}
