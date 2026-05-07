import { Activity, AlertCircle, Grid3x3, MessageCircle, Users } from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { TimeAgo } from "@/components/common/TimeAgo";
import { UserAvatar } from "@/components/common/UserAvatar";
import FeedCard from "@/components/feed/FeedCard";
import PostFeedCard from "@/components/feed/PostFeedCard";
import { PostImageGallery } from "@/components/post/PostImageGallery";
import { LikeButton } from "@/components/social/LikeButton";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: string;
  name: string;
  profileImage: string | null;
}

interface Post {
  id: string;
  content: string;
  visibility?: string;
  hashtags?: string[];
  createdAt: string;
  likesCount?: number;
  commentsCount?: number;
  _count?: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
  images?: Array<{
    id: string;
    url?: string;
    imageUrl?: string;
    order?: number;
    sortOrder?: number;
  }>;
  workouts?: Array<{
    workout: {
      id: string;
      distance: number;
      duration: number;
      pace: number;
      date: string;
    };
  }>;
  user: User;
}

interface Workout {
  id: string;
  distance: number;
  duration: number;
  pace: number;
  date: string;
  visibility?: string;
  memo: string | null;
  createdAt?: string;
  encodedPolyline?: string | null;
  isLiked?: boolean;
  workoutType?: {
    id: string;
    name: string;
  };
  user?: User;
  _count?: {
    likes: number;
    comments: number;
  };
}

interface Crew {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  _count: {
    members: number;
  };
}

interface CrewPost {
  id: string;
  crewId: string;
  content: string;
  createdAt: string;
  user: User;
  _count: {
    likes: number;
    comments: number;
  };
  images: Array<{
    id: string;
    url: string;
    order: number;
  }>;
  crew: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

interface ProfileTabsProps {
  posts: Post[];
  workouts: Workout[];
  crews: Crew[];
  crewPosts: CrewPost[];
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  showWorkoutsTab?: boolean;
  postsEmptyDescription?: string;
  crewsEmptyTitle?: string;
  crewsEmptyDescription?: string;
  desktopStickyTopOffset?: number;
  mobileStickyTopOffset?: number;
}

interface ProfileTabsInteractionOptions {
  activeTab: string;
  onTabChange: (tab: string) => void;
  showWorkoutsTab: boolean;
  desktopStickyTopOffset: number;
  mobileStickyTopOffset: number;
}

export function useProfileTabsInteraction({
  activeTab,
  onTabChange,
  showWorkoutsTab,
  desktopStickyTopOffset,
  mobileStickyTopOffset,
}: ProfileTabsInteractionOptions) {
  const stickyTabsRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const lastScrollYRef = useRef(0);
  const stickyStartYRef = useRef(0);
  const touchStateRef = useRef<{
    startX: number;
    startY: number;
    isHorizontalSwipe: boolean;
    pointerId: number;
  } | null>(null);
  const [isStickyTabsVisible, setIsStickyTabsVisible] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);
  const visibleTabs = useMemo(
    () => (showWorkoutsTab ? ["posts", "workouts", "crews"] : ["posts", "crews"]),
    [showWorkoutsTab],
  );
  const visibleTabCount = visibleTabs.length;
  const resolvedActiveTab = visibleTabs.includes(activeTab) ? activeTab : "posts";
  const activeTabIndex = Math.max(visibleTabs.indexOf(resolvedActiveTab), 0);

  const getStickyTopOffset = () =>
    window.matchMedia("(min-width: 768px)").matches
      ? desktopStickyTopOffset
      : mobileStickyTopOffset;

  const updateStickyStartY = useEffectEvent(() => {
    const stickyTabs = stickyTabsRef.current;
    if (!stickyTabs || typeof window === "undefined") {
      return;
    }

    stickyStartYRef.current = stickyTabs.getBoundingClientRect().top + window.scrollY;
  });

