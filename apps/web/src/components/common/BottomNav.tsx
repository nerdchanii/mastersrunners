import {
  Bell,
  Bug,
  Dumbbell,
  Home,
  MessageCircle,
  Plus,
  Search,
  SquarePen,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

const mobileNavItems: NavItem[] = [
  {
    href: "/feed",
    label: "홈",
    icon: Home,
    auth: false,
    badge: null as "messages" | "notifications" | null,
  },
  {
    href: "/search",
    label: "검색",
    icon: Search,
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

interface BottomNavProps {
  initialCreateSheetOpen?: boolean;
}

export function BottomNav({ initialCreateSheetOpen = false }: BottomNavProps) {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const [createSheetOpen, setCreateSheetOpen] = useState(initialCreateSheetOpen);
  const { data: runtimeConfig } = usePublicRuntimeConfig();
  const unread = useUnreadCounts();
  const config = runtimeConfig ?? defaultPublicRuntimeConfig;

  const visibleItems = mobileNavItems.filter(
    (item) => (!item.auth || isAuthenticated) && (!item.feature || config.features[item.feature]),
  );
  const hideOnMobileChatRoute =
    pathname.startsWith("/messages/") || /\/crews\/[^/]+\/activities\/[^/]+\/chat$/.test(pathname);

  if (hideOnMobileChatRoute) {
    return null;
  }

  const leftItems = visibleItems.slice(0, 3);
  const rightItems = visibleItems.slice(3);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-lg md:hidden">
        {isAuthenticated ? (
          <div className="grid h-16 grid-cols-7 items-center gap-1 px-2 pb-[env(safe-area-inset-bottom)]">
            {leftItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              const badgeCount = item.badge ? unread[item.badge] : 0;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  data-testid={item.href === "/search" ? "mobile-search-link" : undefined}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" strokeWidth={isActive ? 2.5 : 1.5} />
                  {badgeCount > 0 && (
                    <span className="absolute right-1 top-0 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </span>
                  )}
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}

            <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  data-testid="mobile-create-trigger"
                  className="flex flex-col items-center justify-center gap-0.5"
                  aria-label="작성 열기"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background">
                    <Plus className="size-5" strokeWidth={2.5} />
                  </span>
                  <span className="text-[10px] font-medium text-foreground">작성</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl">
                <SheetHeader>
                  <SheetTitle>무엇을 올릴까요?</SheetTitle>
                  <SheetDescription>
                    게시글과 운동 기록 중 바로 시작할 흐름을 선택하세요.
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 grid gap-3">
                  <SheetClose asChild>
                    <Link
                      to="/posts/new"
                      className="flex items-center justify-between rounded-2xl border border-border/60 px-4 py-4 transition-colors hover:bg-accent/40"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">새 게시글</p>
                        <p className="text-xs text-muted-foreground">
                          사진, 해시태그, 훈련 기록을 함께 남깁니다.
                        </p>
                      </div>
                      <SquarePen className="size-5 text-muted-foreground" />
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      to="/workouts/new"
                      className="flex items-center justify-between rounded-2xl border border-border/60 px-4 py-4 transition-colors hover:bg-accent/40"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">운동 기록 추가</p>
                        <p className="text-xs text-muted-foreground">
                          FIT/GPX 업로드 또는 직접 입력으로 기록합니다.
                        </p>
                      </div>
                      <Dumbbell className="size-5 text-muted-foreground" />
                    </Link>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>

            {rightItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              const badgeCount = item.badge ? unread[item.badge] : 0;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  data-testid={item.href === "/search" ? "mobile-search-link" : undefined}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" strokeWidth={isActive ? 2.5 : 1.5} />
                  {badgeCount > 0 && (
                    <span className="absolute right-1 top-0 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </span>
                  )}
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex h-14 items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              const badgeCount = item.badge ? unread[item.badge] : 0;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  data-testid={item.href === "/search" ? "mobile-search-link" : undefined}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1 transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" strokeWidth={isActive ? 2.5 : 1.5} />
                  {badgeCount > 0 && (
                    <span className="absolute right-1 top-0 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </span>
                  )}
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

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
    </>
  );
}
