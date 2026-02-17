import { useState, useCallback } from "react";
import { Rss, Dumbbell } from "lucide-react";
import FeedCard from "@/components/feed/FeedCard";
import PostFeedCard from "@/components/feed/PostFeedCard";
import { FeedSidebar } from "@/components/feed/FeedSidebar";
import { InfiniteScroll } from "@/components/common/InfiniteScroll";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingPage } from "@/components/common/LoadingPage";
import { usePostFeed } from "@/hooks/usePosts";
import { useWorkoutFeed } from "@/hooks/useWorkouts";
import { cn } from "@/lib/utils";

type FeedTab = "posts" | "workouts";

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>("posts");

  const {
    data: postPages,
    fetchNextPage: fetchMorePosts,
    hasNextPage: postHasMore,
    isFetchingNextPage: postFetching,
    isLoading: postInitial,
  } = usePostFeed();

  const {
    data: workoutPages,
    fetchNextPage: fetchMoreWorkouts,
    hasNextPage: workoutHasMore,
    isFetchingNextPage: workoutFetching,
    isLoading: workoutInitial,
  } = useWorkoutFeed();

  const postItems = postPages?.pages.flatMap((p) => p?.items ?? []) ?? [];
  const workoutItems = workoutPages?.pages.flatMap((p) => p?.items ?? []) ?? [];

  const isInitial = activeTab === "posts" ? postInitial : workoutInitial;
  const items = activeTab === "posts" ? postItems : workoutItems;
  const loading = activeTab === "posts" ? postFetching : workoutFetching;
  const hasMore = activeTab === "posts" ? (postHasMore ?? false) : (workoutHasMore ?? false);

  const handleLoadMore = useCallback(() => {
    if (activeTab === "posts") {
      fetchMorePosts();
    } else {
      fetchMoreWorkouts();
    }
  }, [activeTab, fetchMorePosts, fetchMoreWorkouts]);

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
