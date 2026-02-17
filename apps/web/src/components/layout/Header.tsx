import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { api, API_BASE } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Bell, Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { notificationKeys } from "@/hooks/useNotifications";

interface ConversationsResponse {
  data: Array<{ unreadCount: number }>;
}

interface UnreadCountResponse {
  count: number;
}

const navLinks = [
  { href: "/feed", label: "피드" },
  { href: "/crews", label: "크루" },
  { href: "/events", label: "대회" },
  { href: "/challenges", label: "챌린지" },
  { href: "/workouts", label: "내 기록" },
];

export default function Header() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const fetchUnreadMessageCount = useCallback(async () => {
    try {
      const data = await api.fetch<ConversationsResponse>("/conversations?limit=100");
      const total = data?.data?.reduce((sum, conv) => sum + conv.unreadCount, 0) ?? 0;
      setUnreadMessageCount(total);
    } catch {
      // ignore
    }
  }, []);

  const fetchUnreadNotifCount = useCallback(async () => {
    try {
      const data = await api.fetch<UnreadCountResponse>("/notifications/unread-count");
      setUnreadNotifCount(data?.count ?? 0);
    } catch {
      setUnreadNotifCount(0);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchUnreadMessageCount();
    fetchUnreadNotifCount();

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    // DM SSE — 새 메시지 수신 시 unread 갱신
    const dmEventSource = new EventSource(
      `${API_BASE}/conversations/sse?token=${encodeURIComponent(token)}`
    );
    dmEventSource.addEventListener("new-message", () => {
      fetchUnreadMessageCount();
    });
    dmEventSource.onerror = () => dmEventSource.close();

    // Notification SSE — 새 알림 수신 시 TanStack Query 캐시 무효화
    let notifEventSource: EventSource | null = null;
    try {
      notifEventSource = new EventSource(
        `${API_BASE}/notifications/sse?token=${encodeURIComponent(token)}`
      );
      notifEventSource.addEventListener("notification", () => {
        fetchUnreadNotifCount();
        queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      });
      notifEventSource.onerror = () => notifEventSource?.close();
    } catch {
      // notifications SSE not available yet — skip
    }

    return () => {
      dmEventSource.close();
      notifEventSource?.close();
    };
  }, [isAuthenticated, fetchUnreadMessageCount, fetchUnreadNotifCount, queryClient]);

  // Decrement notification badge when visiting /notifications
  useEffect(() => {
    if (pathname === "/notifications") {
      setUnreadNotifCount(0);
    }
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 hidden w-full border-b bg-background/95 backdrop-blur-lg md:block">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          to="/"
          className="text-lg font-bold tracking-tight text-foreground"
        >
          마스터즈 러너스
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* 테마 토글 */}
          <button
            type="button"
            onClick={() => {
              const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
              setTheme(next);
            }}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="테마 전환"
            title={theme === "light" ? "라이트 모드" : theme === "dark" ? "다크 모드" : "시스템"}
          >
            {theme === "dark" ? (
              <Moon className="size-4" />
            ) : theme === "light" ? (
              <Sun className="size-4" />
            ) : (
              <Monitor className="size-4" />
            )}
          </button>

          {isLoading ? (
            <div className="h-8 w-16 animate-pulse rounded-lg bg-muted" />
          ) : isAuthenticated ? (
            <>
              {/* DM 아이콘 + 뱃지 */}
              <Link
                to="/messages"
                className={cn(
                  "relative rounded-lg p-2 transition-colors hover:bg-accent",
                  isActive("/messages") && "bg-accent"
                )}
              >
                <MessageCircle className="size-5 text-foreground" />
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
                  "relative rounded-lg p-2 transition-colors hover:bg-accent",
                  isActive("/notifications") && "bg-accent"
                )}
              >
                <Bell className="size-5 text-foreground" />
                {unreadNotifCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 p-0 text-[10px] text-white">
                    {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                  </Badge>
                )}
              </Link>

              <button
                onClick={logout}
                className="ml-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
