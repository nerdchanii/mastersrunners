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

const DEV_FEED_PREVIEW_TARGET = 4;
const DEV_FEED_MOCKS_ENABLED = import.meta.env.DEV;

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

interface MockFeedPost {
  id: string;
  content: string;
  visibility: "PUBLIC";
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
  isLiked: boolean;
  images: Array<{
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
    };
  }>;
}

interface MockFeedWorkout {
  id: string;
  distance: number;
  duration: number;
  pace: number;
  date: string;
  visibility: "PUBLIC";
  memo: string | null;
  createdAt: string;
  encodedPolyline?: string | null;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
  isLiked: boolean;
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
  {
    id: "guest-post-3",
    content: "퇴근 후 6km. 바람이 차서 초반은 무거웠는데 후반에 리듬이 올라왔다.",
    hashtags: ["퇴근런", "평일러닝", "도심코스"],
    createdAt: "2026-04-02T10:10:00.000Z",
    user: {
      id: "guest-runner-3",
      name: "목요템포",
      profileImage: null,
    },
    _count: {
      likes: 0,
      comments: 0,
    },
    workouts: [
      {
        workout: {
          id: "guest-workout-3",
          distance: 6200,
          duration: 1884,
          pace: 304,
          date: "2026-04-02T09:45:00.000Z",
          avgHeartRate: 154,
          avgCadence: 174,
          workoutType: {
            name: "템포런",
          },
        },
      },
    ],
  },
  {
    id: "guest-post-4",
    content: "토요일 장거리 전날이라서 오늘은 스트라이드 몇 개만 가볍게.",
    hashtags: ["장거리준비", "스트라이드", "컨디션체크"],
    createdAt: "2026-04-03T11:50:00.000Z",
    user: {
      id: "guest-runner-4",
      name: "주말롱런러",
      profileImage: null,
    },
    _count: {
      likes: 0,
      comments: 0,
    },
    workouts: [],
  },
];

const devMockPosts: MockFeedPost[] = [
  {
    id: "dev-post-1",
    content:
      "새 신발 길들이기 겸 여의도 루프 8km. 4km 지나고 나서 발목이 안정돼서 마지막은 조금 더 밀어봤다.",
    visibility: "PUBLIC",
    hashtags: ["여의도", "신발테스트", "이브닝런"],
    createdAt: "2026-04-06T10:20:00.000Z",
    user: {
      id: "dev-runner-1",
      name: "루프콜렉터",
      profileImage: null,
    },
    _count: {
      likes: 18,
      comments: 4,
    },
    isLiked: false,
    images: [],
    workouts: [
      {
        workout: {
          id: "dev-post-workout-1",
          distance: 8000,
          duration: 2496,
          pace: 312,
          date: "2026-04-06T09:55:00.000Z",
        },
      },
    ],
  },
  {
    id: "dev-post-2",
    content:
      "오늘 인터벌은 1km x 5. 세 번째부터 숨이 턱까지 찼는데 회복 구간에서 페이스가 잘 내려와서 만족.",
    visibility: "PUBLIC",
    hashtags: ["인터벌", "트랙", "10K훈련"],
    createdAt: "2026-04-05T19:15:00.000Z",
    user: {
      id: "dev-runner-2",
      name: "수요인터벌",
      profileImage: null,
    },
    _count: {
      likes: 26,
      comments: 7,
    },
    isLiked: true,
    images: [],
    workouts: [
      {
        workout: {
          id: "dev-post-workout-2",
          distance: 11200,
          duration: 3210,
          pace: 286,
          date: "2026-04-05T18:40:00.000Z",
        },
      },
    ],
  },
  {
    id: "dev-post-3",
    content:
      "비 온 뒤라 노면이 미끄러워서 완전 회복 조깅으로 전환. 기록보다 리듬 유지에 집중한 날.",
    visibility: "PUBLIC",
    hashtags: ["회복런", "비온뒤", "기분좋은페이스"],
    createdAt: "2026-04-04T22:05:00.000Z",
    user: {
      id: "dev-runner-3",
      name: "새벽호흡",
      profileImage: null,
    },
    _count: {
      likes: 9,
      comments: 2,
    },
    isLiked: false,
    images: [],
    workouts: [],
  },
  {
    id: "dev-post-4",
    content: "한 주 마무리 롱런 24km. 18km부터 집중력이 흔들렸는데 급수 타이밍 잡고 다시 정리됐다.",
    visibility: "PUBLIC",
    hashtags: ["롱런", "마라톤준비", "보급전략"],
    createdAt: "2026-04-03T07:40:00.000Z",
    user: {
      id: "dev-runner-4",
      name: "서브330도전",
      profileImage: null,
    },
    _count: {
      likes: 42,
      comments: 11,
    },
    isLiked: false,
    images: [],
    workouts: [
      {
        workout: {
          id: "dev-post-workout-4",
          distance: 24000,
          duration: 7524,
          pace: 314,
          date: "2026-04-03T06:20:00.000Z",
        },
      },
    ],
  },
];

