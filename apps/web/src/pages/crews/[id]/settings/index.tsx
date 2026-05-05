import { AlertTriangle, Share2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import CrewForm from "@/components/crew/CrewForm";
import CrewIdentityHero from "@/components/crew/CrewIdentityHero";
import CrewMemberList from "@/components/crew/CrewMemberList";
import PendingMemberList from "@/components/crew/PendingMemberList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { shareLink } from "@/lib/share-link";

import { fetchCrewInviteLink, resolveCrewInviteUrl } from "../crew-invite-api";

import {
  deleteCrew,
  fetchCrewBans,
  fetchCrewSettingsDetail,
  unbanCrewUser,
  updateCrewSettings,
} from "./crew-settings-api";

interface CrewMember {
  id: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  status: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface BannedUser {
  id: string;
  userId: string;
  reason: string | null;
  createdAt: string;
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
  location?: string | null;
  region?: string | null;
  subRegion?: string | null;
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

export default function CrewSettingsClient() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const crewId = params.id as string;

  const [crew, setCrew] = useState<CrewDetail | null>(null);
  const [bans, setBans] = useState<BannedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSharingInvite, setIsSharingInvite] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchCrew = useCallback(async () => {
    if (!crewId || crewId === "_") return;
    try {
      setIsLoading(true);
      const data = await fetchCrewSettingsDetail(crewId);
      setCrew(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "크루를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [crewId]);

  const fetchBans = useCallback(async () => {
    if (!crewId || crewId === "_") return;
    try {
      const data = await fetchCrewBans(crewId);
      setBans(Array.isArray(data) ? data : []);
    } catch {
      // Bans may fail if user isn't authorized; ignore silently
    }
  }, [crewId]);

  useEffect(() => {
    fetchCrew();
  }, [fetchCrew]);

  useEffect(() => {
    fetchBans();
  }, [fetchBans]);

  // Access control
  const currentMember = crew?.members.find((m) => m.userId === user?.id);
  const currentUserRole = currentMember?.role ?? null;
  const isOwner = currentUserRole === "OWNER";
  const isOwnerOrAdmin = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  const handleEditSubmit = async (data: {
    name: string;
    description?: string;
    profileImageUrl?: string | null;
    coverImageUrl?: string | null;
    isPublic: boolean;
    maxMembers?: number;
    location?: string;
    region?: string;
    subRegion?: string;
  }) => {
    setIsSubmitting(true);
    try {
      await updateCrewSettings(crewId, data);
      await fetchCrew();
      toast.success("크루 정보가 수정되었습니다.");
    } catch (err) {
      setIsSubmitting(false);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteCrew(crewId);
      navigate("/crews");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnban = async (userId: string) => {
    setIsSubmitting(true);
    try {
      await unbanCrewUser(crewId, userId);
      await fetchBans();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "차단 해제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
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
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
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
            <Button variant="outline" onClick={() => navigate(-1)}>
              돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isOwnerOrAdmin) {
    return (
      <div className="container max-w-2xl mx-auto text-center py-12">
        <p className="text-muted-foreground">설정 페이지에 접근할 권한이 없습니다.</p>
        <Button variant="link" onClick={() => navigate(`/crews/${crewId}`)} className="mt-4">
          크루 페이지로 돌아가기
        </Button>
      </div>
    );
  }

  const activeMembers = crew.members.filter((m) => m.status === "ACTIVE");
  const heroProfileImage = crew.profileImageUrl ?? crew.imageUrl ?? null;
  const heroCoverImage = crew.coverImageUrl ?? null;

  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-6">
      <CrewIdentityHero
        eyebrow="크루 설정"
        name={crew.name}
        description="대표 정보와 운영 도구를 분리해서 정리합니다."
        creatorName={crew.creator.name}
        createdAt={crew.createdAt}
        memberCount={crew._count.members}
        maxMembers={crew.maxMembers}
        isPublic={crew.isPublic}
        profileImageUrl={heroProfileImage}
        coverImageUrl={heroCoverImage}
        chatHref={`/messages/crew/${crewId}`}
        actions={
          <>
            <Button variant="outline" onClick={handleShareInvite} disabled={isSharingInvite}>
              <Share2 className="mr-2 size-4" />
              {isSharingInvite ? "공유 준비 중..." : "초대 링크"}
            </Button>
            <Button variant="outline" onClick={() => navigate(`/crews/${crewId}`)}>
              돌아가기
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-border/60 bg-background px-5 py-5 shadow-sm sm:px-6">
            <div className="mb-5 space-y-1">
              <h2 className="text-lg font-semibold text-foreground">기본 정보</h2>
              <p className="text-sm text-muted-foreground">
                이름, 소개, 공개 범위, 지역 같은 멤버가 가장 먼저 보는 정보를 정리합니다.
              </p>
            </div>

            <CrewForm
              initialValues={{
                name: crew.name,
                description: crew.description,
                isPublic: crew.isPublic,
                maxMembers: crew.maxMembers,
                location: crew.location,
                region: crew.region,
                subRegion: crew.subRegion,
                profileImageUrl: heroProfileImage,
                coverImageUrl: heroCoverImage,
              }}
              onSubmit={handleEditSubmit}
              onCancel={() => navigate(`/crews/${crewId}`)}
              submitLabel="수정하기"
              isSubmitting={isSubmitting}
            />
          </section>

          {isOwner && (
            <section className="rounded-3xl border border-destructive/40 bg-destructive/5 px-5 py-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h3 className="text-base font-semibold text-destructive">위험 구역</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                크루를 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isSubmitting}
                className="mt-4"
              >
                크루 삭제
              </Button>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <Card className="border-border/60">
            <CardContent className="p-5">
              <div className="space-y-1.5">
                <h2 className="text-base font-semibold">멤버 관리</h2>
                <p className="text-sm text-muted-foreground">
                  멤버 목록은 운영 편집 영역과 분리해 더 빠르게 훑을 수 있습니다.
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

          <Card className="border-border/60">
            <CardContent className="p-5">
              <div className="space-y-1.5">
                <h2 className="text-base font-semibold">대기 멤버</h2>
                <p className="text-sm text-muted-foreground">
                  가입 요청은 여기서만 확인하고 승인합니다.
                </p>
              </div>
              <div className="mt-4">
                <PendingMemberList crewId={crewId} onUpdate={fetchCrew} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">차단 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {bans.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  차단된 사용자가 없습니다.
                </p>
              ) : (
                <div className="space-y-2">
                  {bans.map((ban) => (
                    <div
                      key={ban.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{ban.user.name}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{new Date(ban.createdAt).toLocaleDateString("ko-KR")}</span>
                          {ban.reason && (
                            <>
                              <span>•</span>
                              <span className="truncate">사유: {ban.reason}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnban(ban.userId)}
                        disabled={isSubmitting}
                      >
                        차단 해제
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="크루 삭제"
        description="정말 크루를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        variant="destructive"
        loading={isSubmitting}
      />
    </div>
  );
}
