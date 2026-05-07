import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";

import {
  cleanQueryParams,
  cursorlessQueryParams,
  invalidateQueryKeys,
  type QueryParams,
  toQueryString,
} from "./query-key-utils";

export type WorkoutVisibility = "PRIVATE" | "FOLLOWERS" | "PUBLIC";

interface Workout {
  id: string;
  distance: number;
  duration: number;
  pace: number;
  date: string;
  memo: string | null;
  visibility: WorkoutVisibility;
  liked?: boolean;
  likeCount?: number;
  commentCount?: number;
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

type UpdateWorkoutDto = Partial<CreateWorkoutDto>;

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

export type WorkoutListParams = QueryParams;
export type WorkoutFeedParams = QueryParams & {
  cursor?: string | null;
  excludeLinked?: boolean;
  limit?: number;
};

export const workoutKeys = {
  all: ["workouts"] as const,
  listFamily: () => [...workoutKeys.all, "list"] as const,
  list: (params?: WorkoutListParams) =>
    [...workoutKeys.listFamily(), cleanQueryParams(params)] as const,
  detail: (id: string) => [...workoutKeys.all, "detail", id] as const,
  feedFamily: () => [...workoutKeys.all, "feed"] as const,
  feed: (params?: WorkoutFeedParams) =>
    params
      ? ([...workoutKeys.feedFamily(), cursorlessQueryParams(params)] as const)
      : workoutKeys.feedFamily(),
};

export const workoutInvalidationTargets = {
  updateVisibility: (workoutId: string) => [
    workoutKeys.detail(workoutId),
    workoutKeys.listFamily(),
    workoutKeys.feedFamily(),
  ],
  update: (workoutId: string) => [
    workoutKeys.detail(workoutId),
    workoutKeys.listFamily(),
    workoutKeys.feedFamily(),
  ],
  delete: () => [workoutKeys.all],
};

export function useWorkouts(params?: WorkoutListParams) {
  return useQuery({
    queryKey: workoutKeys.list(params),
    queryFn: () => api.fetch<Workout[]>(`/workouts${toQueryString(params)}`),
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

export function useWorkoutFeed(enabled = true) {
  const baseParams = { excludeLinked: true, limit: 10 };

  return useInfiniteQuery({
    queryKey: workoutKeys.feed(baseParams),
    queryFn: ({ pageParam }) => {
      let path = `/feed/workouts${toQueryString(baseParams)}`;
      if (pageParam) path += `&cursor=${encodeURIComponent(pageParam as string)}`;
      return api.fetch<FeedResponse<WorkoutFeedItem>>(path);
    },
    enabled,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage?.hasMore ? lastPage.nextCursor : undefined),
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
    onSuccess: () => invalidateQueryKeys(queryClient, workoutInvalidationTargets.update(id)),
  });
}

export function useUpdateWorkoutVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ visibility, workoutId }: { visibility: WorkoutVisibility; workoutId: string }) =>
      api.fetch<Workout>(`/workouts/${workoutId}`, {
        method: "PATCH",
        body: JSON.stringify({ visibility }),
      }),
    onSuccess: (_result, { workoutId }) =>
      invalidateQueryKeys(queryClient, workoutInvalidationTargets.updateVisibility(workoutId)),
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.fetch(`/workouts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.all });
    },
  });
}
