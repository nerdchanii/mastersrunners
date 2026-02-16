import { Link, useLocation } from "react-router-dom";
import { Home, Users, Trophy, User, PlusSquare } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/feed", label: "홈", icon: Home, auth: false },
  { href: "/crews", label: "크루", icon: Users, auth: false },
  { href: "/workouts/new", label: "기록", icon: PlusSquare, auth: true },
  { href: "/challenges", label: "챌린지", icon: Trophy, auth: false },
  { href: "/profile", label: "프로필", icon: User, auth: true },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();

  const visibleItems = navItems.filter((item) => !item.auth || isAuthenticated);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-around h-14 px-2 pb-[env(safe-area-inset-bottom)]">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Icon
                className={cn(
                  "size-5",
                  item.href === "/workouts/new" && "size-6"
                )}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
