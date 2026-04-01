import { Bell, Bug, Home, MessageCircle, Plus, Trophy, User, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { useUnreadCounts } from "@/hooks/useUnreadCounts";
import { useAuth } from "@/lib/auth-context";
import {
  defaultPublicRuntimeConfig,
  type PublicFeatureName,
  usePublicRuntimeConfig,
} from "@/lib/public-config";
import { cn } from "@/lib/utils";

type NavItem = {
  auth: boolean;
  badge: "messages" | "notifications" | null;
  feature?: PublicFeatureName;
  href: string;
  icon: typeof Home;
  label: string;
};

const baseNavItems: NavItem[] = [
  {
    href: "/feed",
    label: "홈",
    icon: Home,
    auth: false,
    badge: null as "messages" | "notifications" | null,
  },
  {
    href: "/crews",
    label: "크루",
    icon: Users,
    auth: false,
    badge: null as "messages" | "notifications" | null,
  },
  {
    href: "/challenges",
    label: "챌린지",
    icon: Trophy,
    auth: false,
    badge: null as "messages" | "notifications" | null,
    feature: "challenges" as PublicFeatureName,
  },
  {
    href: "/messages",
    label: "메시지",
    icon: MessageCircle,
    auth: true,
    badge: "messages" as const,
  },
  {
    href: "/notifications",
    label: "알림",
    icon: Bell,
    auth: true,
    badge: "notifications" as const,
  },
  {
    href: "/profile",
    label: "프로필",
    icon: User,
    auth: true,
    badge: null as "messages" | "notifications" | null,
  },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: runtimeConfig } = usePublicRuntimeConfig();
  const unread = useUnreadCounts();
  const config = runtimeConfig ?? defaultPublicRuntimeConfig;

  const visibleItems = baseNavItems.filter(
    (item) => (!item.auth || isAuthenticated) && (!item.feature || config.features[item.feature]),
  );

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-lg md:hidden">
        <div className="flex items-center justify-around h-14 px-2 pb-[env(safe-area-inset-bottom)]">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            const badgeCount = item.badge ? unread[item.badge] : 0;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" strokeWidth={isActive ? 2.5 : 1.5} />
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
          to="/feedback"
          state={{ sourcePath: pathname }}
          className={cn(
            "fixed bottom-20 left-4 z-50 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/95 px-3 py-2 text-xs font-medium text-foreground shadow-sm backdrop-blur-lg",
            "transition-colors hover:bg-accent md:hidden",
          )}
          aria-label="피드백 보내기"
        >
          <Bug className="size-3.5" />
          피드백
        </Link>
      )}

      {/* FAB - 포스트 작성 버튼 (모바일 하단 우측) */}
      {isAuthenticated && (
        <Link
          to="/posts/new"
          className={cn(
            "fixed bottom-20 right-4 z-50 flex items-center justify-center",
            "size-14 rounded-full bg-primary text-primary-foreground shadow-lg",
            "transition-transform hover:scale-105 active:scale-95",
            "md:hidden",
          )}
          aria-label="포스트 작성"
        >
          <Plus className="size-6" strokeWidth={2.5} />
        </Link>
      )}
    </>
  );
}