  const updateStickyVisibility = useEffectEvent(() => {
    if (typeof window === "undefined") {
      return;
    }

    const currentScrollY = window.scrollY;
    const deltaY = currentScrollY - lastScrollYRef.current;
    const stickyTopOffset = getStickyTopOffset();
    const hasReachedStickyPosition =
      currentScrollY + stickyTopOffset >= stickyStartYRef.current - 1;

    if (!hasReachedStickyPosition || currentScrollY <= 24) {
      setIsStickyTabsVisible(true);
      lastScrollYRef.current = currentScrollY;
      return;
    }

    if (Math.abs(deltaY) < 8) {
      return;
    }

    setIsStickyTabsVisible(deltaY < 0);
    lastScrollYRef.current = currentScrollY;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    updateStickyStartY();
    lastScrollYRef.current = window.scrollY;
    updateStickyVisibility();
  }, [desktopStickyTopOffset, mobileStickyTopOffset]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      updateStickyStartY();
      updateStickyVisibility();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [desktopStickyTopOffset, mobileStickyTopOffset]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleScroll = () => {
      updateStickyVisibility();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [desktopStickyTopOffset, mobileStickyTopOffset]);

  useEffect(() => {
    if (resolvedActiveTab !== activeTab) {
      onTabChange(resolvedActiveTab);
    }
  }, [activeTab, onTabChange, resolvedActiveTab]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") {
      return;
    }

    touchStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      isHorizontalSwipe: false,
      pointerId: event.pointerId,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragOffset(0);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const touchState = touchStateRef.current;

    if (!touchState || event.pointerType !== "touch" || event.pointerId !== touchState.pointerId) {
      return;
    }

    const deltaX = event.clientX - touchState.startX;
    const deltaY = event.clientY - touchState.startY;

    if (!touchState.isHorizontalSwipe) {
      if (Math.abs(deltaX) < 8 || Math.abs(deltaX) <= Math.abs(deltaY)) {
        return;
      }

      touchState.isHorizontalSwipe = true;
    }

    const isSwipingPastFirstTab = activeTabIndex === 0 && deltaX > 0;
    const isSwipingPastLastTab = activeTabIndex === visibleTabCount - 1 && deltaX < 0;
    const constrainedDeltaX =
      isSwipingPastFirstTab || isSwipingPastLastTab ? deltaX * 0.35 : deltaX;

    setDragOffset(constrainedDeltaX);
  };

