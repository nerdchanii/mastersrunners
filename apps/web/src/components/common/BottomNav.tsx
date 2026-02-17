import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Home, Users, Trophy, User, MessageCircle, Bell, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface UnreadCounts {
  messages: number;
  notifications: number;
}

const baseNavItems = [
  { href: "/feed", label: "홈", icon: Home, auth: false, badge: null as keyof UnreadCounts | null },
  { href: "/crews", label: "크루", icon: Users, auth: false, badge: null as keyof UnreadCounts | null },
  { href: "/challenges", label: "챌린지", icon: Trophy, auth: false, badge: null as keyof UnreadCounts | null },
  { href: "/messages", label: "메시지", icon: MessageCircle, auth: true, badge: "messages" as keyof UnreadCounts | null },
  { href: "/notifications", label: "알림", icon: Bell, auth: true, badge: "notifications" as keyof UnreadCounts | null },
  { href: "/profile", label: "프로필", icon: User, auth: true, badge: null as keyof UnreadCounts | null },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const [unread, setUnread] = useState<UnreadCounts>({ messages: 0, notifications: 0 });

  const fetchUnread = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [msgData, notifData] = await Promise.allSettled([
        api.fetch<{ data: Array<{ unreadCount: number }> }>("/conversations?limit=100"),
        api.fetch<{ count: number }>("/notifications/unread-count"),
      ]);
      const messages =
        msgData.status === "fulfilled"
          ? (msgData.value?.data?.reduce((s, c) => s + c.unreadCount, 0) ?? 0)
          : 0;
      const notifications =
        notifData.status === "fulfilled" ? (notifData.value?.count ?? 0) : 0;
      setUnread({ messages, notifications });
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 60_000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  // Clear notification badge when visiting /notifications
  useEffect(() => {
    if (pathname === "/notifications") {
      setUnread((prev) => ({ ...prev, notifications: 0 }));
    }
    if (pathname === "/messages" || pathname.startsWith("/messages/")) {
      setUnread((prev) => ({ ...prev, messages: 0 }));
    }
  }, [pathname]);

  const visibleItems = baseNavItems.filter((item) => !item.auth || isAuthenticated);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-lg md:hidden">
        <div className="flex items-center justify-around h-14 px-2 pb-[env(safe-area-inset-bottom)]">
          {visibleItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            const badgeCount = item.badge ? unread[item.badge] : 0;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon
                  className="size-5"
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                {badgeCount > 0 && (
                  <span className="absolute top-0 right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* FAB - 포스트 작성 버튼 (모바일 하단 우측) */}
      {isAuthenticated && (
        <Link
          to="/posts/new"
          className={cn(
            "fixed bottom-20 right-4 z-50 flex items-center justify-center",
            "size-14 rounded-full bg-primary text-primary-foreground shadow-lg",
            "transition-transform hover:scale-105 active:scale-95",
            "md:hidden"
          )}
          aria-label="포스트 작성"
        >
          <Plus className="size-6" strokeWidth={2.5} />
        </Link>
      )}
    </>
  );
}
