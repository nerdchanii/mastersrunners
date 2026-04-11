import { Lock, LogOut, MoreHorizontal, Settings, Share2, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { AuthGateDialog } from "@/components/common/AuthGateDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import CrewActivityList from "@/components/crew/CrewActivityList";
import CrewAttendanceStats from "@/components/crew/CrewAttendanceStats";
import CrewBoardList from "@/components/crew/CrewBoardList";
import CrewIdentityHero from "@/components/crew/CrewIdentityHero";
import CrewMemberList from "@/components/crew/CrewMemberList";
import CrewPostList from "@/components/crew/CrewPostList";
import CrewTagManager from "@/components/crew/CrewTagManager";
import PendingMemberList from "@/components/crew/PendingMemberList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { shareLink } from "@/lib/share-link";

import { fetchCrewDetail, joinCrew, leaveCrew } from "./crew-detail-api";

interface CrewMember {
  id: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  status: "ACTIVE" | "PENDING" | "LEFT";
  joinedAt: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface CrewDetail {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  isPublic: boolean;
  maxMembers: number | null;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  members: CrewMember[];
  _count: {
    members: number;
  };
}

export default function CrewDetailClient() {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const crewId = params.id as string;

  const [crew, setCrew] = useState<CrewDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isSharingInvite, setIsSharingInvite] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogTitle, setAuthDialogTitle] = useState("크루 참여");
  const currentMember = crew?.members?.find((member) => member.userId === user?.id);
  const isMember = !!currentMember && currentMember.status === "ACTIVE";

  const fetchCrew = useCallback(async () => {
    if (!crewId || crewId === "_") return;
    try {
      setIsLoading(true);
      const data = await fetchCrewDetail(crewId);
      setCrew(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "크루를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [crewId]);

  useEffect(() => {
    fetchCrew();
  }, [fetchCrew]);

  const canJoinCrew = !currentMember || currentMember.status === "LEFT";
  const currentUserRole = currentMember?.role ?? null;
  const isOwnerOrAdmin = currentUserRole === "OWNER" || currentUserRole === "ADMIN";
  const isInviteEntry = searchParams.get("invite") === "1";
  const authReturnPath =
    typeof window === "undefined"
      ? `/crews/${crewId}${isInviteEntry ? "?invite=1" : ""}`
      : `${window.location.pathname}${window.location.search}${window.location.hash}`;

  const handleJoin = async () => {
    if (!crewId) return;
    if (!user) {
      setAuthDialogTitle("크루 참여");
      setShowAuthDialog(true);
      return;
    }
    setIsJoining(true);
    try {
      await joinCrew(crewId);
      await fetchCrew();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "가입에 실패했습니다.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleShareInvite = async () => {
    if (!crewId || !crew) {
      return;
    }

    setIsSharingInvite(true);
    try {
      const result = await shareLink({
        title: `${crew.name} 크루`,
        text: `${crew.name} 크루 페이지를 확인해보세요.`,
        url: typeof window === "undefined" ? `/crews/${crewId}` : window.location.href,
      });

      if (result === "shared") {
        toast.success("크루 페이지 공유 창을 열었습니다.");
      } else if (result === "copied") {
        toast.success("크루 페이지를 복사했습니다.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "크루 페이지를 공유하지 못했습니다.");
    } finally {
      setIsSharingInvite(false);
    }
  };

  const handleLeave = async () => {
    if (!crewId) return;
    try {
      await leaveCrew(crewId);
      setShowLeaveDialog(false);
      navigate("/crews");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "탈퇴에 실패했습니다.");
    }
  };

  if (!crewId || crewId === "_") {
    return (
      <div className="container max-w-2xl mx-auto text-center py-12">
        <p className="text-muted-foreground">크루 ID가 필요합니다.</p>
        <Button variant="link" onClick={() => navigate("/crews")} className="mt-4">
          크루 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-6 space-y-6">
        <div className="rounded-3xl border border-border/60 bg-background/80 p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="w-16 h-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
          <Skeleton className="mt-4 h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error || !crew) {
    return (
      <div className="container max-w-2xl mx-auto py-6">
        <div className="rounded-3xl border border-destructive bg-background/80 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">오류</h2>
          <p className="text-muted-foreground mb-4">{error || "크루를 찾을 수 없습니다."}</p>
          <Button variant="outline" onClick={() => navigate("/crews")}>
            크루 목록으로
          </Button>
        </div>
      </div>
    );
  }

  const activeMembers = crew.members.filter((m) => m.status === "ACTIVE");
  const heroProfileImage = crew.profileImageUrl ?? crew.imageUrl ?? null;
  const heroCoverImage = crew.coverImageUrl ?? null;

  return (
    <div className="mx-auto max-w-6xl sm:space-y-5">
      {isInviteEntry && !isMember && (
        <section className="border-primary/20 bg-primary/5 px-5 py-4 sm:mx-6 sm:rounded-3xl sm:border">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">공유 링크로 들어왔어요.</p>
              <p className="text-sm text-muted-foreground">
                크루를 둘러본 뒤 가입할 수 있어요. 공개 크루는 바로 가입되고, 비공개 크루는 가입
                요청이 대기 멤버로 전달됩니다.
              </p>
            </div>
            {currentMember?.status === "PENDING" ? (
              <Badge variant="secondary" className="w-fit">
                가입 요청 대기 중
              </Badge>
            ) : (
              canJoinCrew && (
                <Button
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="h-10 rounded-full font-bold shadow-md"
                >
                  <UserPlus className="mr-2 size-4" />
                  {isJoining ? "가입 중..." : "이 링크로 가입하기"}
                </Button>
              )
            )}
          </div>
        </section>
      )}

      <CrewIdentityHero
        crewId={crewId}
        name={crew.name}
        description={crew.description}
        creatorName={crew.creator.name}
        createdAt={crew.createdAt}
        memberCount={crew._count.members}
        maxMembers={crew.maxMembers}
        isPublic={crew.isPublic}
        profileImageUrl={heroProfileImage}
        coverImageUrl={heroCoverImage}
        members={activeMembers}
        currentUserId={user?.id}
        currentUserRole={currentUserRole}
        onMembersUpdate={fetchCrew}
        chatHref={`/messages/crew/${crewId}`}
        topActions={
          isMember && currentUserRole !== "OWNER" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton
                  variant="ghost"
                  className="border border-background/35 bg-background/55 shadow-xs backdrop-blur-sm"
                  aria-label="크루 멤버 메뉴"
                >
                  <MoreHorizontal className="size-4" />
                </IconButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem variant="destructive" onClick={() => setShowLeaveDialog(true)}>
                  <LogOut className="size-4" />
                  크루 탈퇴
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null
        }
        actions={
          <>
            {canJoinCrew && (
              <IconButton
                variant="default"
                onClick={handleJoin}
                disabled={isJoining}
                aria-label={isJoining ? "가입 중" : "크루 가입"}
              >
                <UserPlus className="size-4" />
              </IconButton>
            )}

            {isMember && (
              <IconButton
                variant="outline"
                onClick={handleShareInvite}
                disabled={isSharingInvite}
                aria-label={isSharingInvite ? "공유 준비 중" : "크루 페이지 공유"}
              >
                <Share2 className="size-4" />
              </IconButton>
            )}

            {isOwnerOrAdmin && (
              <IconButton
                variant="outline"
                onClick={() => navigate(`/crews/${crewId}/settings`)}
                aria-label="설정"
              >
                <Settings className="size-4" />
              </IconButton>
            )}
          </>
        }
      />

      <div className="grid gap-8 px-0 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-6">
        <div className="space-y-10">
          <section>
            <Tabs defaultValue="activities" className="w-full">
              <div className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
                <TabsList className="flex h-14 w-full justify-start gap-8 rounded-none bg-transparent p-0">
                  <TabsTrigger
                    value="activities"
                    className="h-full rounded-none border-b-2 border-transparent px-2 text-base font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
                  >
                    활동
                  </TabsTrigger>
                  <TabsTrigger
                    value="board"
                    className="h-full rounded-none border-b-2 border-transparent px-2 text-base font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
                  >
                    게시판
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="py-6 sm:py-8">
                <TabsContent value="activities" className="mt-0 focus-visible:outline-none">
                  <div className="space-y-6 px-2 sm:px-4">
                    <CrewActivityList
                      canOpenActivityDetails={isMember}
                      crewId={crewId}
                      isAdmin={isOwnerOrAdmin}
                      isMember={isMember}
                      isAuthenticated={!!user}
                      onRequireAuth={() => {
                        setAuthDialogTitle("활동 자세히 보기");
                        setShowAuthDialog(true);
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="board" className="mt-0 focus-visible:outline-none">
                  <div className="space-y-12">
                    <section className="space-y-6">
                      <CrewBoardList
                        canOpenBoardPosts={isMember}
                        crewId={crewId}
                        isAuthenticated={!!user}
                        isMember={isMember}
                        isAdmin={isOwnerOrAdmin}
                        onRequireAuth={() => {
                          setAuthDialogTitle("게시판 열기");
                          setShowAuthDialog(true);
                        }}
                      />
                    </section>

                    {isMember ? (
                      <section className="space-y-6 border-t border-border/60 pt-10">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-bold tracking-tight text-foreground">
                            크루 소식
                          </h2>
                        </div>
                        <CrewPostList crewId={crewId} isOwner={currentUserRole === "OWNER"} />
                      </section>
                    ) : null}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </section>
        </div>

        <aside className="space-y-12">
          <section className="space-y-6">
            <div className="px-4 sm:px-0">
              <h2 className="text-xl font-bold tracking-tight text-foreground">멤버</h2>
            </div>
            <div className="border-t border-border/40 pt-4">
              <CrewMemberList
                crewId={crewId}
                members={activeMembers}
                currentUserId={user?.id}
                currentUserRole={currentUserRole}
                onUpdate={fetchCrew}
              />
            </div>
          </section>

          {isOwnerOrAdmin && (
            <section className="space-y-6">
              <div className="px-4 sm:px-0">
                <h2 className="text-xl font-bold tracking-tight text-foreground">운영 현황</h2>
              </div>
              <div className="rounded-3xl border bg-muted/10 p-6">
                <CrewAttendanceStats crewId={crewId} />
              </div>
            </section>
          )}

          {isOwnerOrAdmin && (
            <section className="space-y-8">
              <div className="px-4 sm:px-0">
                <h2 className="text-xl font-bold tracking-tight text-foreground">운영 도구</h2>
              </div>
              <div className="space-y-10">
                <section className="space-y-4 px-4 sm:px-0">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    태그 관리
                  </h3>
                  <CrewTagManager
                    crewId={crewId}
                    isAdmin={isOwnerOrAdmin}
                    members={activeMembers}
                  />
                </section>

                <section className="space-y-4 px-4 sm:px-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      가입 대기
                    </h3>
                    <Badge variant="secondary" className="rounded-full px-2.5 font-bold">
                      {crew.members.filter((m) => m.status === "PENDING").length}
                    </Badge>
                  </div>
                  <PendingMemberList crewId={crewId} onUpdate={fetchCrew} />
                </section>
              </div>
            </section>
          )}
        </aside>
      </div>

      {/* Leave Confirmation Dialog */}
      <ConfirmDialog
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        onConfirm={handleLeave}
        title="크루 탈퇴"
        description="정말 크루를 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmLabel="탈퇴"
        variant="destructive"
      />

      <AuthGateDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        nextPath={authReturnPath}
        title={authDialogTitle}
      />
    </div>
  );
}
