import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useUserSearch, type SearchUser } from "@/hooks/useUserSearch";
import { cn } from "@/lib/utils";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useCallback(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay])();

  return debouncedValue;
}

// debounce hook (simplified)
function useDebouncedValue(value: string, ms: number) {
  const [debounced, setDebounced] = useState(value);

  useState(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  });

  // We track it properly with useEffect-like behavior
  const [, forceUpdate] = useState(0);
  useState(() => {
    const t = setTimeout(() => {
      setDebounced(value);
      forceUpdate((x) => x + 1);
    }, ms);
    return () => clearTimeout(t);
  });

  return debounced;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (timer) clearTimeout(timer);
    const t = setTimeout(() => setDebouncedQuery(val), 400);
    setTimer(t);
  };

  const { data: users = [], isLoading } = useUserSearch(debouncedQuery);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">사용자 검색</h1>
        <p className="text-sm text-muted-foreground mt-1">
          러너를 찾아보세요.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={handleQueryChange}
          placeholder="이름 또는 이메일로 검색..."
          className="pl-9"
          autoFocus
        />
      </div>

      {/* Results */}
      {debouncedQuery.trim().length > 0 && (
        <div className="space-y-1">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="size-10 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <User className="size-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                "{debouncedQuery}"에 대한 검색 결과가 없습니다.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground mb-3">
                {users.length}명의 사용자
              </p>
              {users.map((user: SearchUser) => (
                <Link
                  key={user.id}
                  to={`/profile/${user.id}`}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-muted/50"
                  )}
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
          )}
        </div>
      )}

      {/* Empty state */}
      {!debouncedQuery.trim() && (
        <div className="text-center py-16">
          <Search className="size-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">검색어를 입력하세요.</p>
        </div>
      )}
    </div>
  );
}
