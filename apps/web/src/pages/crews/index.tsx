import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import CrewCard from "@/components/crew/CrewCard";

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
  const { isAuthenticated } = useAuth();

  const [tab, setTab] = useState<"all" | "my">("all");
  const [searchQuery, setSearchQuery] = useState("");
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
          if (searchQuery) {
            params.set("search", searchQuery);
          }
          const res = await api.fetch<CrewListResponse>(
            `/crews?${params.toString()}`
          );
          const items = res?.data ?? [];
          if (loadMore) {
            setCrews((prev) => [...prev, ...items]);
          } else {
            setCrews(items);
          }
          setCursor(res?.nextCursor ?? null);
          setHasMore(!!res?.nextCursor);
        } else {
          const params = new URLSearchParams({ myCrews: "true" });
          const res = await api.fetch<Crew[]>(`/crews?${params.toString()}`);
          setCrews(Array.isArray(res) ? res : []);
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
    [tab, cursor, searchQuery]
  );

  useEffect(() => {
    setCursor(null);
    setHasMore(false);
    fetchCrews(false);
  }, [tab, searchQuery]);

  const handleLoadMore = () => {
    fetchCrews(true);
  };

  const filteredCrews = crews.filter((crew) =>
    crew.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container max-w-6xl mx-auto py-6 space-y-6">
      <PageHeader
        title="크루"
        description="함께 달리는 크루를 찾아보세요"
        actions={
          isAuthenticated && (
            <Button onClick={() => navigate("/crews/new")}>
              <Plus className="size-4 mr-2" />
              크루 만들기
            </Button>
          )
        }
      />

      <Input
        type="search"
        placeholder="크루 이름으로 검색..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "my")}>
        <TabsList>
          <TabsTrigger value="all">전체 크루</TabsTrigger>
          {isAuthenticated && <TabsTrigger value="my">내 크루</TabsTrigger>}
        </TabsList>

        <TabsContent value={tab} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : filteredCrews.length === 0 ? (
            <EmptyState
              icon={Users}
              title={
                tab === "my" ? "가입한 크루가 없습니다" : "크루가 없습니다"
              }
              description={
                tab === "my"
                  ? "새로운 크루를 만들거나 기존 크루에 가입해보세요."
                  : "첫 번째 크루를 만들어보세요!"
              }
              actionLabel={isAuthenticated ? "크루 만들기" : undefined}
              onAction={
                isAuthenticated ? () => navigate("/crews/new") : undefined
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCrews.map((crew) => (
                  <CrewCard key={crew.id} crew={crew} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? "불러오는 중..." : "더보기"}
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