  const finishSwipe = (currentOffset: number) => {
    const touchState = touchStateRef.current;
    const viewportWidth = viewportRef.current?.offsetWidth ?? 0;
    const swipeThreshold = Math.max(viewportWidth * 0.18, 48);

    if (touchState?.isHorizontalSwipe && Math.abs(currentOffset) > swipeThreshold) {
      if (currentOffset < 0 && activeTabIndex < visibleTabCount - 1) {
        onTabChange(visibleTabs[activeTabIndex + 1] ?? resolvedActiveTab);
      }

      if (currentOffset > 0 && activeTabIndex > 0) {
        onTabChange(visibleTabs[activeTabIndex - 1] ?? resolvedActiveTab);
      }
    }

    touchStateRef.current = null;
    setDragOffset(0);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const touchState = touchStateRef.current;
    if (!touchState || event.pointerType !== "touch" || event.pointerId !== touchState.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    finishSwipe(dragOffset);
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    touchStateRef.current = null;
    setDragOffset(0);
  };

  return {
    activeTabIndex,
    dragOffset,
    handlePointerCancel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isStickyTabsVisible,
    resolvedActiveTab,
    stickyTabsRef,
    viewportRef,
    visibleTabCount,
  };
}

export function ProfileTabs({
  posts,
  workouts,
  crews,
  crewPosts,
  isLoading,
  error,
  onRetry,
  activeTab,
  onTabChange,
  showWorkoutsTab = true,
  postsEmptyDescription = "게시글이 없습니다.",
  crewsEmptyTitle = "크루가 없습니다",
  crewsEmptyDescription = "참여 중인 크루가 없습니다.",
  desktopStickyTopOffset = 0,
  mobileStickyTopOffset = 0,
}: ProfileTabsProps) {
  const {
    activeTabIndex,
    dragOffset,
    handlePointerCancel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isStickyTabsVisible,
    resolvedActiveTab,
    stickyTabsRef,
    viewportRef,
    visibleTabCount,
  } = useProfileTabsInteraction({
    activeTab,
    onTabChange,
    showWorkoutsTab,
    desktopStickyTopOffset,
    mobileStickyTopOffset,
  });

  return (
    <Tabs value={resolvedActiveTab} onValueChange={onTabChange} className="w-full">
      <ProfileTabBar
        showWorkoutsTab={showWorkoutsTab}
        visibleTabCount={visibleTabCount}
        isStickyTabsVisible={isStickyTabsVisible}
        stickyTabsRef={stickyTabsRef}
        desktopStickyTopOffset={desktopStickyTopOffset}
        mobileStickyTopOffset={mobileStickyTopOffset}
      />

      <div
        ref={viewportRef}
        className="overflow-hidden touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div
          className={`flex will-change-transform motion-reduce:transition-none ${
            dragOffset === 0
              ? "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              : "transition-none"
          }`}
          style={{
            width: `${visibleTabCount * 100}%`,
            transform: `translate3d(calc(-${activeTabIndex * (100 / visibleTabCount)}% + ${dragOffset}px), 0, 0)`,
          }}
        >
          <ProfilePostsPane
            posts={posts}
            isLoading={isLoading}
            error={resolvedActiveTab === "posts" ? error : null}
            onRetry={onRetry}
            postsEmptyDescription={postsEmptyDescription}
            visibleTabCount={visibleTabCount}
          />

          {showWorkoutsTab ? (
            <ProfileWorkoutsPane
              workouts={workouts}
              isLoading={isLoading}
              error={resolvedActiveTab === "workouts" ? error : null}
              onRetry={onRetry}
              visibleTabCount={visibleTabCount}
            />
          ) : null}

          <ProfileCrewsPane
            crews={crews}
            crewPosts={crewPosts}
            isLoading={isLoading}
            error={resolvedActiveTab === "crews" ? error : null}
            onRetry={onRetry}
            crewsEmptyTitle={crewsEmptyTitle}
            crewsEmptyDescription={crewsEmptyDescription}
            visibleTabCount={visibleTabCount}
          />
        </div>
      </div>
    </Tabs>
  );
}

interface ProfileTabBarProps {
  showWorkoutsTab: boolean;
  visibleTabCount: number;
  isStickyTabsVisible: boolean;
  stickyTabsRef: RefObject<HTMLDivElement | null>;
  desktopStickyTopOffset: number;
  mobileStickyTopOffset: number;
}

export function ProfileTabBar({
  showWorkoutsTab,
  visibleTabCount,
  isStickyTabsVisible,
  stickyTabsRef,
  desktopStickyTopOffset,
  mobileStickyTopOffset,
}: ProfileTabBarProps) {
  return (
    <div
      ref={stickyTabsRef}
      className={`sticky top-[var(--profile-tabs-mobile-top)] z-30 border-b border-border/60 bg-background/95 backdrop-blur-lg transition-transform duration-300 ease-out md:top-[var(--profile-tabs-desktop-top)] ${
        isStickyTabsVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{
        ["--profile-tabs-mobile-top" as string]: `${mobileStickyTopOffset}px`,
        ["--profile-tabs-desktop-top" as string]: `${desktopStickyTopOffset}px`,
      }}
    >
      <TabsList
        variant="line"
        className="w-full justify-around border-b-0 px-4 sm:px-6"
        style={{ gridTemplateColumns: `repeat(${visibleTabCount}, minmax(0, 1fr))` }}
      >
        <TabsTrigger value="posts" className="flex-1 gap-2 py-3">
          <Grid3x3 className="size-4" />
          <span>게시글</span>
        </TabsTrigger>
        {showWorkoutsTab ? (
          <TabsTrigger value="workouts" className="flex-1 gap-2 py-3">
            <Activity className="size-4" />
            <span>워크아웃</span>
          </TabsTrigger>
        ) : null}
        <TabsTrigger value="crews" className="flex-1 gap-2 py-3">
          <Users className="size-4" />
          <span>크루</span>
        </TabsTrigger>
      </TabsList>
    </div>
  );
}

interface ProfilePostsPaneProps {
  posts: Post[];
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  postsEmptyDescription: string;
  visibleTabCount: number;
}

export function ProfilePostsPane({
  posts,
  isLoading,
  error,
  onRetry,
  postsEmptyDescription,
  visibleTabCount,
}: ProfilePostsPaneProps) {
  return (
    <ProfileTabPanel visibleTabCount={visibleTabCount}>
      {error ? (
        <ProfileStatePanel>
          <ProfileTabErrorState message={error} onRetry={onRetry} />
        </ProfileStatePanel>
      ) : isLoading ? (
        <ProfileStatePanel>
          <ProfileFeedStack>
            {Array.from({ length: 3 }, (_, index) => (
              <PostPreviewSkeleton key={`posts-skeleton-${index}`} />
            ))}
          </ProfileFeedStack>
        </ProfileStatePanel>
      ) : posts.length === 0 ? (
        <ProfileStatePanel>
          <ProfileEmptyState
            icon={Grid3x3}
            title="게시글이 없습니다"
            description={postsEmptyDescription}
          />
        </ProfileStatePanel>
      ) : (
        <ProfileFeedStack>
          {posts.map((post) => (
            <PostFeedCard key={post.id} post={normalizePost(post)} />
          ))}
        </ProfileFeedStack>
      )}
    </ProfileTabPanel>
  );
}

interface ProfileWorkoutsPaneProps {
  workouts: Workout[];
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  visibleTabCount: number;
}

export function ProfileWorkoutsPane({
  workouts,
  isLoading,
  error,
  onRetry,
  visibleTabCount,
}: ProfileWorkoutsPaneProps) {
  return (
    <ProfileTabPanel visibleTabCount={visibleTabCount}>
      {error ? (
        <ProfileStatePanel>
          <ProfileTabErrorState message={error} onRetry={onRetry} />
        </ProfileStatePanel>
      ) : isLoading ? (
        <ProfileStatePanel>
          <ProfileFeedStack>
            {Array.from({ length: 2 }, (_, index) => (
              <WorkoutPreviewSkeleton key={`workouts-skeleton-${index}`} />
            ))}
          </ProfileFeedStack>
        </ProfileStatePanel>
      ) : workouts.length === 0 ? (
        <ProfileStatePanel>
          <ProfileEmptyState
            icon={Activity}
            title="워크아웃이 없습니다"
            description="아직 기록한 러닝 활동이 없습니다."
          />
        </ProfileStatePanel>
      ) : (
        <ProfileFeedStack>
          {workouts.map((workout) => (
            <FeedCard key={workout.id} workout={normalizeWorkout(workout)} />
          ))}
        </ProfileFeedStack>
      )}
    </ProfileTabPanel>
  );
}

interface ProfileCrewsPaneProps {
  crews: Crew[];
  crewPosts: CrewPost[];
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  crewsEmptyTitle: string;
  crewsEmptyDescription: string;
  visibleTabCount: number;
}

export function ProfileCrewsPane({
  crews,
  crewPosts,
  isLoading,
  error,
  onRetry,
  crewsEmptyTitle,
  crewsEmptyDescription,
  visibleTabCount,
}: ProfileCrewsPaneProps) {
  return (
    <ProfileTabPanel visibleTabCount={visibleTabCount}>
      {error ? (
        <ProfileStatePanel>
          <ProfileTabErrorState message={error} onRetry={onRetry} />
        </ProfileStatePanel>
      ) : isLoading ? (
        <ProfileStatePanel>
          <ProfileFeedStack>
            {Array.from({ length: 2 }, (_, index) => (
              <CrewPostPreviewSkeleton key={`crews-skeleton-${index}`} />
            ))}
          </ProfileFeedStack>
        </ProfileStatePanel>
      ) : crewPosts.length === 0 ? (
        <ProfileStatePanel>
          <ProfileEmptyState
            icon={Users}
            title={crews.length === 0 ? crewsEmptyTitle : "크루 게시글이 없습니다"}
            description={
              crews.length === 0
                ? crewsEmptyDescription
                : "참여 중인 크루의 최근 소식이 아직 없습니다."
            }
          />
        </ProfileStatePanel>
      ) : (
        <ProfileFeedStack>
          {crewPosts.map((post) => (
            <ProfileCrewPostCard key={post.id} post={post} />
          ))}
        </ProfileFeedStack>
      )}
    </ProfileTabPanel>
  );
}

function normalizePost(post: Post) {
  return {
    ...post,
    visibility: post.visibility ?? "PUBLIC",
    hashtags: post.hashtags ?? [],
    _count: {
      likes: post._count?.likes ?? post.likesCount ?? 0,
      comments: post._count?.comments ?? post.commentsCount ?? 0,
    },
    images: (post.images ?? [])
      .map((image) => ({
        id: image.id,
        url: image.url ?? image.imageUrl ?? "",
        order: image.order ?? image.sortOrder ?? 0,
      }))
      .filter((image) => image.url.length > 0),
    workouts: post.workouts ?? [],
  };
}

function normalizeWorkout(workout: Workout) {
  return {
    ...workout,
    visibility: workout.visibility ?? "PUBLIC",
    createdAt: workout.createdAt ?? workout.date,
    user: workout.user ?? {
      id: "profile-workout",
      name: "러너",
      profileImage: null,
    },
    _count: {
      likes: workout._count?.likes ?? 0,
      comments: workout._count?.comments ?? 0,
    },
  };
}

function ProfileCrewPostCard({ post }: { post: CrewPost }) {
  return (
    <article className="border-b bg-card">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <UserAvatar
          user={post.user}
          showName
          subtitle={
            <span className="flex items-center gap-1">
              <span>@{post.crew.name}</span>
              <span>·</span>
              <TimeAgo date={post.createdAt} />
            </span>
          }
        />
        <Link
          to={`/crews/${post.crew.id}`}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          크루 보기
        </Link>
      </div>

      <div className="px-4 pb-3">
        <Link to={`/crews/${post.crew.id}`} className="block">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {post.content}
          </p>
        </Link>
      </div>

      {post.images.length > 0 ? <PostImageGallery images={post.images} className="mt-1" /> : null}

      <div className="flex items-center gap-1 px-2 py-2">
        <LikeButton entityType="post" entityId={post.id} initialCount={post._count.likes} />
        <Link
          to={`/crews/${post.crew.id}`}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent"
        >
          <MessageCircle className="size-5" />
          {post._count.comments > 0 ? (
            <span className="text-sm font-medium tabular-nums">{post._count.comments}</span>
          ) : null}
        </Link>
        <Link
          to={`/crews/${post.crew.id}`}
          className="ml-auto rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          크루로 이동
        </Link>
      </div>
    </article>
  );
}

function ProfileFeedStack({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

function ProfileEmptyState({
  icon,
  title,
  description,
}: {
  icon: typeof Grid3x3;
  title: string;
  description: string;
}) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      className="rounded-3xl border border-dashed border-border/70 bg-muted/20"
    />
  );
}

function ProfileTabErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
    >
      <div className="flex min-w-0 items-center gap-2">
        <AlertCircle className="size-4 shrink-0" />
        <p>{message}</p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-md border border-destructive/30 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          다시 시도
        </button>
      ) : null}
    </div>
  );
}

function ProfileStatePanel({ children }: { children: ReactNode }) {
  return <div className="px-4 py-6 sm:px-6">{children}</div>;
}

function ProfileTabPanel({
  children,
  visibleTabCount,
}: {
  children: ReactNode;
  visibleTabCount: number;
}) {
  return (
    <div className="shrink-0" style={{ width: `${100 / visibleTabCount}%` }}>
      {children}
    </div>
  );
}

function PostPreviewSkeleton() {
  return (
    <article className="border-b bg-card px-4 py-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="mt-4 h-20 w-full rounded-xl" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[84%]" />
      </div>
      <div className="mt-4 flex gap-3">
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>
    </article>
  );
}

function WorkoutPreviewSkeleton() {
  return (
    <article className="border-b bg-card px-4 py-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="mt-4 h-24 w-full rounded-xl" />
      <div className="mt-4 flex gap-3">
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>
    </article>
  );
}

function CrewPostPreviewSkeleton() {
  return (
    <article className="border-b bg-card px-4 py-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[78%]" />
      </div>
      <Skeleton className="mt-4 h-28 w-full rounded-xl" />
    </article>
  );
}
