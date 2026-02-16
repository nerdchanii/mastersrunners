import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Zap } from "lucide-react";
import { api } from "@/lib/api-client";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import ChallengeCard from "@/components/challenge/ChallengeCard";

interface Challenge {
  id: string;
  name: string;
  description: string | null;
  goalType: string;
  goalValue: number;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  _count?: { participants: number };
  myProgress?: number | null;
}

interface ChallengeListResponse {
  items: Challenge[];
  nextCursor: string | null;
  hasMore: boolean;
}

type ChallengeTab = "all" | "my";

export default function ChallengesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ChallengeTab>("all");

  const [items, setItems] = useState<Challenge[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = async (tab: ChallengeTab, cursor?: string | null) => {
    try {
      setIsLoading(true);
      setError(null);

      let path: string;
      if (tab === "my") {
        path = "/challenges?joined=true&limit=12";
      } else {
        path = "/challenges?limit=12";
      }

      if (cursor) {
        path += `&cursor=${encodeURIComponent(cursor)}`;
      }

      const data = await api.fetch<ChallengeListResponse>(path);
      const items = data?.items ?? [];

      if (cursor) {
        setItems((prev) => [...prev, ...items]);
      } else {
        setItems(items);
      }

      setNextCursor(data?.nextCursor ?? null);
      setHasMore(data?.hasMore ?? false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "챌린지 목록을 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setItems([]);
    setNextCursor(null);
    setHasMore(true);
    fetchChallenges(activeTab);
  }, [activeTab]);

  const handleLoadMore = () => {
    if (nextCursor && !isLoading) {
      fetchChallenges(activeTab, nextCursor);
    }
  };

  return (
    <div className="container max-w-7xl py-6 space-y-6">
      <PageHeader
        title="챌린지"
        description="목표를 설정하고 함께 도전하세요"
        actions={
          <Button asChild>
            <Link to="/challenges/new">
              <Plus className="mr-2 size-4" />
              챌린지 만들기
            </Link>
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ChallengeTab)}>
        <TabsList variant="line">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="my">내 챌린지</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive font-medium">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchChallenges(activeTab)}
                className="mt-2 h-8"
              >
                다시 시도
              </Button>
            </div>
          )}

          {isLoading && items.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : items.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center pt-6">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    variant="outline"
                  >
                    {isLoading ? "불러오는 중..." : "더보기"}
                  </Button>
                </div>
              )}
            </>
          ) : !error ? (
            <EmptyState
              icon={Zap}
              title={activeTab === "my" ? "참가한 챌린지가 없습니다" : "등록된 챌린지가 없습니다"}
              description="새로운 챌린지를 만들고 목표를 달성해보세요"
              actionLabel="챌린지 만들기"
              onAction={() => navigate("/challenges/new")}
            />
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
