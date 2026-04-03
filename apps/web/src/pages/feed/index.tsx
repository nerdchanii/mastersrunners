import { useQuery } from "@tanstack/react-query";
import { CalendarDays, type LucideIcon, Search, Sparkles, Users } from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";
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
import { defaultPublicRuntimeConfig, usePublicRuntimeConfig } from "@/lib/public-config";
import { cn } from "@/lib/utils";

type FeedTab = "posts" | "workouts";

const runnerSeeds = ["김", "이", "박"];

interface SupportItem {
  id: string;
  title: string;
  date?: string;
  startDate?: string;
  targetValue?: number;
  targetUnit?: string;
}

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

function useFeedEvents(enabled: boolean) {
  return useQuery({
    queryKey: ["feed", "events"],
    queryFn: () => api.fetch<SupportItem[]>("/events"),
    enabled,
    staleTime: 60_000,
  });
}

function useFeedChallenges(enabled: boolean) {
  return useQuery({
    queryKey: ["feed", "challenges"],
    queryFn: () => api.fetch<SupportItem[]>("/challenges"),
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

function SupportList({
  items,
  emptyLabel,
  emptyDescription,
  emptyHref,
  icon: Icon,
  title,
}: {
  items: Array<SupportItem>;
  emptyLabel: string;
  emptyDescription: string;
  emptyHref: string;
  icon: LucideIcon;
  title: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4">
        <p className="text-sm font-medium text-foreground">{emptyLabel}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{emptyDescription}</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to={emptyHref}>{title} 보기</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.slice(0, 3).map((item) => {
        const timestamp = item.date ?? item.startDate;
        const dateLabel = timestamp
          ? new Date(timestamp).toLocaleDateString("ko-KR", {
              month: "short",
              day: "numeric",
            })
          : "기간 확인";

        return (
          <Link
            key={item.id}
            to={emptyHref === "/events" ? `/events/${item.id}` : `/challenges/${item.id}`}
            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/80 p-3 transition-colors hover:bg-accent/50"
          >
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
              <p className="truncate text-xs text-muted-foreground">{dateLabel}</p>
            </div>
            <span className="text-xs text-muted-foreground">
              {item.targetValue ? `${item.targetValue}${item.targetUnit ?? ""}` : ""}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function EmptyFeedDiscovery() {
  const { user, isAuthenticated } = useAuth();
  const { data: runtimeConfig } = usePublicRuntimeConfig();
  const config = runtimeConfig ?? defaultPublicRuntimeConfig;
  const canLoadSecondaryModules = isAuthenticated;
  const { data: events = [], isLoading: eventsLoading } = useFeedEvents(
    config.features.events && canLoadSecondaryModules,
  );
  const { data: challenges = [], isLoading: challengesLoading } = useFeedChallenges(
    config.features.challenges && canLoadSecondaryModules,
  );

  return (
    <div className="mt-6 space-y-6">
      <Card className="border-border/70 bg-gradient-to-br from-background via-background to-primary/5 shadow-sm">
        <CardContent className="flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              <Sparkles className="size-3.5" />
              추천 준비 완료
            </Badge>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {user
                  ? `${user.name} 님에게 맞는 탐색부터 먼저 열어둘게요.`
                  : "아직 조용한 피드도, 바로 시작할 수 있습니다."}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                추천 러너를 먼저 보고, 다음에는 크루를 살펴보고, 아래의 이벤트와 챌린지로 흐름을
                이어가면 됩니다.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/search">
                <Search className="size-4" />
                러너 검색
              </Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link to="/crews">
                <Users className="size-4" />
                크루 보기
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <SectionCard
          icon={Users}
          title="추천 러너"
          description="활동과 프로필을 바탕으로 먼저 만나볼 수 있는 러너를 보여줍니다."
        >
          <RunnerList enabled={isAuthenticated} />
        </SectionCard>

        <SectionCard
          icon={Users}
          title="추천 크루"
          description="러닝 스타일과 지역 흐름을 확인하면서 크루를 바로 비교해보세요."
        >
          <CrewList enabled={isAuthenticated} />
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          icon={CalendarDays}
          title="다가오는 이벤트"
          description="참여 가능한 이벤트를 먼저 확인하고, 관심 있는 일정부터 표시해두세요."
        >
          {!canLoadSecondaryModules ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4">
              <p className="text-sm font-medium text-foreground">
                로그인하면 이벤트 탐색이 열립니다.
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                먼저 커뮤니티 흐름을 둘러본 뒤, 로그인하면 일정과 참여 상태를 이어서 확인할 수
                있습니다.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link to="/login?next=/feed">로그인하기</Link>
              </Button>
            </div>
          ) : eventsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-border/60 p-4">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="mt-3 h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <SupportList
              items={events}
              emptyLabel="다가오는 이벤트가 없습니다."
              emptyDescription="새 이벤트가 등록되면 여기서 바로 확인할 수 있습니다."
              emptyHref="/events"
              icon={CalendarDays}
              title="이벤트"
            />
          )}
        </SectionCard>

        <SectionCard
          icon={Sparkles}
          title="참여 가능한 챌린지"
          description="목표를 정해두면 피드가 단순한 목록이 아니라 행동으로 이어집니다."
        >
          {!canLoadSecondaryModules ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4">
              <p className="text-sm font-medium text-foreground">
                로그인하면 챌린지 참여 흐름이 열립니다.
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                추천 러너와 크루를 먼저 보고, 로그인 뒤에 챌린지 목표를 이어서 선택할 수 있습니다.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link to="/login?next=/feed">로그인하기</Link>
              </Button>
            </div>
          ) : challengesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-border/60 p-4">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="mt-3 h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <SupportList
              items={challenges}
              emptyLabel="진행 중인 챌린지가 없습니다."
              emptyDescription="챌린지 목록이 열리면 이 섹션에서 바로 확인할 수 있습니다."
              emptyHref="/challenges"
              icon={Sparkles}
              title="챌린지"
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function EmptyActiveTabState({
  activeTab,
  otherItemCount,
  onSwitchTab,
}: {
  activeTab: FeedTab;
  otherItemCount: number;
  onSwitchTab: () => void;
}) {
  const otherTabLabel = activeTab === "posts" ? "워크아웃" : "게시글";
  const title =
    activeTab === "posts"
      ? "게시글은 아직 없지만, 이어서 볼 워크아웃이 있습니다."
      : "워크아웃은 아직 없지만, 읽을 게시글이 있습니다.";
  const description =
    activeTab === "posts"
      ? "지금 탭만 비어 있을 뿐, 피드 전체가 조용한 상태는 아닙니다."
      : "워크아웃 탭이 비어 있어도 다른 탭의 흐름은 계속 이어지고 있습니다.";

  return (
    <Card className="mt-4 border-border/70 bg-background/90 shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {otherTabLabel} 탭에 {otherItemCount}개 있음
          </Badge>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <Button onClick={onSwitchTab} className="rounded-full">
          {otherTabLabel} 보기
        </Button>
      </CardContent>
    </Card>
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
  const showFeedDiscovery =
    !postInitial && !workoutInitial && postItems.length === 0 && workoutItems.length === 0;

  const isInitial = activeTab === "posts" ? postInitial : workoutInitial;
  const items = activeTab === "posts" ? postItems : workoutItems;
  const loading = activeTab === "posts" ? postFetching : workoutFetching;
  const hasMore = activeTab === "posts" ? (postHasMore ?? false) : (workoutHasMore ?? false);
  const otherTabItemCount = activeTab === "posts" ? workoutItems.length : postItems.length;

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
          <EmptyActiveTabState
            activeTab={activeTab}
            otherItemCount={otherTabItemCount}
            onSwitchTab={() => setActiveTab(activeTab === "posts" ? "workouts" : "posts")}
          />
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
    </div>
  );
}
