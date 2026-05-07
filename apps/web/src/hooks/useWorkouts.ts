import {
  type QueryClient,
  type QueryKey,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

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
    onMutate: async ({ visibility, workoutId }) => {
      const detailKey = workoutKeys.detail(workoutId);
      const listKey = workoutKeys.listFamily();
      const feedKey = workoutKeys.feedFamily();

      await queryClient.cancelQueries({ queryKey: detailKey });
      await queryClient.cancelQueries({ queryKey: listKey });
      await queryClient.cancelQueries({ queryKey: feedKey });

      const previousDetail = queryClient.getQueryData(detailKey);
      const previousLists = queryClient.getQueriesData({ queryKey: listKey });
      const previousFeeds = queryClient.getQueriesData({ queryKey: feedKey });

      queryClient.setQueryData(detailKey, (current) =>
        updateWorkoutVisibilityInCache(current, workoutId, visibility),
      );
      queryClient.setQueriesData({ queryKey: listKey }, (current) =>
        updateWorkoutVisibilityInCache(current, workoutId, visibility),
      );
      queryClient.setQueriesData({ queryKey: feedKey }, (current) =>
        updateWorkoutVisibilityInCache(current, workoutId, visibility),
      );

      return { detailKey, previousDetail, previousFeeds, previousLists };
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(context.detailKey, context.previousDetail);
      restoreQuerySnapshots(queryClient, context.previousLists);
      restoreQuerySnapshots(queryClient, context.previousFeeds);
    },
    onSuccess: (_result, { workoutId }) =>
      invalidateQueryKeys(queryClient, workoutInvalidationTargets.updateVisibility(workoutId)),
  });
}

export function useWorkoutVisibilityInteraction({
  initialVisibility,
  onError,
  workoutId,
}: {
  initialVisibility: WorkoutVisibility;
  onError?: (error: unknown) => void;
  workoutId: string;
}) {
  const updateVisibility = useUpdateWorkoutVisibility();
  const [visibility, setVisibility] = useState<WorkoutVisibility>(initialVisibility);
  const currentWorkoutIdRef = useRef(workoutId);
  currentWorkoutIdRef.current = workoutId;

  useEffect(() => {
    setVisibility(initialVisibility);
  }, [initialVisibility, workoutId]);

  const changeVisibility = async (newVisibility: WorkoutVisibility) => {
    if (newVisibility === visibility) return;

    const previousVisibility = visibility;
    const requestWorkoutId = workoutId;
    setVisibility(newVisibility);

    try {
      const updatedWorkout = await updateVisibility.mutateAsync({
        visibility: newVisibility,
        workoutId,
      });
      if (currentWorkoutIdRef.current === requestWorkoutId) {
        setVisibility(updatedWorkout.visibility);
      }
    } catch (err) {
      if (currentWorkoutIdRef.current === requestWorkoutId) {
        setVisibility(previousVisibility);
        onError?.(err);
      }
      throw err;
    }
  };

  return {
    changeVisibility,
    isPending: updateVisibility.isPending,
    visibility,
  };
}

function restoreQuerySnapshots(queryClient: QueryClient, snapshots: [QueryKey, unknown][]) {
  snapshots.forEach(([queryKey, value]) => {
    queryClient.setQueryData(queryKey, value);
  });
}

function updateWorkoutVisibilityInCache(
  current: unknown,
  workoutId: string,
  visibility: WorkoutVisibility,
): unknown {
  if (!current) {
    return current;
  }

  if (Array.isArray(current)) {
    return current.map((item) => updateWorkoutVisibilityInCache(item, workoutId, visibility));
  }

  if (!isRecord(current)) {
    return current;
  }

  if (hasPages(current)) {
    return {
      ...current,
      pages: current.pages.map((page) =>
        updateWorkoutVisibilityInCache(page, workoutId, visibility),
      ),
    };
  }

  if (hasItems(current)) {
    return {
      ...current,
      items: current.items.map((item) =>
        updateWorkoutVisibilityInCache(item, workoutId, visibility),
      ),
    };
  }

  if (isMatchingEntity(current, workoutId)) {
    return {
      ...current,
      visibility,
    };
  }

  return current;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasPages(value: Record<string, unknown>): value is Record<string, unknown> & {
  pages: unknown[];
} {
  return Array.isArray(value.pages);
}

function hasItems(value: Record<string, unknown>): value is Record<string, unknown> & {
  items: unknown[];
} {
  return Array.isArray(value.items);
}

function isMatchingEntity(
  value: Record<string, unknown>,
  workoutId: string,
): value is Record<string, unknown> & { id: string } {
  return value.id === workoutId;
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
