import { useState, useEffect, useCallback } from "react";
import { Rss, Dumbbell } from "lucide-react";
import FeedCard from "@/components/feed/FeedCard";
import PostFeedCard from "@/components/feed/PostFeedCard";
import { FeedSidebar } from "@/components/feed/FeedSidebar";
import { InfiniteScroll } from "@/components/common/InfiniteScroll";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingPage } from "@/components/common/LoadingPage";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface PostFeedItem {
  id: string;
  content: string;
  visibility: string;
  hashtags: string[];
  createdAt: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
  workouts: Array<{
    workout: {
      id: string;
      distance: number;
      duration: number;
      pace: number;
      date: string;
    };
  }>;
}

interface WorkoutFeedItem {
  id: string;
  distance: number;
  duration: number;
  pace: number;
  date: string;
  visibility: string;
  memo: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
}

interface FeedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

type FeedTab = "posts" | "workouts";

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>("posts");

  const [postItems, setPostItems] = useState<PostFeedItem[]>([]);
  const [postCursor, setPostCursor] = useState<string | null>(null);
  const [postHasMore, setPostHasMore] = useState(true);
  const [postLoading, setPostLoading] = useState(false);
  const [postInitial, setPostInitial] = useState(true);

  const [workoutItems, setWorkoutItems] = useState<WorkoutFeedItem[]>([]);
  const [workoutCursor, setWorkoutCursor] = useState<string | null>(null);
  const [workoutHasMore, setWorkoutHasMore] = useState(true);
  const [workoutLoading, setWorkoutLoading] = useState(false);
  const [workoutInitial, setWorkoutInitial] = useState(true);

  const fetchPosts = useCallback(
    async (cursor?: string | null) => {
      if (postLoading) return;
      setPostLoading(true);
      try {
        let path = "/feed/posts?limit=10";
        if (cursor) path += `&cursor=${encodeURIComponent(cursor)}`;
        const data = await api.fetch<FeedResponse<PostFeedItem>>(path);
        const items = data?.items ?? [];
        setPostItems((prev) => (cursor ? [...prev, ...items] : items));
        setPostCursor(data?.nextCursor ?? null);
        setPostHasMore(data?.hasMore ?? false);
      } catch {
        // silent
      } finally {
        setPostLoading(false);
        setPostInitial(false);
      }
    },
    [postLoading]
  );

  const fetchWorkouts = useCallback(
    async (cursor?: string | null) => {
      if (workoutLoading) return;
      setWorkoutLoading(true);
      try {
        let path = "/feed/workouts?limit=10&excludeLinkedToPost=true";
        if (cursor) path += `&cursor=${encodeURIComponent(cursor)}`;
        const data = await api.fetch<FeedResponse<WorkoutFeedItem>>(path);
        const items = data?.items ?? [];
        setWorkoutItems((prev) => (cursor ? [...prev, ...items] : items));
        setWorkoutCursor(data?.nextCursor ?? null);
        setWorkoutHasMore(data?.hasMore ?? false);
      } catch {
        // silent
      } finally {
        setWorkoutLoading(false);
        setWorkoutInitial(false);
      }
    },
    [workoutLoading]
  );

  useEffect(() => {
    fetchPosts();
    fetchWorkouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isInitial = activeTab === "posts" ? postInitial : workoutInitial;
  const items = activeTab === "posts" ? postItems : workoutItems;
  const loading = activeTab === "posts" ? postLoading : workoutLoading;
  const hasMore = activeTab === "posts" ? postHasMore : workoutHasMore;

  const handleLoadMore = useCallback(() => {
    if (activeTab === "posts") {
      fetchPosts(postCursor);
    } else {
      fetchWorkouts(workoutCursor);
    }
  }, [activeTab, postCursor, workoutCursor, fetchPosts, fetchWorkouts]);

  return (
    <div className="flex gap-8">
      {/* Main Feed Column */}
      <div className="flex-1 min-w-0 max-w-xl mx-auto lg:mx-0">
        {/* Tabs */}
        <div className="sticky top-0 z-10 flex border-b bg-background/95 backdrop-blur-sm md:top-14">
          <button
            onClick={() => setActiveTab("posts")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors border-b-2",
              activeTab === "posts"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Rss className="size-4" />
            게시글
          </button>
          <button
            onClick={() => setActiveTab("workouts")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors border-b-2",
              activeTab === "workouts"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Dumbbell className="size-4" />
            워크아웃
          </button>
        </div>

        {/* Feed Content */}
        {isInitial ? (
          <LoadingPage variant="feed" className="mt-4" />
        ) : items.length === 0 ? (
          <EmptyState
            title={
              activeTab === "posts"
                ? "아직 게시글이 없습니다"
                : "아직 워크아웃이 없습니다"
            }
            description="팔로우하는 러너들의 기록이 여기에 표시됩니다."
          />
        ) : (
          <InfiniteScroll
            hasMore={hasMore}
            loading={loading}
            onLoadMore={handleLoadMore}
          >
            <div>
              {activeTab === "posts"
                ? postItems.map((item) => (
                    <PostFeedCard key={item.id} post={item} />
                  ))
                : workoutItems.map((item) => (
                    <FeedCard key={item.id} workout={item} />
                  ))}
            </div>
          </InfiniteScroll>
        )}
      </div>

      {/* Desktop Sidebar */}
      <FeedSidebar />
    </div>
  );
}
