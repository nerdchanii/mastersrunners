import { useQueryClient } from "@tanstack/react-query";
import { Bell, Bug, MessageCircle, Monitor, Moon, Search, Sun } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { messageKeys } from "@/hooks/useMessages";
import { notificationKeys } from "@/hooks/useNotifications";
import { useUnreadCounts } from "@/hooks/useUnreadCounts";
import { API_BASE } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import {
  defaultPublicRuntimeConfig,
  type PublicFeatureName,
  usePublicRuntimeConfig,
} from "@/lib/public-config";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/feed", label: "피드" },
  { href: "/crews", label: "크루" },
  { href: "/events", label: "대회", feature: "events" as PublicFeatureName },
  { href: "/challenges", label: "챌린지", feature: "challenges" as PublicFeatureName },
  { href: "/workouts", label: "내 기록", authRequired: true },
];

export default function Header() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { pathname } = useLocation();
  const { data: runtimeConfig } = usePublicRuntimeConfig();
  const queryClient = useQueryClient();
  const { messages: unreadMessageCount, notifications: unreadNotifCount } = useUnreadCounts();
  const config = runtimeConfig ?? defaultPublicRuntimeConfig;

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");
  const visibleNavLinks = navLinks.filter(
    (link) =>
      (!link.feature || config.features[link.feature]) && (!link.authRequired || isAuthenticated),
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    // DM SSE — 새 메시지 수신 시 unread 갱신
    const dmEventSource = new EventSource(`${API_BASE}/conversations/sse`, {
      withCredentials: true,
    });
    dmEventSource.addEventListener("new-message", () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
    });
    dmEventSource.onerror = (error) => {
      console.error("DM SSE error:", error);
    };

    // Notification SSE — 새 알림 수신 시 TanStack Query 캐시 무효화
    let notifEventSource: EventSource | null = null;
    try {
      notifEventSource = new EventSource(`${API_BASE}/notifications/sse`, {
        withCredentials: true,
      });
      notifEventSource.addEventListener("notification", () => {
        queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      });
      notifEventSource.onerror = (error) => {
        console.error("Notification SSE error:", error);
      };
    } catch {
      // notifications SSE not available yet — skip
    }

    return () => {
      dmEventSource.close();
      notifEventSource?.close();
    };
  }, [isAuthenticated, queryClient]);

  return (
    <header className="sticky top-0 z-50 hidden w-full border-b bg-background/95 backdrop-blur-lg md:block">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
        <Link to="/feed" className="shrink-0 text-lg font-bold tracking-tight text-foreground">
          마스터즈 러너스
        </Link>

        <nav className="flex min-w-0 flex-1 items-center gap-1">
          {visibleNavLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-1.5">
          <Link
            to="/search"
            data-testid="desktop-search-link"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive("/search")
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Search className="size-4" strokeWidth={2.25} />
            <span className="hidden lg:inline">러너 검색</span>
          </Link>

          {isLoading ? (
            <div className="h-8 w-16 animate-pulse rounded-lg bg-muted" />
          ) : isAuthenticated ? (
            <>
              <Link
                to="/feedback"
                state={{ sourcePath: pathname }}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  isActive("/feedback") && "text-foreground",
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Bug className="size-3.5" />
                  피드백
                </span>
              </Link>

              {/* DM 아이콘 + 뱃지 */}
              <Link
                to="/messages"
                className={cn(
                  "relative rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground",
                  isActive("/messages") && "text-foreground",
                )}
              >
                <MessageCircle className="size-5" />
                {unreadMessageCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 p-0 text-[10px] text-white">
                    {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                  </Badge>
                )}
              </Link>

              {/* 알림 아이콘 + 뱃지 */}
              <Link
                to="/notifications"
                className={cn(
                  "relative rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground",
                  isActive("/notifications") && "text-foreground",
                )}
              >
                <Bell className="size-5" />
                {unreadNotifCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 p-0 text-[10px] text-white">
                    {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                  </Badge>
                )}
              </Link>

              <button
                type="button"
                onClick={() => {
                  const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
                  setTheme(next);
                }}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="테마 전환"
                title={
                  theme === "light" ? "라이트 모드" : theme === "dark" ? "다크 모드" : "시스템"
                }
              >
                {theme === "dark" ? (
                  <Moon className="size-4" />
                ) : theme === "light" ? (
                  <Sun className="size-4" />
                ) : (
                  <Monitor className="size-4" />
                )}
              </button>

              <button
                onClick={logout}
                className="ml-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
                  setTheme(next);
                }}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="테마 전환"
                title={
                  theme === "light" ? "라이트 모드" : theme === "dark" ? "다크 모드" : "시스템"
                }
              >
                {theme === "dark" ? (
                  <Moon className="size-4" />
                ) : theme === "light" ? (
                  <Sun className="size-4" />
                ) : (
                  <Monitor className="size-4" />
                )}
              </button>

              <Link
                to="/login"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                로그인
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
