import { LogOut, MoreHorizontal, Settings, Share2, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { AuthGateDialog } from "@/components/common/AuthGateDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { CrewHubDetail } from "@/components/crew/crew-hub-context";
import {
  crewActivityCreatePath,
  crewBoardCreatePath,
  crewHubPath,
  type CrewHubTab,
  resolveCrewHubRoute,
} from "@/components/crew/crew-hub-routes";
import CrewHubQuickActions, { CrewHubInlineActions } from "@/components/crew/CrewHubQuickActions";
import CrewIdentityHero from "@/components/crew/CrewIdentityHero";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { shareLink } from "@/lib/share-link";

import { fetchCrewDetail, joinCrew, leaveCrew } from "./crew-detail-api";

export default function CrewDetailClient() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const crewId = params.id as string;

  const [crew, setCrew] = useState<CrewHubDetail | null>(null);
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
  const routeState = resolveCrewHubRoute(location.pathname, crewId, isOwnerOrAdmin);
  const activeTab = routeState.activeTab;

  const handleTabChange = (tab: string) => {
    navigate(crewHubPath(crewId, tab as CrewHubTab));
  };
  const authReturnPath =
    typeof window === "undefined"
      ? `/crews/${crewId}`
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

  const openBoardComposer = () => {
    navigate(crewBoardCreatePath(crewId));
  };

  const openActivityComposer = () => {
    navigate(crewActivityCreatePath(crewId));
  };

  const openAuthGate = (title: string) => {
    setAuthDialogTitle(title);
    setShowAuthDialog(true);
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

      <div className="px-0 lg:px-6">
        <section>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <TabsList
                  variant="line"
                  className="h-12 min-w-0 flex-1 justify-start gap-0 rounded-none border-0 px-0"
                >
                  <TabsTrigger
                    value="activities"
                    className="h-full flex-none rounded-none px-2 text-base font-semibold text-foreground/55 data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none after:bottom-0 after:h-[3px] after:rounded-full after:bg-foreground"
                  >
                    활동
                  </TabsTrigger>
                  <TabsTrigger
                    value="board"
                    className="h-full flex-none rounded-none px-2 text-base font-semibold text-foreground/55 data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none after:bottom-0 after:h-[3px] after:rounded-full after:bg-foreground"
                  >
                    게시판
                  </TabsTrigger>
                  <TabsTrigger
                    value="members"
                    className="h-full flex-none rounded-none px-2 text-base font-semibold text-foreground/55 data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none after:bottom-0 after:h-[3px] after:rounded-full after:bg-foreground"
                  >
                    멤버
                  </TabsTrigger>
                  {isOwnerOrAdmin && (
                    <>
                      <TabsTrigger
                        value="manage"
                        className="h-full flex-none rounded-none px-2 text-base font-semibold text-foreground/55 data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none after:bottom-0 after:h-[3px] after:rounded-full after:bg-foreground"
                      >
                        관리
                      </TabsTrigger>
                      <TabsTrigger
                        value="pending"
                        className="h-full flex-none rounded-none px-2 text-base font-semibold text-foreground/55 data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none after:bottom-0 after:h-[3px] after:rounded-full after:bg-foreground"
                      >
                        가입대기
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>
                <CrewHubInlineActions
                  canWritePost={isMember}
                  canCreateActivity={isOwnerOrAdmin}
                  onWritePost={openBoardComposer}
                  onCreateActivity={openActivityComposer}
                />
              </div>
            </div>

            <div className="pb-6 pt-0 sm:pb-8">
              <Outlet
                context={{
                  activeMembers,
                  crew,
                  crewId,
                  currentUserId: user?.id,
                  currentUserRole,
                  isAuthenticated: !!user,
                  isMember,
                  isOwnerOrAdmin,
                  onMembersUpdate: fetchCrew,
                  openAuthGate,
                }}
              />
            </div>
          </Tabs>
        </section>
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

      <CrewHubQuickActions
        dismissKey={activeTab}
        canWritePost={isMember}
        canCreateActivity={isOwnerOrAdmin}
        onWritePost={openBoardComposer}
        onCreateActivity={openActivityComposer}
      />
    </div>
  );
}
