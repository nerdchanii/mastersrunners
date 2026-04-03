import { LogOut, Settings, Share2, UserPlus } from "lucide-react";
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
import GroupChat from "@/components/crew/GroupChat";
import PendingMemberList from "@/components/crew/PendingMemberList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCrewChat } from "@/hooks/useGroupChat";
import { useAuth } from "@/lib/auth-context";
import { shareLink } from "@/lib/share-link";

import { fetchCrewDetail, joinCrew, leaveCrew } from "./crew-detail-api";
import { fetchCrewInviteLink, resolveCrewInviteUrl } from "./crew-invite-api";

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
  const [activeTab, setActiveTab] = useState("activities");
  const currentMember = crew?.members?.find((member) => member.userId === user?.id);
  const isMember = !!currentMember && currentMember.status === "ACTIVE";
  const { data: chatData, isLoading: chatLoading } = useCrewChat(crewId, isMember);

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
      const invite = await fetchCrewInviteLink(crewId);
      const result = await shareLink({
        title: `${crew.name} 크루 초대`,
        text: `${crew.name} 크루에 참여해보세요.`,
        url: resolveCrewInviteUrl(invite.path),
      });

      if (result === "shared") {
        toast.success("크루 초대 링크 공유 창을 열었습니다.");
      } else if (result === "copied") {
        toast.success("크루 초대 링크를 복사했습니다.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "초대 링크를 공유하지 못했습니다.");
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
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="w-16 h-16 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !crew) {
    return (
      <div className="container max-w-2xl mx-auto py-6">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-destructive mb-2">오류</h2>
            <p className="text-muted-foreground mb-4">{error || "크루를 찾을 수 없습니다."}</p>
            <Button variant="outline" onClick={() => navigate("/crews")}>
              크루 목록으로
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeMembers = crew.members.filter((m) => m.status === "ACTIVE");
  const heroProfileImage = crew.profileImageUrl ?? crew.imageUrl ?? null;
  const heroCoverImage = crew.coverImageUrl ?? null;

  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-6">
      {isInviteEntry && !isMember && (
        <section className="rounded-3xl border border-primary/20 bg-primary/5 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">운영진이 보낸 초대 링크예요.</p>
              <p className="text-sm text-muted-foreground">
                공개 크루는 바로 가입되고, 비공개 크루는 가입 요청이 대기 멤버로 전달됩니다.
              </p>
            </div>
            {currentMember?.status === "PENDING" ? (
              <Badge variant="secondary" className="w-fit">
                가입 요청 대기 중
              </Badge>
            ) : (
              canJoinCrew && (
                <Button onClick={handleJoin} disabled={isJoining}>
                  <UserPlus className="mr-2 size-4" />
                  {!user ? "로그인하고 가입하기" : isJoining ? "가입 중..." : "이 링크로 가입하기"}
                </Button>
              )
            )}
          </div>
        </section>
      )}

      <CrewIdentityHero
        eyebrow="크루 허브"
        name={crew.name}
        description={crew.description}
        creatorName={crew.creator.name}
        createdAt={crew.createdAt}
        memberCount={crew._count.members}
        maxMembers={crew.maxMembers}
        isPublic={crew.isPublic}
        profileImageUrl={heroProfileImage}
        coverImageUrl={heroCoverImage}
        actions={
          <>
            {canJoinCrew && (
              <Button onClick={handleJoin} disabled={isJoining}>
                <UserPlus className="size-4 mr-2" />
                {!user ? "로그인하고 크루 가입" : isJoining ? "가입 중..." : "크루 가입"}
              </Button>
            )}

            {isMember && currentUserRole !== "OWNER" && (
              <Button variant="destructive" onClick={() => setShowLeaveDialog(true)}>
                <LogOut className="size-4 mr-2" />
                크루 탈퇴
              </Button>
            )}

            {isOwnerOrAdmin && (
              <>
                <Button variant="outline" onClick={handleShareInvite} disabled={isSharingInvite}>
                  <Share2 className="mr-2 size-4" />
                  {isSharingInvite ? "공유 준비 중..." : "초대 링크"}
                </Button>
                <Button variant="outline" onClick={() => navigate(`/crews/${crewId}/settings`)}>
                  <Settings className="size-4 mr-2" />
                  설정
                </Button>
              </>
            )}
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-border/60">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b border-border/60 px-4 pt-4 sm:px-6">
                  <TabsList className="grid h-11 w-full grid-cols-3 bg-muted/60">
                    <TabsTrigger value="activities">활동</TabsTrigger>
                    <TabsTrigger value="chat" disabled={!isMember}>
                      채팅
                    </TabsTrigger>
                    <TabsTrigger value="board">게시판</TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-4 sm:p-6">
                  <TabsContent value="activities" className="mt-0">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <h2 className="text-lg font-semibold">활동</h2>
                        <p className="text-sm text-muted-foreground">
                          일정과 참석 현황을 가장 먼저 확인하는 영역입니다.
                        </p>
                      </div>
                      <CrewActivityList
                        crewId={crewId}
                        isAdmin={isOwnerOrAdmin}
                        isMember={isMember}
                        isAuthenticated={!!user}
                        onRequireAuth={() => setShowAuthDialog(true)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="chat" className="mt-0">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <h2 className="text-lg font-semibold">채팅</h2>
                        <p className="text-sm text-muted-foreground">
                          멤버 전용 대화를 간단하게 확인하고 이어갈 수 있습니다.
                        </p>
                      </div>
                      {isMember ? (
                        <GroupChat
                          data={chatData}
                          isLoading={chatLoading}
                          crewId={crewId}
                          title={`${crew.name} 크루 채팅`}
                          subtitle="멤버 전용 대화 공간"
                          emptyMessage={`${crew.name} 크루에 첫 메시지를 남겨보세요.`}
                          missingConversationMessage="크루 채팅방이 아직 준비되지 않았습니다."
                          composerPlaceholder={`${crew.name} 크루에 메시지 보내기`}
                        />
                      ) : (
                        <Card>
                          <CardContent className="py-8 text-center text-sm text-muted-foreground">
                            멤버만 채팅에 참여할 수 있습니다.
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="board" className="mt-0">
                    <div className="space-y-6">
                      <section className="space-y-3">
                        <div className="space-y-1">
                          <h2 className="text-lg font-semibold">게시판</h2>
                          <p className="text-sm text-muted-foreground">
                            공지와 자유글은 게시판에서 더 깊게 확인할 수 있습니다.
                          </p>
                        </div>
                        <CrewBoardList
                          crewId={crewId}
                          isMember={isMember}
                          isAdmin={isOwnerOrAdmin}
                        />
                      </section>

                      <section className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
                        <h2 className="text-base font-semibold">크루 소식</h2>
                        <CrewPostList crewId={crewId} isOwner={currentUserRole === "OWNER"} />
                      </section>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="border-border/60">
            <CardContent className="p-5">
              <div className="space-y-1.5">
                <h2 className="text-base font-semibold">멤버</h2>
                <p className="text-sm text-muted-foreground">
                  현재 함께 달리는 사람들을 빠르게 훑어볼 수 있습니다.
                </p>
              </div>
              <div className="mt-4">
                <CrewMemberList
                  crewId={crewId}
                  members={activeMembers}
                  currentUserId={user?.id}
                  currentUserRole={currentUserRole}
                  onUpdate={fetchCrew}
                />
              </div>
            </CardContent>
          </Card>

          {isOwnerOrAdmin && (
            <Card className="border-border/60">
              <CardContent className="p-5">
                <div className="space-y-1.5">
                  <h2 className="text-base font-semibold">운영 현황</h2>
                  <p className="text-sm text-muted-foreground">
                    출석률과 최근 활동 흐름을 한 번에 확인합니다.
                  </p>
                </div>
                <div className="mt-4">
                  <CrewAttendanceStats crewId={crewId} />
                </div>
              </CardContent>
            </Card>
          )}

          {isOwnerOrAdmin && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-5">
                <div className="space-y-1.5">
                  <h2 className="text-base font-semibold text-foreground">운영 도구</h2>
                  <p className="text-sm text-muted-foreground">
                    태그와 가입 대기는 멤버 화면과 구분된 별도 영역에서 다룹니다.
                  </p>
                </div>
                <div className="mt-5 space-y-6">
                  <CrewTagManager
                    crewId={crewId}
                    isAdmin={isOwnerOrAdmin}
                    members={activeMembers}
                  />
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    <div className="mb-3 space-y-1">
                      <h3 className="text-sm font-semibold">대기 멤버</h3>
                      <p className="text-xs text-muted-foreground">
                        가입 요청은 운영자가 따로 확인하고 승인합니다.
                      </p>
                    </div>
                    <PendingMemberList crewId={crewId} onUpdate={fetchCrew} />
                  </div>
                </div>
              </CardContent>
            </Card>
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
        title="크루 참여"
      />
    </div>
  );
}
