import { MessageCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";

import { AuthGateDialog } from "@/components/common/AuthGateDialog";
import { InfiniteScroll } from "@/components/common/InfiniteScroll";
import { LoadingPage } from "@/components/common/LoadingPage";
import { UserAvatar } from "@/components/common/UserAvatar";
import FeedCard from "@/components/feed/FeedCard";
import PostFeedCard from "@/components/feed/PostFeedCard";
import { LikeButton } from "@/components/social/LikeButton";
import { WorkoutAttachmentPreview } from "@/components/workout/WorkoutAttachmentPreview";
import { usePostFeed } from "@/hooks/usePosts";
import { useWorkoutFeed } from "@/hooks/useWorkouts";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

type FeedTab = "posts" | "workouts";

interface GuestShowcasePost {
  id: string;
  content: string;
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
  images?: Array<{
    id: string;
    url: string;
    order: number;
  }>;
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
      workoutType?: { name: string };
      route?: { encodedPolyline: string };
    };
  }>;
}

const guestShowcasePosts: GuestShowcasePost[] = [
  {
    id: "guest-post-1",
    content: "한강 반대편 둔치. 가볍게 시작하면 템포는 따라붙는다.",
    hashtags: ["조깅", "한강", "런닝"],
    createdAt: "2026-04-01T06:30:00.000Z",
    user: {
      id: "guest-runner-1",
      name: "아침런너",
      profileImage: null,
    },
    _count: {
      likes: 0,
      comments: 0,
    },
    workouts: [
      {
        workout: {
          id: "guest-workout-1",
          distance: 10500,
          duration: 3320,
          pace: 316,
          date: "2026-04-01T06:00:00.000Z",
          elevationGain: 42,
          avgHeartRate: 148,
          avgCadence: 168,
          workoutType: {
            name: "조깅",
          },
          route: {
            encodedPolyline: "_p~iF~ps|U_ulLnnqC_mqNvxq`@",
          },
        },
      },
    ],
  },
  {
    id: "guest-post-2",
    content: "오늘은 천천히, 내일은 더 강하게.",
    hashtags: ["회복", "저속러닝", "기록관리"],
    createdAt: "2026-04-01T07:15:00.000Z",
    user: {
      id: "guest-runner-2",
      name: "달리기연습생",
      profileImage: null,
    },
    _count: {
      likes: 0,
      comments: 0,
    },
    workouts: [],
  },
];

function GuestFeedPostCard({ post }: { post: GuestShowcasePost }) {
  const [authDialogTitle, setAuthDialogTitle] = useState<string | null>(null);
  const location = useLocation();
  const nextPath = `${location.pathname}${location.search}${location.hash}`;
  const createdAtLabel = new Date(post.createdAt).toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const postHashtags =
    post.hashtags?.map((tag, idx) => (
      <button
        type="button"
        key={`${post.id}-${tag}-${idx}`}
        onClick={() => setAuthDialogTitle("태그 더 보기")}
        aria-label={`${tag} 태그 더 보기`}
        className="rounded-full border border-border/70 px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
      >
        #{tag}
      </button>
    )) ?? [];

  return (
    <>
      <article
        className="border-b bg-card/65 px-4 py-5"
        aria-label={`${post.user.name}님의 게시글`}
      >
        <UserAvatar user={post.user} showName linkToProfile={false} subtitle={createdAtLabel} />

        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {post.content}
        </p>

        {postHashtags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">{postHashtags}</div>
        ) : null}

        {post.workouts.length > 0 ? (
          <section className="mt-4 space-y-3">
            {post.workouts.map(({ workout }) => (
              <WorkoutAttachmentPreview key={workout.id} workout={workout} />
            ))}
          </section>
        ) : null}

        <div className="mt-4 flex items-center gap-1">
          <LikeButton
            entityType="post"
            entityId={post.id}
            initialLiked={false}
            initialCount={post._count?.likes ?? 0}
          />
          <button
            type="button"
            onClick={() => setAuthDialogTitle("댓글 남기기")}
            aria-label="댓글 남기기"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-muted-foreground hover:bg-accent"
          >
            <MessageCircle className="size-5" />
            <span className="text-xs font-medium">댓글</span>
          </button>
        </div>
      </article>

      <AuthGateDialog
        open={authDialogTitle !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAuthDialogTitle(null);
          }
        }}
        nextPath={nextPath}
        title={authDialogTitle ?? "로그인"}
      />
    </>
  );
}

function EmptyFeedDiscovery() {
  return (
    <div className="mt-8 px-4">
      <p className="text-xs text-muted-foreground">표시할 피드가 없습니다.</p>
    </div>
  );
}

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>("posts");
  const { isAuthenticated } = useAuth();

  const {
    data: postPages,
    fetchNextPage: fetchMorePosts,
    hasNextPage: postHasMore,
    isFetchingNextPage: postFetching,
    isLoading: postInitial,
  } = usePostFeed(isAuthenticated);

  const {
    data: workoutPages,
    fetchNextPage: fetchMoreWorkouts,
    hasNextPage: workoutHasMore,
    isFetchingNextPage: workoutFetching,
    isLoading: workoutInitial,
  } = useWorkoutFeed(isAuthenticated);

  const postItems = postPages?.pages.flatMap((p) => p?.items ?? []) ?? [];
  const workoutItems = workoutPages?.pages.flatMap((p) => p?.items ?? []) ?? [];
  const showFeedShowcase = !isAuthenticated;
  const showFeedDiscovery =
    !postInitial && !workoutInitial && postItems.length === 0 && workoutItems.length === 0;

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
    <div className="mx-auto w-full max-w-2xl">
      <div className="min-w-0">
        {isAuthenticated ? (
          <div className="sticky top-0 z-10 flex border-b bg-background/95 backdrop-blur-sm md:top-14">
            <button
              onClick={() => setActiveTab("posts")}
              className={cn(
                "flex-1 border-b-2 py-3 text-sm font-semibold transition-colors",
                activeTab === "posts"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              게시글
            </button>
            <button
              onClick={() => setActiveTab("workouts")}
              className={cn(
                "flex-1 border-b-2 py-3 text-sm font-semibold transition-colors",
                activeTab === "workouts"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              워크아웃
            </button>
          </div>
        ) : null}

        {showFeedShowcase ? (
          <div className="mt-4">
            {guestShowcasePosts.map((post) => (
              <GuestFeedPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : isInitial ? (
          <LoadingPage variant="feed" className="mt-4" />
        ) : showFeedDiscovery ? (
          <EmptyFeedDiscovery />
        ) : items.length === 0 ? (
          <div className="mt-4 min-h-24" aria-hidden="true" />
        ) : (
          <div className="mt-4">
            <InfiniteScroll hasMore={hasMore} loading={loading} onLoadMore={handleLoadMore}>
              <div>
                {activeTab === "posts"
                  ? postItems.map((item) => <PostFeedCard key={item.id} post={item} />)
                  : workoutItems.map((item) => <FeedCard key={item.id} workout={item} />)}
              </div>
            </InfiniteScroll>
          </div>
        )}
      </div>
    </div>
  );
}
