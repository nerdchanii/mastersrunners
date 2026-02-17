import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface Workout {
  id: string;
  distance: number;
  duration: number;
  pace: number;
  date: string;
  memo: string | null;
  visibility: "PRIVATE" | "FOLLOWERS" | "PUBLIC";
  workoutType?: { id: string; name: string };
  shoe?: { id: string; name: string };
}

interface CreateWorkoutDto {
  distance: number;
  duration: number;
  pace: number;
  date: string;
  memo?: string;
  visibility?: string;
  workoutTypeId?: string;
  shoeId?: string;
}

interface UpdateWorkoutDto extends Partial<CreateWorkoutDto> {}

interface WorkoutFeedItem extends Workout {
  createdAt: string;
  user: { id: string; name: string; profileImage: string | null };
  _count: { likes: number; comments: number };
  isLiked?: boolean;
}

interface FeedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const workoutKeys = {
  all: ["workouts"] as const,
  list: () => [...workoutKeys.all, "list"] as const,
  detail: (id: string) => [...workoutKeys.all, "detail", id] as const,
  feed: () => [...workoutKeys.all, "feed"] as const,
};

export function useWorkouts() {
  return useQuery({
    queryKey: workoutKeys.list(),
    queryFn: () => api.fetch<Workout[]>("/workouts"),
    select: (data) => (Array.isArray(data) ? data : []),
  });
}

export function useWorkout(id: string) {
  return useQuery({
    queryKey: workoutKeys.detail(id),
    queryFn: () => api.fetch<Workout>(`/workouts/${id}`),
    enabled: !!id,
  });
}

export function useWorkoutFeed() {
  return useInfiniteQuery({
    queryKey: workoutKeys.feed(),
    queryFn: ({ pageParam }) => {
      let path = "/feed/workouts?limit=10&excludeLinkedToPost=true";
      if (pageParam) path += `&cursor=${encodeURIComponent(pageParam as string)}`;
      return api.fetch<FeedResponse<WorkoutFeedItem>>(path);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage.nextCursor : undefined,
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateWorkoutDto) =>
      api.fetch<Workout>("/workouts", {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.all });
    },
  });
}

export function useUpdateWorkout(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateWorkoutDto) =>
      api.fetch<Workout>(`/workouts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(dto),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.all });
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.fetch(`/workouts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.all });
    },
  });
}
