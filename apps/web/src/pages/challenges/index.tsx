import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Zap } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import ChallengeCard from "@/components/challenge/ChallengeCard";
import { useInfiniteChallenges } from "@/hooks/useChallenges";

type ChallengeTab = "all" | "my";

export default function ChallengesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ChallengeTab>("all");

  const {
    data: allData,
    isLoading: allLoading,
    error: allError,
    fetchNextPage: fetchMoreAll,
    hasNextPage: allHasMore,
    isFetchingNextPage: allFetching,
    refetch: refetchAll,
  } = useInfiniteChallenges(false);

  const {
    data: myData,
    isLoading: myLoading,
    error: myError,
    fetchNextPage: fetchMoreMy,
    hasNextPage: myHasMore,
    isFetchingNextPage: myFetching,
    refetch: refetchMy,
  } = useInfiniteChallenges(true);

  const allItems = allData?.pages.flatMap((p) => p?.items ?? []) ?? [];
  const myItems = myData?.pages.flatMap((p) => p?.items ?? []) ?? [];

  const isLoading = activeTab === "all" ? allLoading : myLoading;
  const error = activeTab === "all" ? allError : myError;
  const items = activeTab === "all" ? allItems : myItems;
  const hasMore = activeTab === "all" ? (allHasMore ?? false) : (myHasMore ?? false);
  const isFetching = activeTab === "all" ? allFetching : myFetching;
  const handleLoadMore = () => {
    if (activeTab === "all") fetchMoreAll();
    else fetchMoreMy();
  };
  const handleRetry = () => {
    if (activeTab === "all") refetchAll();
    else refetchMy();
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
              <p className="text-sm text-destructive font-medium">
                {error instanceof Error ? error.message : "챌린지 목록을 불러올 수 없습니다."}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetry}
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
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center pt-6">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isFetching}
                    variant="outline"
                  >
                    {isFetching ? "불러오는 중..." : "더보기"}
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
