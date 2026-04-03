import { useQuery } from "@tanstack/react-query";
import { Lock, type LucideIcon, Search, Sparkles, Users, X } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { InfiniteScroll } from "@/components/common/InfiniteScroll";
import { LoadingPage } from "@/components/common/LoadingPage";
import { UserAvatar } from "@/components/common/UserAvatar";
import FeedCard from "@/components/feed/FeedCard";
import { FeedSidebar } from "@/components/feed/FeedSidebar";
import PostFeedCard from "@/components/feed/PostFeedCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePostFeed } from "@/hooks/usePosts";
import { type SearchUser } from "@/hooks/useUserSearch";
import { useWorkoutFeed } from "@/hooks/useWorkouts";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

type FeedTab = "posts" | "workouts";

const runnerSeeds = ["김", "이", "박"];

function useRunnerRecommendations(enabled: boolean) {
  return useQuery({
    queryKey: ["feed", "runner-recommendations"],
    queryFn: async () => {
      const results = await Promise.all(
        runnerSeeds.map(async (seed) => {
          try {
            return await api.fetch<SearchUser[]>(
              `/profile/search?q=${encodeURIComponent(seed)}&limit=4`,
            );
          } catch {
            return [];
          }
        }),
      );

      const unique = results
        .flat()
        .filter(
          (user, index, self) => self.findIndex((candidate) => candidate.id === user.id) === index,
        )
        .sort((left, right) => (right._count?.followers ?? 0) - (left._count?.followers ?? 0));

      return unique.slice(0, 4);
    },
    enabled,
    staleTime: 60_000,
  });
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-4" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

interface CrewSuggestion {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  _count: { members: number };
}

function useCrewRecommendations(enabled: boolean) {
  return useQuery({
    queryKey: ["feed", "crew-recommendations"],
    queryFn: async () => {
      return api.fetch<CrewSuggestion[]>("/crews/recommend");
    },
    enabled,
    staleTime: 60_000,
  });
}

function RunnerList({ enabled }: { enabled: boolean }) {
  const { data: runners = [], isLoading } = useRunnerRecommendations(enabled);

  if (!enabled) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4">
        <p className="text-sm font-medium text-foreground">로그인하면 러너 추천을 볼 수 있어요.</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          커뮤니티 추천은 로그인 후에 더 잘 맞는 방향으로 열립니다.
        </p>
        <Button asChild className="mt-4" size="sm">
          <Link to="/login?next=/feed">
            <Search className="size-4" />
            로그인하기
          </Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-2xl border border-border/60 p-3"
          >
            <Skeleton className="size-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (runners.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4">
        <p className="text-sm font-medium text-foreground">아직 추천할 러너를 찾는 중입니다.</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          프로필을 조금 더 채우면, 더 가까운 러너를 먼저 보여줄 수 있습니다.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to="/search">
            <Search className="size-4" />
            러너 검색
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {runners.map((user) => (
        <Link
          key={user.id}
          to={`/profile/${user.id}`}
          className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/80 p-3 transition-colors hover:bg-accent/50"
        >
          <UserAvatar user={user} size="default" linkToProfile={false} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
              {user.isFollowing && <Badge variant="secondary">팔로잉</Badge>}
            </div>
            {user.bio ? (
              <p className="truncate text-xs text-muted-foreground">{user.bio}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                팔로워 {user._count?.followers ?? 0} · 워크아웃 {user._count?.workouts ?? 0}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function CrewList({ enabled }: { enabled: boolean }) {
  const { data: crews = [], isLoading } = useCrewRecommendations(enabled);

  if (!enabled) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4">
        <p className="text-sm font-medium text-foreground">로그인하면 크루 추천이 열립니다.</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          크루 탐색은 로그인 뒤에 활동과 지역 흐름에 맞춰 이어집니다.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to="/login?next=/feed">
            <Users className="size-4" />
            로그인하기
          </Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-2xl border border-border/60 p-3"
          >
            <Skeleton className="size-11 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (crews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4">
        <p className="text-sm font-medium text-foreground">추천 크루를 불러올 수 없습니다.</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          탐색 페이지에서 지역과 분위기로 크루를 직접 둘러볼 수 있습니다.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to="/crews">
            <Users className="size-4" />
            크루 둘러보기
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {crews.slice(0, 4).map((crew) => (
        <Link
          key={crew.id}
          to={`/crews/${crew.id}`}
          className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/80 p-3 transition-colors hover:bg-accent/50"
        >
          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10">
            {crew.imageUrl ? (
              <img src={crew.imageUrl} alt={crew.name} className="size-full object-cover" />
            ) : (
              <Users className="size-5 text-primary" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-foreground">{crew.name}</p>
              <Badge variant="outline">{crew._count?.members ?? 0}명</Badge>
            </div>
            {crew.description ? (
              <p className="truncate text-xs text-muted-foreground">{crew.description}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                크루 활동과 채팅을 한 번에 볼 수 있습니다.
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function EmptyFeedDiscovery() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="mt-6 space-y-6">
      <Card className="border-border/70 bg-gradient-to-br from-background via-background to-primary/5 shadow-sm">
        <CardContent className="flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              <Sparkles className="size-3.5" />
              {isAuthenticated ? "탐색 시작" : "공개 탐색"}
            </Badge>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {user
                  ? `${user.name} 님이 다시 둘러볼 흐름부터 열어둘게요.`
                  : "공개 크루와 공개 피드부터 먼저 둘러보세요."}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {isAuthenticated
                  ? "러너와 크루를 먼저 둘러보고, 마음에 드는 흐름부터 다시 이어가면 됩니다."
                  : "지금은 공개 크루와 공개 기록만 먼저 보고, 참여나 대화가 필요해질 때 로그인하면 됩니다."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/crews">
                <Users className="size-4" />
                크루 보기
              </Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link to="/search">
                <Search className="size-4" />
                러너 검색
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {isAuthenticated ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <SectionCard
            icon={Users}
            title="추천 러너"
            description="활동과 프로필을 바탕으로 먼저 만나볼 수 있는 러너를 보여줍니다."
          >
            <RunnerList enabled />
          </SectionCard>

          <SectionCard
            icon={Users}
            title="추천 크루"
            description="러닝 스타일과 지역 흐름을 확인하면서 크루를 바로 비교해보세요."
          >
            <CrewList enabled />
          </SectionCard>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)]">
          <div className="rounded-3xl border border-border/70 bg-background/85 p-6 shadow-sm">
            <p className="text-sm font-semibold text-foreground">크루가 가장 좋은 시작점입니다.</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              혼자 들어오더라도 보통은 크루를 통해 활동, 게시판, 채팅 흐름으로 이어집니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-foreground">
              <span className="rounded-full bg-muted/20 px-3 py-1.5">공개 크루</span>
              <span className="rounded-full bg-muted/20 px-3 py-1.5">공개 게시글</span>
              <span className="rounded-full bg-muted/20 px-3 py-1.5">공개 워크아웃</span>
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-background/85 p-6 shadow-sm">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <Lock className="size-4 text-muted-foreground" />
              로그인 후 가능
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              댓글, 채팅, 크루 참여, 기록 작성은 둘러본 뒤 필요해질 때 열면 됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedAuthPrompt({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-16 z-40 px-4 md:bottom-6">
      <div className="mx-auto flex w-full max-w-2xl items-start justify-between gap-4 rounded-[28px] border border-border/70 bg-background/95 p-4 shadow-2xl shadow-black/10 backdrop-blur-lg">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            더 탐색하거나 참여하려면 계정을 열어두면 됩니다.
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            공개 피드는 계속 볼 수 있고, 크루 참여와 댓글, 채팅, 기록 작성은 가입 뒤에 이어집니다.
          </p>
        </div>

        <div className="flex shrink-0 items-start gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link to="/login?intent=login&next=/feed">로그인</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full">
            <Link to="/login?intent=signup&next=/feed">회원가입</Link>
          </Button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            aria-label="로그인 유도 닫기"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>("posts");
  const { isAuthenticated } = useAuth();
  const [hasPassedAuthPromptThreshold, setHasPassedAuthPromptThreshold] = useState(false);
  const [dismissedAuthPrompt, setDismissedAuthPrompt] = useState(false);

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
  const showFeedDiscovery =
    !postInitial && !workoutInitial && postItems.length === 0 && workoutItems.length === 0;

  const isInitial = activeTab === "posts" ? postInitial : workoutInitial;
  const items = activeTab === "posts" ? postItems : workoutItems;
  const loading = activeTab === "posts" ? postFetching : workoutFetching;
  const hasMore = activeTab === "posts" ? (postHasMore ?? false) : (workoutHasMore ?? false);
  const showAuthPrompt =
    !isAuthenticated &&
    !dismissedAuthPrompt &&
    hasPassedAuthPromptThreshold &&
    (postItems.length > 0 || workoutItems.length > 0);

  useEffect(() => {
    if (isAuthenticated || dismissedAuthPrompt) {
      return;
    }

    const handleScroll = () => {
      if (window.scrollY >= 640) {
        setHasPassedAuthPromptThreshold(true);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [dismissedAuthPrompt, isAuthenticated]);

  const handleLoadMore = useCallback(() => {
    if (activeTab === "posts") {
      fetchMorePosts();
    } else {
      fetchMoreWorkouts();
    }
  }, [activeTab, fetchMorePosts, fetchMoreWorkouts]);

  return (
    <div className="flex gap-8">
      <div className="mx-auto min-w-0 flex-1 max-w-xl lg:mx-0">
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

        {isInitial ? (
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

      <FeedSidebar />

      {showAuthPrompt ? <FeedAuthPrompt onDismiss={() => setDismissedAuthPrompt(true)} /> : null}
    </div>
  );
}
