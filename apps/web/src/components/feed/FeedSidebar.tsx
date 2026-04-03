import { Dumbbell, Search, SquarePen, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { AuthGateDialog } from "@/components/common/AuthGateDialog";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import {
  defaultPublicRuntimeConfig,
  type PublicFeatureName,
  usePublicRuntimeConfig,
} from "@/lib/public-config";

const quickLinks = [
  { href: "/search", label: "러너 검색", icon: Search },
  { href: "/crews", label: "크루 둘러보기", icon: Users },
  { href: "/feed", label: "공개 피드", icon: Dumbbell },
];

type QuickLink = {
  feature?: PublicFeatureName;
  href: string;
  icon: typeof Search;
  label: string;
};

export function FeedSidebar() {
  const { user } = useAuth();
  const { data: runtimeConfig } = usePublicRuntimeConfig();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const config = runtimeConfig ?? defaultPublicRuntimeConfig;
  const visibleQuickLinks = (quickLinks as QuickLink[]).filter(
    (item) => !item.feature || config.features[item.feature],
  );

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
              공개 크루와 피드는 로그인 없이도 둘러볼 수 있습니다.
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
              참여, 댓글, 채팅, 기록 작성은 로그인 뒤에 이어집니다.
            </p>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/login?intent=login&next=/feed">로그인</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link to="/login?intent=signup&next=/feed">회원가입</Link>
              </Button>
            </div>
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
            {visibleQuickLinks.map((item) => {
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
          {user ? (
            <>
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
            </>
          ) : (
            <>
              <p className="text-xs leading-5 text-muted-foreground">
                기록 작성과 게시글 등록은 로그인 뒤에 바로 이어집니다.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowAuthDialog(true)}
              >
                <Dumbbell className="size-4" />
                워크아웃 추가
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowAuthDialog(true)}
              >
                <SquarePen className="size-4" />
                게시글 작성
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <p className="text-[10px] text-center text-muted-foreground">
        마스터즈 러너스 &copy; {new Date().getFullYear()}
      </p>

      <AuthGateDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        nextPath="/feed"
        title="로그인하면 기록을 남길 수 있습니다."
        description="공개 피드는 계속 둘러보고, 직접 기록하거나 게시글을 올릴 때만 로그인하면 됩니다."
      />
    </aside>
  );
}
