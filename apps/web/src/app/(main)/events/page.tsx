"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import EventCard from "@/components/event/EventCard";

interface Event {
  id: string;
  name: string;
  description: string | null;
  date: string;
  location: string | null;
  maxParticipants: number | null;
  _count?: { participants: number };
}

interface EventListResponse {
  items: Event[];
  nextCursor: string | null;
  hasMore: boolean;
}

type EventTab = "upcoming" | "past" | "my";

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<EventTab>("upcoming");

  const [items, setItems] = useState<Event[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async (tab: EventTab, cursor?: string | null) => {
    try {
      setIsLoading(true);
      setError(null);

      let path: string;
      if (tab === "my") {
        path = "/events/my?limit=12";
      } else {
        path = `/events?limit=12&period=${tab}`;
      }

      if (cursor) {
        path += `&cursor=${encodeURIComponent(cursor)}`;
      }

      const data = await api.fetch<EventListResponse>(path);

      if (cursor) {
        setItems((prev) => [...prev, ...data.items]);
      } else {
        setItems(data.items);
      }

      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "대회 목록을 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setItems([]);
    setNextCursor(null);
    setHasMore(true);
    fetchEvents(activeTab);
  }, [activeTab]);

  const handleLoadMore = () => {
    if (nextCursor && !isLoading) {
      fetchEvents(activeTab, nextCursor);
    }
  };

  const tabs: { key: EventTab; label: string }[] = [
    { key: "upcoming", label: "다가오는 대회" },
    { key: "past", label: "지난 대회" },
    { key: "my", label: "내 대회" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">대회</h1>
          <p className="mt-2 text-sm text-gray-600">
            마스터즈 러너들의 대회 일정을 확인하세요.
          </p>
        </div>
        <Link
          href="/events/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          대회 등록
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === tab.key
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => fetchEvents(activeTab)}
            className="mt-2 text-red-600 hover:text-red-700 underline text-sm"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* Grid */}
      {items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      )}

      {/* Load More */}
      {!isLoading && hasMore && items.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            더보기
          </button>
        </div>
      )}

      {/* No More */}
      {!isLoading && !hasMore && items.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          더 이상 대회가 없습니다.
        </div>
      )}

      {/* Empty */}
      {!isLoading && items.length === 0 && !error && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-lg mt-4">
            {activeTab === "my" ? "참가한 대회가 없습니다." : "등록된 대회가 없습니다."}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            새로운 대회를 등록해보세요!
          </p>
        </div>
      )}
    </div>
  );
}
