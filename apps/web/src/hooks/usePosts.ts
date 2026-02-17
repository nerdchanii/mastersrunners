import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";

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
      workoutType?: { name: string };
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

export const postKeys = {
  all: ["posts"] as const,
  list: (params?: Record<string, string>) =>
    [...postKeys.all, "list", params] as const,
  detail: (id: string) => [...postKeys.all, "detail", id] as const,
  feed: () => [...postKeys.all, "feed"] as const,
};

export function usePost(id: string) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => api.fetch<Post>(`/posts/${id}`),
    enabled: !!id,
  });
}

export function usePosts(params?: Record<string, string>) {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () => {
      const qs = params
        ? "?" + new URLSearchParams(params).toString()
        : "";
      return api.fetch<Post[]>(`/posts${qs}`);
    },
    select: (data) => (Array.isArray(data) ? data : []),
  });
}

export function usePostFeed() {
  return useInfiniteQuery({
    queryKey: postKeys.feed(),
    queryFn: ({ pageParam }) => {
      let path = "/feed/posts?limit=10";
      if (pageParam) path += `&cursor=${encodeURIComponent(pageParam as string)}`;
      return api.fetch<FeedResponse<Post>>(path);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage.nextCursor : undefined,
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
    mutationFn: (id: string) =>
      api.fetch(`/posts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean }) =>
      api.fetch(`/posts/${postId}/likes`, {
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
