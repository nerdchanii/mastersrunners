import { CalendarDays, Dumbbell, Search, SquarePen, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { UserAvatar } from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

const quickLinks = [
  { href: "/search", label: "러너 검색", icon: Search },
  { href: "/crews", label: "크루 둘러보기", icon: Users },
  { href: "/events", label: "이벤트 확인", icon: CalendarDays },
  { href: "/challenges", label: "챌린지 보기", icon: Dumbbell },
];

export function FeedSidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden w-72 shrink-0 space-y-4 lg:block">
      {user ? (
        <Card className="border-border/70 bg-card/95 shadow-sm">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-start gap-3">
              <UserAvatar user={user} size="lg" showName />
            </div>
            {user.bio ? (
              <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">{user.bio}</p>
            ) : (
              <p className="text-xs leading-5 text-muted-foreground">
                닉네임, 소개, 거점은 프로필에서 언제든 다시 조정할 수 있습니다.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">로그인 완료</Badge>
              <Badge variant="outline">커뮤니티 탐색</Badge>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <Link to="/profile">프로필 보기</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/70 bg-card/95 shadow-sm">
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-semibold text-foreground">
              로그인하면 더 잘 맞는 추천을 볼 수 있어요.
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
              러너와 크루 추천, 기록, 활동 흐름은 로그인 뒤에 더 자연스럽게 연결됩니다.
            </p>
            <Button asChild className="w-full">
              <Link to="/login">로그인하기</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div>
            <p className="text-sm font-semibold text-foreground">탐색 바로가기</p>
            <p className="text-xs text-muted-foreground">
              추천 모듈에서 바로 이어질 수 있는 동선입니다.
            </p>
          </div>
          <div className="space-y-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 border-border/70 bg-background/70"
                >
                  <Link to={item.href}>
                    <Icon className="size-4 text-muted-foreground" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardContent className="space-y-2 p-4">
          <p className="text-sm font-semibold text-foreground">빠른 기록</p>
          <Button asChild variant="outline" size="sm" className="w-full justify-start">
            <Link to="/workouts/new">
              <Dumbbell className="size-4" />
              워크아웃 추가
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full justify-start">
            <Link to="/posts/new">
              <SquarePen className="size-4" />
              게시글 작성
            </Link>
          </Button>
        </CardContent>
      </Card>

      <p className="text-[10px] text-center text-muted-foreground">
        마스터즈 러너스 &copy; {new Date().getFullYear()}
      </p>
    </aside>
  );
}
