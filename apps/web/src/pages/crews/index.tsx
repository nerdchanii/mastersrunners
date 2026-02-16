
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import CrewCard from "@/components/crew/CrewCard";

type Tab = "all" | "my";

interface Crew {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isPublic: boolean;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  _count: {
    members: number;
  };
}

interface CrewListResponse {
  data: Crew[];
  nextCursor: string | null;
}

export default function CrewsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [tab, setTab] = useState<Tab>("all");
  const [crews, setCrews] = useState<Crew[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchCrews = useCallback(
    async (loadMore = false) => {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        if (tab === "all") {
          const params = new URLSearchParams({ limit: "20" });
          if (loadMore && cursor) {
            params.set("cursor", cursor);
          }
          const res = await api.fetch<CrewListResponse>(
            `/crews?${params.toString()}`
          );
          if (loadMore) {
            setCrews((prev) => [...prev, ...res.data]);
          } else {
            setCrews(res.data);
          }
          setCursor(res.nextCursor);
          setHasMore(!!res.nextCursor);
        } else {
          // "my" tab - no cursor pagination, returns array
          const res = await api.fetch<Crew[]>("/crews/my");
          setCrews(res);
          setCursor(null);
          setHasMore(false);
        }
      } catch (err) {
        console.error("Failed to load crews:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [tab, cursor]
  );

  useEffect(() => {
    setCursor(null);
    setHasMore(false);
    fetchCrews(false);
  }, [tab]);

  const handleLoadMore = () => {
    fetchCrews(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">크루</h1>
          <p className="mt-1 text-sm text-gray-600">
            함께 달리는 크루를 찾아보세요.
          </p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => navigate("/crews/new")}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            크루 만들기
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setTab("all")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              tab === "all"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            전체 크루
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setTab("my")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === "my"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              내 크루
            </button>
          )}
        </nav>
      </div>

      {/* Content */}
      {isLoading || authLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md p-6 animate-pulse"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-4/5" />
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : crews.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {tab === "my" ? "가입한 크루가 없습니다" : "크루가 없습니다"}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {tab === "my"
              ? "새로운 크루를 만들거나 기존 크루에 가입해보세요."
              : "첫 번째 크루를 만들어보세요!"}
          </p>
          {isAuthenticated && (
            <button
              onClick={() => navigate("/crews/new")}
              className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              크루 만들기
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {crews.map((crew) => (
              <CrewCard key={crew.id} crew={crew} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    불러오는 중...
                  </>
                ) : (
                  "더보기"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
