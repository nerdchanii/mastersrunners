import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api-client";
import EventCard from "@/components/event/EventCard";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
        path = `/events?limit=12&upcoming=${tab === "upcoming"}`;
      }

      if (cursor) {
        path += `&cursor=${encodeURIComponent(cursor)}`;
      }

      const data = await api.fetch<EventListResponse>(path);
      const items = data?.items ?? [];

      if (cursor) {
        setItems((prev) => [...prev, ...items]);
      } else {
        setItems(items);
      }

      setNextCursor(data?.nextCursor ?? null);
      setHasMore(data?.hasMore ?? false);
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
    { key: "upcoming", label: "다가오는" },
    { key: "past", label: "지난" },
    { key: "my", label: "내 대회" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="대회"
        description="마스터즈 러너들의 대회 일정을 확인하세요."
        actions={
          <Button asChild>
            <Link to="/events/new">
              <Plus className="h-4 w-4 mr-2" />
              대회 등록
            </Link>
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 font-medium text-sm transition-all relative",
              activeTab === tab.key
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive font-medium">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchEvents(activeTab)}
            className="mt-2 text-destructive hover:text-destructive"
          >
            다시 시도
          </Button>
        </div>
      )}

      {/* Grid */}
      {items.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Load More */}
      {!isLoading && hasMore && items.length > 0 && (
        <div className="flex justify-center">
          <Button onClick={handleLoadMore} variant="outline" size="lg">
            더보기
          </Button>
        </div>
      )}

      {/* No More */}
      {!isLoading && !hasMore && items.length > 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          더 이상 대회가 없습니다.
        </div>
      )}

      {/* Empty */}
      {!isLoading && items.length === 0 && !error && (
        <EmptyState
          icon={Calendar}
          title={activeTab === "my" ? "참가한 대회가 없습니다" : "등록된 대회가 없습니다"}
          description="새로운 대회를 등록해보세요!"
        />
      )}
    </div>
  );
}