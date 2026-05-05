import {
  ChevronLeft,
  ChevronRight,
  Flag,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Trash2,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { StatItem } from "@/components/common/StatItem";
import { TimeAgo } from "@/components/common/TimeAgo";
import { UserAvatar } from "@/components/common/UserAvatar";
import { PostImageGallery } from "@/components/post/PostImageGallery";
import { LikeButton } from "@/components/social/LikeButton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";
import { shareLink } from "@/lib/share-link";
import { cn } from "@/lib/utils";

interface PostFeedCardProps {
  post: {
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
      };
    }>;
  };
  onDelete?: (postId: string) => void;
}

export default function PostFeedCard({ post, onDelete }: PostFeedCardProps) {
  const { user: currentUser } = useAuth();
  const workoutCarouselId = useId();
  const workoutScrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeWorkoutIndex, setActiveWorkoutIndex] = useState(0);

  const isOwner = currentUser?.id === post.user.id;
  const workouts = post.workouts ?? [];
  const actionButtonClassName = cn(
    buttonVariants({ variant: "ghost", size: "sm" }),
    "h-9 rounded-full px-3 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60",
  );
  const subtleActionButtonClassName = cn(
    actionButtonClassName,
    "ml-auto opacity-80 hover:opacity-100",
  );
  const canShowWorkoutCarousel = workouts.length > 1;

  useEffect(() => {
    setActiveWorkoutIndex(0);
  }, [post.id, workouts.length]);

  const scrollToWorkout = (index: number) => {
    const scroller = workoutScrollerRef.current;
    const nextIndex = Math.max(0, Math.min(index, workouts.length - 1));
    const target = scroller?.children.item(nextIndex);

    if (!(target instanceof HTMLElement)) {
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
    setActiveWorkoutIndex(nextIndex);
  };

  const handleWorkoutScroll = () => {
    const scroller = workoutScrollerRef.current;

    if (!scroller) {
      return;
    }

    const children = Array.from(scroller.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    );

    if (children.length === 0) {
      return;
    }

    const scrollerCenter = scroller.scrollLeft + scroller.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    children.forEach((child, index) => {
      const childCenter = child.offsetLeft + child.clientWidth / 2;
      const distance = Math.abs(childCenter - scrollerCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveWorkoutIndex(closestIndex);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${post.id}`;
    try {
      const result = await shareLink({
        title: `${post.user.name}님의 게시글`,
        text: post.content.slice(0, 120),
        url,
      });

      if (result === "copied") {
        toast.success("링크가 클립보드에 복사되었습니다.");
      }
    } catch {
      toast.error("공유에 실패했습니다.");
    }
  };

  const handleReport = () => {
    toast.info("신고가 접수되었습니다.");
  };

  const images = post.images ?? [];

  return (
    <article className="border-b bg-card">
      {/* User Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <UserAvatar user={post.user} showName subtitle={<TimeAgo date={post.createdAt} />} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full p-1.5 text-muted-foreground hover:bg-accent">
              <MoreHorizontal className="size-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwner && onDelete && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(post.id)}
              >
                <Trash2 className="size-4 mr-2" />
                삭제
              </DropdownMenuItem>
            )}
            {!isOwner && (
              <DropdownMenuItem onClick={handleReport}>
                <Flag className="size-4 mr-2" />
                신고
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {workouts.length > 0 && (
        <div className="px-4 pb-1">
          {workouts.length === 1 ? (
            <Link
              to={`/posts/${post.id}`}
              className="block rounded-xl bg-muted/50 p-3 transition-colors hover:bg-muted/70"
            >
              <div className="grid grid-cols-3 gap-2">
                <StatItem
                  value={formatDistance(workouts[0].workout.distance)}
                  label="km"
                  size="sm"
                />
                <StatItem
                  value={formatDuration(workouts[0].workout.duration)}
                  label="시간"
                  size="sm"
                />
                <StatItem value={formatPace(workouts[0].workout.pace)} label="/km" size="sm" />
              </div>
            </Link>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <button
                  type="button"
                  className="absolute left-2 top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/82 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background/92 hover:text-foreground disabled:opacity-40 md:inline-flex"
                  onClick={() => scrollToWorkout(activeWorkoutIndex - 1)}
                  disabled={activeWorkoutIndex === 0}
                  aria-controls={workoutCarouselId}
                  aria-label="이전 운동 기록"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <div className="overflow-hidden">
                  <div
                    id={workoutCarouselId}
                    ref={workoutScrollerRef}
                    className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 overscroll-x-contain scrollbar-none"
                    onScroll={handleWorkoutScroll}
                  >
                    {workouts.map(({ workout }) => (
                      <Link
                        key={workout.id}
                        to={`/posts/${post.id}`}
                        className="w-full min-w-full shrink-0 snap-start rounded-xl bg-muted/50 p-3 transition-colors hover:bg-muted/70"
                      >
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          {new Date(workout.date).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          <StatItem value={formatDistance(workout.distance)} label="km" size="sm" />
                          <StatItem
                            value={formatDuration(workout.duration)}
                            label="시간"
                            size="sm"
                          />
                          <StatItem value={formatPace(workout.pace)} label="/km" size="sm" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/82 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background/92 hover:text-foreground disabled:opacity-40 md:inline-flex"
                  onClick={() => scrollToWorkout(activeWorkoutIndex + 1)}
                  disabled={activeWorkoutIndex === workouts.length - 1}
                  aria-controls={workoutCarouselId}
                  aria-label="다음 운동 기록"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
              {canShowWorkoutCarousel && (
                <div className="flex items-center justify-center gap-1.5 pb-1">
                  {workouts.map((workoutEntry, index) => (
                    <button
                      key={workoutEntry.workout.id}
                      type="button"
                      className={cn(
                        "size-2 rounded-full transition-colors",
                        index === activeWorkoutIndex ? "bg-foreground" : "bg-foreground/25",
                      )}
                      onClick={() => scrollToWorkout(index)}
                      aria-controls={workoutCarouselId}
                      aria-label={`${index + 1}번째 운동 기록 보기`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="px-4">
        <Link to={`/posts/${post.id}`} className="block">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        </Link>
        {(post.hashtags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {(post.hashtags ?? []).map((tag, idx) => (
              <Link key={idx} to={`/search?hashtag=${encodeURIComponent(tag)}`}>
                <Badge
                  variant="secondary"
                  className="text-xs font-normal hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                >
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      {images.length > 0 && <PostImageGallery images={images} className="mt-3" />}

      {/* Action Bar */}
      <div className="flex items-center gap-1.5 px-2 py-2">
        <LikeButton
          entityType="post"
          entityId={post.id}
          initialLiked={post.isLiked}
          initialCount={post._count?.likes ?? 0}
        />
        <Link to={`/posts/${post.id}`} className={actionButtonClassName} aria-label="댓글 보기">
          <MessageCircle className="size-4" />
          {(post._count?.comments ?? 0) > 0 && (
            <span className="text-sm tabular-nums text-muted-foreground">
              {post._count.comments}
            </span>
          )}
        </Link>
        <button
          type="button"
          className={subtleActionButtonClassName}
          onClick={handleShare}
          aria-label="공유"
        >
          <Share2 className="size-4" />
        </button>
      </div>
    </article>
  );
}