const devMockWorkouts: MockFeedWorkout[] = [
  {
    id: "dev-workout-1",
    distance: 15300,
    duration: 5100,
    pace: 333,
    date: "2026-04-06T06:00:00.000Z",
    visibility: "PUBLIC",
    memo: "업힐이 많은 코스였지만 심박은 안정적. 장거리 다음날 조깅치고 느낌이 꽤 좋았다.",
    createdAt: "2026-04-06T07:55:00.000Z",
    encodedPolyline: "_p~iF~ps|U_ulLnnqC_mqNvxq`@",
    user: {
      id: "dev-workout-user-1",
      name: "언덕적응중",
      profileImage: null,
    },
    _count: {
      likes: 14,
      comments: 3,
    },
    isLiked: false,
  },
  {
    id: "dev-workout-2",
    distance: 8200,
    duration: 2361,
    pace: 288,
    date: "2026-04-05T18:30:00.000Z",
    visibility: "PUBLIC",
    memo: "마지막 2km만 조금 더 밀어본 빌드업. 다음엔 중간 구간을 더 안정적으로 가져가고 싶다.",
    createdAt: "2026-04-05T19:10:00.000Z",
    encodedPolyline: "_izlhA~rlgdF_{geC~ywl@_kwzCn`{nI",
    user: {
      id: "dev-workout-user-2",
      name: "금요빌드업",
      profileImage: null,
    },
    _count: {
      likes: 21,
      comments: 5,
    },
    isLiked: true,
  },
  {
    id: "dev-workout-3",
    distance: 5000,
    duration: 1775,
    pace: 355,
    date: "2026-04-04T21:10:00.000Z",
    visibility: "PUBLIC",
    memo: "몸이 무거워서 짧게 마무리. 대신 케이던스만 무너지지 않게 체크했다.",
    createdAt: "2026-04-04T21:55:00.000Z",
    user: {
      id: "dev-workout-user-3",
      name: "회복중달림",
      profileImage: null,
    },
    _count: {
      likes: 6,
      comments: 1,
    },
    isLiked: false,
  },
  {
    id: "dev-workout-4",
    distance: 12000,
    duration: 4104,
    pace: 342,
    date: "2026-04-03T05:35:00.000Z",
    visibility: "PUBLIC",
    memo: "출근 전 공복 러닝. 무리 없이 끝내는 게 목표였고 딱 그 정도로 잘 끝났다.",
    createdAt: "2026-04-03T06:40:00.000Z",
    encodedPolyline: "udnnFf`ejVq}@o}@n}@_|B",
    user: {
      id: "dev-workout-user-4",
      name: "출근전한바퀴",
      profileImage: null,
    },
    _count: {
      likes: 11,
      comments: 0,
    },
    isLiked: false,
  },
];

function fillWithDevMocks<T>(items: T[], mocks: T[], target = DEV_FEED_PREVIEW_TARGET) {
  if (!DEV_FEED_MOCKS_ENABLED || items.length >= target) {
    return items;
  }

  return [...items, ...mocks.slice(0, target - items.length)];
}

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
    <div className="mt-8 px-4 md:px-0">
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
  const displayPostItems = fillWithDevMocks(postItems, devMockPosts);
  const displayWorkoutItems = fillWithDevMocks(workoutItems, devMockWorkouts);
  const showFeedShowcase = !isAuthenticated;
  const showFeedDiscovery =
    !postInitial && !workoutInitial && postItems.length === 0 && workoutItems.length === 0;
  const showDevMockNotice =
    isAuthenticated &&
    DEV_FEED_MOCKS_ENABLED &&
    (displayPostItems.length > postItems.length ||
      displayWorkoutItems.length > workoutItems.length);

  const isInitial = activeTab === "posts" ? postInitial : workoutInitial;
  const items = activeTab === "posts" ? displayPostItems : displayWorkoutItems;
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
    <div className="-mx-4 w-auto md:mx-auto md:w-full md:max-w-2xl">
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
            {showDevMockNotice ? (
              <div className="mb-3 rounded-xl border border-dashed border-border/80 bg-muted/35 px-4 py-3 text-xs text-muted-foreground">
                개발 환경에서는 피드 확인을 위해 샘플 mock 항목이 함께 표시됩니다.
              </div>
            ) : null}
            <InfiniteScroll hasMore={hasMore} loading={loading} onLoadMore={handleLoadMore}>
              <div>
                {activeTab === "posts"
                  ? displayPostItems.map((item) => <PostFeedCard key={item.id} post={item} />)
                  : displayWorkoutItems.map((item) => <FeedCard key={item.id} workout={item} />)}
              </div>
            </InfiniteScroll>
          </div>
        )}
      </div>
    </div>
  );
}
