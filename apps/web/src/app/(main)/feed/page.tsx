"use client";

import { useState, useEffect } from "react";
import FeedCard from "@/components/feed/FeedCard";
import { api } from "@/lib/api-client";

interface FeedItem {
  id: string;
  distance: number;
  duration: number;
  pace: number;
  date: string;
  memo: string | null;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface FeedResponse {
  items: FeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = async (cursor?: string | null) => {
    try {
      setLoading(true);
      setError(null);

      let path = "/feed?limit=10";
      if (cursor) {
        path += `&cursor=${encodeURIComponent(cursor)}`;
      }

      const data = await api.fetch<FeedResponse>(path);

      if (cursor) {
        // Append to existing items
        setItems((prev) => [...prev, ...data.items]);
      } else {
        // Initial load
        setItems(data.items);
      }

      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleLoadMore = () => {
    if (nextCursor && !loading) {
      fetchFeed(nextCursor);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">커뮤니티 피드</h1>
        <p className="text-gray-600 mt-2">
          마스터즈 러너들의 훈련 기록을 확인하세요
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => fetchFeed()}
            className="mt-2 text-red-600 hover:text-red-700 underline text-sm"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* Feed Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <FeedCard key={item.id} workout={item} />
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Load More Button */}
      {!loading && hasMore && items.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            더보기
          </button>
        </div>
      )}

      {/* No More Items */}
      {!loading && !hasMore && items.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          더 이상 기록이 없습니다
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            아직 공유된 훈련 기록이 없습니다
          </p>
          <p className="text-gray-400 text-sm mt-2">
            첫 번째로 기록을 공유해보세요!
          </p>
        </div>
      )}
    </div>
  );
}
