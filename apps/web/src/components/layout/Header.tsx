import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, API_BASE } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationsResponse {
  data: Array<{ unreadCount: number }>;
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
  const { pathname } = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        const data = await api.fetch<ConversationsResponse>(
          "/conversations?limit=100"
        );
        const total = data?.data?.reduce((sum, conv) => sum + conv.unreadCount, 0) ?? 0;
        setUnreadCount(total);
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };

    fetchUnreadCount();

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const eventSource = new EventSource(
      `${API_BASE}/conversations/sse?token=${encodeURIComponent(token)}`
    );

    eventSource.addEventListener("new-message", () => {
      fetchUnreadCount();
    });

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [isAuthenticated]);

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
          {isLoading ? (
            <div className="h-8 w-16 animate-pulse rounded-lg bg-muted" />
          ) : isAuthenticated ? (
            <>
              <Link
                to="/messages"
                className={cn(
                  "relative rounded-lg p-2 transition-colors hover:bg-accent",
                  isActive("/messages") && "bg-accent"
                )}
              >
                <MessageCircle className="size-5 text-foreground" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 p-0 text-[10px] text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Link>
              <Link
                to="/profile"
                className={cn(
                  "rounded-lg p-2 transition-colors hover:bg-accent",
                  isActive("/profile") && "bg-accent"
                )}
              >
                <Bell className="size-5 text-foreground" />
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
