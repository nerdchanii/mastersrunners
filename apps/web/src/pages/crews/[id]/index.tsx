import { LogOut, MoreHorizontal, Settings, Share2, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { AuthGateDialog } from "@/components/common/AuthGateDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import CrewActivityList from "@/components/crew/CrewActivityList";
import CrewAttendanceStats from "@/components/crew/CrewAttendanceStats";
import CrewBoardList from "@/components/crew/CrewBoardList";
import CrewHubQuickActions, { CrewHubInlineActions } from "@/components/crew/CrewHubQuickActions";
import CrewIdentityHero from "@/components/crew/CrewIdentityHero";
import CrewMemberList from "@/components/crew/CrewMemberList";
import CrewTagManager from "@/components/crew/CrewTagManager";
import PendingMemberList from "@/components/crew/PendingMemberList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
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
  const defaultTab = isMember ? "announcement" : "activities";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [boardComposerNonce, setBoardComposerNonce] = useState(0);
  const [activityComposerNonce, setActivityComposerNonce] = useState(0);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
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
    if (activeTab === "announcement" && isOwnerOrAdmin) {
      setBoardComposerNonce((value) => value + 1);
      return;
    }
    setActiveTab("board");
    setBoardComposerNonce((value) => value + 1);
  };

  const openActivityComposer = () => {
    setActiveTab("activities");
    setActivityComposerNonce((value) => value + 1);
  };

  const handleBoardComposerHandled = () => {
    setBoardComposerNonce(0);
  };

  const handleActivityComposerHandled = () => {
    setActivityComposerNonce(0);
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <TabsList
                  variant="line"
                  className="h-12 min-w-0 flex-1 justify-start gap-0 rounded-none border-0 px-0"
                >
                  {isMember && (
                    <TabsTrigger
                      value="announcement"
                      className="h-full flex-none rounded-none px-2 text-base font-semibold text-foreground/55 data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none after:bottom-0 after:h-[3px] after:rounded-full after:bg-foreground"
                    >
                      공지
                    </TabsTrigger>
                  )}
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
                    <TabsTrigger
                      value="manage"
                      className="h-full flex-none rounded-none px-2 text-base font-semibold text-foreground/55 data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none after:bottom-0 after:h-[3px] after:rounded-full after:bg-foreground"
                    >
                      관리
                    </TabsTrigger>
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
              {isMember && (
                <TabsContent
                  value="announcement"
                  className="mt-0 px-4 focus-visible:outline-none lg:px-0"
                >
                  <CrewBoardList
                    canOpenBoardPosts={isMember}
                    crewId={crewId}
                    isAuthenticated={!!user}
                    isMember={isMember}
                    isAdmin={isOwnerOrAdmin}
                    isActive={activeTab === "announcement"}
                    defaultSelectedBoardType="ANNOUNCEMENT"
                    allowedBoardTypes={["ANNOUNCEMENT"]}
                    composerNonce={boardComposerNonce}
                    onComposerHandled={handleBoardComposerHandled}
                    hideBoardHeader
                    showInlineCreateAction={false}
                    onRequireAuth={() => {
                      setAuthDialogTitle("공지 열기");
                      setShowAuthDialog(true);
                    }}
                  />
                </TabsContent>
              )}

              <TabsContent
                value="activities"
                className="mt-0 px-4 focus-visible:outline-none lg:px-0"
              >
                <CrewActivityList
                  canOpenActivityDetails={isMember}
                  crewId={crewId}
                  isAdmin={isOwnerOrAdmin}
                  isMember={isMember}
                  isAuthenticated={!!user}
                  isActive={activeTab === "activities"}
                  composerNonce={activityComposerNonce}
                  onComposerHandled={handleActivityComposerHandled}
                  showInlineCreateAction={false}
                  onRequireAuth={() => {
                    setAuthDialogTitle("활동 자세히 보기");
                    setShowAuthDialog(true);
                  }}
                />
              </TabsContent>

              <TabsContent value="board" className="mt-0 px-4 focus-visible:outline-none lg:px-0">
                <CrewBoardList
                  canOpenBoardPosts={isMember}
                  crewId={crewId}
                  isAuthenticated={!!user}
                  isMember={isMember}
                  isAdmin={isOwnerOrAdmin}
                  isActive={activeTab === "board"}
                  defaultSelectedBoardType="FREE"
                  allowedBoardTypes={["GENERAL", "FREE"]}
                  composerNonce={boardComposerNonce}
                  onComposerHandled={handleBoardComposerHandled}
                  hideBoardHeader
                  showInlineCreateAction={false}
                  onRequireAuth={() => {
                    setAuthDialogTitle("게시판 열기");
                    setShowAuthDialog(true);
                  }}
                />
              </TabsContent>

              {isOwnerOrAdmin && (
                <TabsContent
                  value="manage"
                  className="mt-0 px-4 focus-visible:outline-none lg:px-0"
                >
                  <div className="space-y-10">
                    <section className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">
                          운영 현황
                        </h2>
                      </div>
                      <CrewAttendanceStats crewId={crewId} crewName={crew.name} />
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        태그 관리
                      </h3>
                      <CrewTagManager
                        crewId={crewId}
                        isAdmin={isOwnerOrAdmin}
                        members={activeMembers}
                      />
                    </section>

                    <section className="space-y-4">
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
                </TabsContent>
              )}
              <TabsContent value="members" className="mt-0 px-4 focus-visible:outline-none lg:px-0">
                <div className="border-t border-border/40 pt-4">
                  <CrewMemberList
                    crewId={crewId}
                    members={activeMembers}
                    currentUserId={user?.id}
                    currentUserRole={currentUserRole}
                    onUpdate={fetchCrew}
                  />
                </div>
              </TabsContent>
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
