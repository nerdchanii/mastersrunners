import { useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Bell, BellOff, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/UserAvatar";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  type Notification,
} from "@/hooks/useNotifications";

function getNotificationLink(notification: Notification): string | null {
  if (!notification.referenceId || !notification.referenceType) return null;

  switch (notification.referenceType) {
    case "POST":
      return `/posts/${notification.referenceId}`;
    case "WORKOUT":
      return `/workouts/${notification.referenceId}`;
    case "CREW":
      return `/crews/${notification.referenceId}`;
    case "CONVERSATION":
      return `/messages/${notification.referenceId}`;
    default:
      return null;
  }
}

function getNotificationIcon(type: Notification["type"]): string {
  switch (type) {
    case "POST_LIKE":
    case "WORKOUT_LIKE":
      return "❤️";
    case "POST_COMMENT":
    case "WORKOUT_COMMENT":
    case "COMMENT_REPLY":
      return "💬";
    case "FOLLOW_REQUEST":
    case "FOLLOW_ACCEPTED":
      return "👤";
    case "CREW_JOIN":
    case "CREW_INVITE":
      return "🏃";
    case "DM_RECEIVED":
      return "✉️";
    case "MENTION":
      return "@";
    default:
      return "🔔";
  }
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

function NotificationItem({ notification }: { notification: Notification }) {
  const markRead = useMarkNotificationRead();
  const link = getNotificationLink(notification);

  const handleClick = () => {
    if (!notification.isRead) {
      markRead.mutate(notification.id);
    }
  };

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
        !notification.isRead && "bg-primary/5"
      )}
    >
      {/* Actor Avatar or type icon */}
      <div className="relative shrink-0">
        {notification.actor ? (
          <UserAvatar user={notification.actor} className="size-10" />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-base">
            {getNotificationIcon(notification.type)}
          </div>
        )}
        {/* Type indicator overlay */}
        <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-background text-[10px] shadow-sm">
          {getNotificationIcon(notification.type)}
        </span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm",
            !notification.isRead ? "font-medium text-foreground" : "text-muted-foreground"
          )}
        >
          {notification.message}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
      )}
    </div>
  );

  if (link) {
    return (
      <Link to={link} onClick={handleClick} className="block">
        {content}
      </Link>
    );
  }

  return (
    <button onClick={handleClick} className="w-full text-left">
      {content}
    </button>
  );
}

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="size-10 animate-pulse rounded-full bg-muted" />
      <div className="flex-1 space-y-1.5">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const notifications = data?.pages.flatMap((p) => p?.items ?? []) ?? [];
  const hasUnread = notifications.some((n: Notification) => !n.isRead);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className="mx-auto max-w-lg">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between px-4">
        <div>
          <h1 className="text-xl font-bold">알림</h1>
          <p className="text-sm text-muted-foreground">최신 활동을 확인하세요.</p>
        </div>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="size-3.5" />
            모두 읽음
          </Button>
        )}
      </div>

      {/* List */}
      <div className="divide-y rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <NotificationSkeleton key={i} />
            ))}
          </>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
              <BellOff className="size-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">알림이 없습니다</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              새로운 알림이 도착하면 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <>
            {notifications.map((notification: Notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}

            {/* Load more trigger */}
            <div ref={loadMoreRef} className="py-2 text-center">
              {isFetchingNextPage ? (
                <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  불러오는 중...
                </div>
              ) : hasNextPage ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => fetchNextPage()}
                >
                  더 보기
                </Button>
              ) : notifications.length > 0 ? (
                <p className="py-3 text-xs text-muted-foreground">
                  <Check className="inline-block size-3 mr-1" />
                  모든 알림을 확인했습니다.
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
