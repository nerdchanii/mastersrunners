import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, API_BASE } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";

interface ConversationsResponse {
  data: Array<{ unreadCount: number }>;
}

export default function Header() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: "/feed", label: "피드", auth: false },
    { href: "/crews", label: "크루", auth: true },
    { href: "/events", label: "대회", auth: false },
    { href: "/challenges", label: "챌린지", auth: false },
    { href: "/messages", label: "메시지", auth: true, badge: unreadCount > 0 },
    { href: "/workouts", label: "내 기록", auth: true },
    { href: "/workouts/new", label: "기록 추가", auth: true },
    { href: "/profile", label: "프로필", auth: true },
  ];

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        const data = await api.fetch<ConversationsResponse>("/conversations?limit=100");
        const total = data.data.reduce((sum, conv) => sum + conv.unreadCount, 0);
        setUnreadCount(total);
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };

    // Initial fetch
    fetchUnreadCount();

    // Set up SSE connection for real-time updates
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const eventSource = new EventSource(
      `${API_BASE}/conversations/sse?token=${encodeURIComponent(token)}`
    );

    eventSource.addEventListener("new-message", () => {
      // When a new message arrives, refresh the unread count
      fetchUnreadCount();
    });

    eventSource.onerror = (err) => {
      console.error("SSE error in header:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [isAuthenticated]);

  const visibleLinks = navLinks.filter(
    (link) => !link.auth || isAuthenticated
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-gray-900 transition-colors hover:text-gray-700"
          >
            마스터스 러너스
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative text-sm font-medium transition-colors flex items-center gap-1 ${
                  isActive(link.href)
                    ? "text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.label}
                {link.badge && (
                  <Badge
                    variant="default"
                    className="bg-red-600 text-white h-4 min-w-[16px] px-1 text-[10px] flex items-center justify-center"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
                {isActive(link.href) && (
                  <span className="absolute -bottom-[21px] left-0 h-0.5 w-full bg-gray-900" />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isLoading ? (
              <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-200" />
            ) : isAuthenticated ? (
              <button
                onClick={logout}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800 active:scale-95"
              >
                로그아웃
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800 active:scale-95"
              >
                로그인
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 md:hidden"
            aria-label="메뉴 열기"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-1 border-t border-gray-200 py-4">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors flex items-center justify-between ${
                  isActive(link.href)
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {link.label}
                {link.badge && (
                  <Badge
                    variant="default"
                    className="bg-red-600 text-white h-4 min-w-[16px] px-1 text-[10px] flex items-center justify-center"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Link>
            ))}

            <div className="mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white transition-all active:scale-95"
                >
                  로그아웃
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg bg-gray-900 px-4 py-3 text-center text-sm font-medium text-white transition-all active:scale-95"
                >
                  로그인
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
