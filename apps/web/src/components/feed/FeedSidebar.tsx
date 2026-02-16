import { useAuth } from "@/lib/auth-context";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function FeedSidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden lg:block w-72 shrink-0 space-y-6">
      {/* Profile Card */}
      {user && (
        <div className="rounded-xl border bg-card p-4">
          <UserAvatar user={user} size="lg" showName />
          {user.bio && (
            <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
              {user.bio}
            </p>
          )}
          <Link to="/profile" className="block mt-3">
            <Button variant="outline" size="sm" className="w-full text-xs">
              프로필 보기
            </Button>
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="text-sm font-semibold text-foreground">빠른 기록</h3>
        <Link to="/workouts/new">
          <Button variant="outline" size="sm" className="w-full text-xs">
            워크아웃 추가
          </Button>
        </Link>
        <Link to="/posts/new">
          <Button variant="outline" size="sm" className="w-full text-xs">
            게시글 작성
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground text-center">
        마스터즈 러너스 &copy; {new Date().getFullYear()}
      </p>
    </aside>
  );
}
