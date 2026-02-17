import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, User, Hash, TrendingUp, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useUserSearch, type SearchUser } from "@/hooks/useUserSearch";
import { useHashtagPosts, usePopularHashtags } from "@/hooks/useHashtags";
import PostFeedCard from "@/components/feed/PostFeedCard";
import { cn } from "@/lib/utils";

// ─── 인기 해시태그 섹션 ────────────────────────────────────────
function PopularHashtags() {
  const { data: tags = [], isLoading } = usePopularHashtags();

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-16 rounded-full" />
        ))}
      </div>
    );
  }

  if (tags.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <TrendingUp className="size-4" />
        인기 해시태그
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map(({ tag, count }) => (
          <Link key={tag} to={`/search?hashtag=${encodeURIComponent(tag)}&tab=hashtag`}>
            <Badge
              variant="secondary"
              className="gap-1 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            >
              #{tag}
              <span className="text-[10px] text-muted-foreground">{count}</span>
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── 유저 검색 결과 ────────────────────────────────────────────
function UserResults({ query }: { query: string }) {
  const { data: users = [], isLoading } = useUserSearch(query);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="size-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">"{query}"에 대한 사용자가 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">{users.length}명의 사용자</p>
      <div className="space-y-1">
        {users.map((user: SearchUser) => (
          <Link
            key={user.id}
            to={`/profile/${user.id}`}
            className={cn("flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-muted/50")}
          >
            <UserAvatar user={user} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              {user.bio && (
                <p className="text-xs text-muted-foreground truncate">{user.bio}</p>
              )}
              {user._count && (
                <div className="flex gap-3 mt-0.5 text-xs text-muted-foreground">
                  <span>팔로워 {user._count.followers}</span>
                  <span>워크아웃 {user._count.workouts}</span>
                </div>
              )}
            </div>
            {user.isFollowing && (
              <span className="text-xs text-muted-foreground shrink-0">팔로잉</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── 해시태그 검색 결과 ────────────────────────────────────────
function HashtagResults({ tag }: { tag: string }) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useHashtagPosts(tag);

  const posts = data?.pages.flatMap((page) => page?.items ?? []) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">결과를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <Hash className="size-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">#{tag} 태그가 달린 게시글이 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">#{tag} 태그 게시글</p>
      <div className="space-y-0 divide-y rounded-xl border overflow-hidden">
        {posts.map((post) => (
          <PostFeedCard key={post.id} post={post} />
        ))}
      </div>

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      )}

      {!isFetchingNextPage && hasNextPage && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={() => fetchNextPage()}>
            더보기
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── 메인 검색 페이지 ──────────────────────────────────────────
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "hashtag" ? "hashtag" : "user";
  const initialHashtag = searchParams.get("hashtag") ?? "";

  const [activeTab, setActiveTab] = useState<"user" | "hashtag">(initialTab);
  const [query, setQuery] = useState(initialTab === "user" ? (searchParams.get("q") ?? "") : "");
  const [hashtagQuery, setHashtagQuery] = useState(initialHashtag);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [debouncedHashtag, setDebouncedHashtag] = useState(initialHashtag);

  // URL에서 hashtag param이 변경될 때 동기화
  useEffect(() => {
    const htag = searchParams.get("hashtag") ?? "";
    const tab = searchParams.get("tab");
    if (htag) {
      setHashtagQuery(htag);
      setDebouncedHashtag(htag);
      setActiveTab("hashtag");
    }
    if (tab === "user") setActiveTab("user");
  }, [searchParams]);

  // 유저 검색 디바운스
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // 해시태그 검색 디바운스
  useEffect(() => {
    const t = setTimeout(() => setDebouncedHashtag(hashtagQuery), 400);
    return () => clearTimeout(t);
  }, [hashtagQuery]);

  const handleTabChange = (value: string) => {
    const tab = value as "user" | "hashtag";
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    setSearchParams(params, { replace: true });
  };

  const handleHashtagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/^#/, ""); // # 자동 제거
    setHashtagQuery(val);
    const params = new URLSearchParams(searchParams);
    if (val) params.set("hashtag", val);
    else params.delete("hashtag");
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">검색</h1>
        <p className="text-sm text-muted-foreground mt-1">러너와 해시태그를 검색하세요.</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="user" className="gap-2">
            <User className="size-4" />
            사용자
          </TabsTrigger>
          <TabsTrigger value="hashtag" className="gap-2">
            <Hash className="size-4" />
            해시태그
          </TabsTrigger>
        </TabsList>

        {/* 유저 검색 탭 */}
        <TabsContent value="user" className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이름 또는 이메일로 검색..."
              className="pl-9"
              autoFocus={activeTab === "user"}
            />
          </div>

          {debouncedQuery.trim().length > 0 ? (
            <UserResults query={debouncedQuery} />
          ) : (
            <div className="text-center py-12">
              <Search className="size-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm">검색어를 입력하세요.</p>
            </div>
          )}
        </TabsContent>

        {/* 해시태그 검색 탭 */}
        <TabsContent value="hashtag" className="mt-4 space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">#</span>
            <Input
              type="search"
              value={hashtagQuery}
              onChange={handleHashtagInputChange}
              placeholder="태그 검색..."
              className="pl-7"
              autoFocus={activeTab === "hashtag"}
            />
          </div>

          {/* 인기 해시태그 - 입력 전 표시 */}
          {!debouncedHashtag.trim() && (
            <PopularHashtags />
          )}

          {/* 해시태그 검색 결과 */}
          {debouncedHashtag.trim() && (
            <HashtagResults tag={debouncedHashtag.trim()} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
