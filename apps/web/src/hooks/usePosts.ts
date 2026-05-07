import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";

import {
  cleanQueryParams,
  cursorlessQueryParams,
  type QueryParams,
  toQueryString,
} from "./query-key-utils";

interface PostImage {
  id: string;
  url: string;
  order: number;
}

interface Post {
  id: string;
  content: string;
  visibility: string;
  hashtags: string[];
  createdAt: string;
  user: { id: string; name: string; profileImage: string | null };
  _count: { likes: number; comments: number };
  isLiked?: boolean;
  images?: PostImage[];
  workouts: Array<{
    workout: {
      id: string;
      distance: number;
      duration: number;
      pace: number;
      date: string;
      elevationGain?: number | null;
      avgHeartRate?: number | null;
      avgCadence?: number | null;
      calories?: number | null;
      workoutType?: { id?: string; name: string; category?: string };
      route?: { encodedPolyline: string } | null;
    };
  }>;
}

interface FeedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface CreatePostDto {
  content: string;
  visibility?: string;
  hashtags?: string[];
  workoutIds?: string[];
  imageUrls?: string[];
}

export type PostListParams = QueryParams;
export type PostFeedParams = QueryParams & {
  cursor?: string | null;
  limit?: number;
};

export const postKeys = {
  all: ["posts"] as const,
  list: (params?: PostListParams) => [...postKeys.all, "list", cleanQueryParams(params)] as const,
  detail: (id: string) => [...postKeys.all, "detail", id] as const,
  feedFamily: () => [...postKeys.all, "feed"] as const,
  feed: (params?: PostFeedParams) =>
    params
      ? ([...postKeys.feedFamily(), cursorlessQueryParams(params)] as const)
      : postKeys.feedFamily(),
};

export function usePost(id: string) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => api.fetch<Post>(`/posts/${id}`),
    enabled: !!id,
  });
}

export function usePosts(params?: PostListParams) {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () => api.fetch<Post[]>(`/posts${toQueryString(params)}`),
    select: (data) => (Array.isArray(data) ? data : []),
  });
}

export function usePostFeed(enabled = true) {
  const baseParams = { limit: 10 };

  return useInfiniteQuery({
    queryKey: postKeys.feed(baseParams),
    queryFn: ({ pageParam }) => {
      let path = `/feed/posts${toQueryString(baseParams)}`;
      if (pageParam) path += `&cursor=${encodeURIComponent(pageParam as string)}`;
      return api.fetch<FeedResponse<Post>>(path);
    },
    enabled,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage?.hasMore ? lastPage.nextCursor : undefined),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePostDto) =>
      api.fetch<Post>("/posts", {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

export function useUpdatePost(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: Partial<CreatePostDto>) =>
      api.fetch<Post>(`/posts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(dto),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.fetch(`/posts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean }) =>
      api.fetch(`/posts/${postId}/like`, {
        method: isLiked ? "DELETE" : "POST",
      }),
    onMutate: async ({ postId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) });
      const previous = queryClient.getQueryData(postKeys.detail(postId));
      queryClient.setQueryData(postKeys.detail(postId), (old: Post | undefined) => {
        if (!old) return old;
        return {
          ...old,
          isLiked: !isLiked,
          _count: {
            ...old._count,
            likes: old._count.likes + (isLiked ? -1 : 1),
          },
        };
      });
      return { previous };
    },
    onError: (_err, { postId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(postKeys.detail(postId), context.previous);
      }
    },
    onSettled: (_data, _err, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
    },
  });
}
