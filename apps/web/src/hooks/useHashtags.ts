import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface Post {
  id: string;
  content: string;
  visibility: string;
  hashtags: string[];
  createdAt: string;
  user: { id: string; name: string; profileImage: string | null };
  _count: { likes: number; comments: number };
  isLiked?: boolean;
  images?: Array<{ id: string; url: string; order: number }>;
  workouts: Array<{
    workout: { id: string; distance: number; duration: number; pace: number; date: string };
  }>;
}

interface FeedResponse {
  items: Post[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface PopularHashtag {
  tag: string;
  count: number;
}

export const hashtagKeys = {
  all: ["hashtags"] as const,
  posts: (tag: string) => [...hashtagKeys.all, "posts", tag] as const,
  popular: () => [...hashtagKeys.all, "popular"] as const,
};

export function useHashtagPosts(tag: string) {
  return useInfiniteQuery({
    queryKey: hashtagKeys.posts(tag),
    queryFn: ({ pageParam }) => {
      let path = `/posts/hashtag/${encodeURIComponent(tag)}?limit=10`;
      if (pageParam) path += `&cursor=${encodeURIComponent(pageParam as string)}`;
      return api.fetch<FeedResponse>(path);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!tag.trim(),
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function usePopularHashtags() {
  return useQuery({
    queryKey: hashtagKeys.popular(),
    queryFn: () => api.fetch<PopularHashtag[]>("/posts/hashtags/popular?limit=10"),
    select: (data) => (Array.isArray(data) ? data : []),
    staleTime: 5 * 60 * 1000, // 5분
    retry: 1,
  });
}
