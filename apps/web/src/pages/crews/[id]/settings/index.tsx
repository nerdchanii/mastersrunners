import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { UserAvatar } from "@/components/common/UserAvatar";
import { TimeAgo } from "@/components/common/TimeAgo";
import CrewForm from "@/components/crew/CrewForm";
import CrewMemberList from "@/components/crew/CrewMemberList";
import PendingMemberList from "@/components/crew/PendingMemberList";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");

  const fetchCrew = useCallback(async () => {
    if (!crewId || crewId === "_") return;
    try {
      setIsLoading(true);
      const data = await api.fetch<CrewDetail>(`/crews/${crewId}`);
      setCrew(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "크루를 불러올 수 없습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, [crewId]);

  const fetchBans = useCallback(async () => {
    if (!crewId || crewId === "_") return;
    try {
      const data = await api.fetch<BannedUser[]>(`/crews/${crewId}/bans`);
      setBans(Array.isArray(data) ? data : []);
    } catch {
      // Bans may fail if user isn't authorized; ignore silently
    }
  }, [crewId]);

  useEffect(() => {
    fetchCrew();
  }, [fetchCrew]);

  useEffect(() => {
    if (activeTab === "bans") {
      fetchBans();
    }
  }, [activeTab, fetchBans]);

  // Access control
  const currentMember = crew?.members.find((m) => m.userId === user?.id);
  const currentUserRole = currentMember?.role ?? null;
  const isOwner = currentUserRole === "OWNER";
  const isOwnerOrAdmin =
    currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  const handleEditSubmit = async (data: {
    name: string;
    description?: string;
    isPublic: boolean;
    maxMembers?: number;
  }) => {
    setIsSubmitting(true);
    try {
      await api.fetch(`/crews/${crewId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      await fetchCrew();
      alert("크루 정보가 수정되었습니다.");
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
      await api.fetch(`/crews/${crewId}`, { method: "DELETE" });
      navigate("/crews");
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnban = async (userId: string) => {
    setIsSubmitting(true);
    try {
      await api.fetch(`/crews/${crewId}/bans/${userId}`, {
        method: "DELETE",
      });
      await fetchBans();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "차단 해제에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
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
            <p className="text-muted-foreground mb-4">
              {error || "크루를 찾을 수 없습니다."}
            </p>
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

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      <PageHeader
        title="크루 설정"
        description={crew.name}
        actions={
          <Button variant="outline" onClick={() => navigate(`/crews/${crewId}`)}>
            돌아가기
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">기본 정보</TabsTrigger>
          <TabsTrigger value="members">멤버 관리</TabsTrigger>
          <TabsTrigger value="pending">대기 멤버</TabsTrigger>
          <TabsTrigger value="bans">차단 목록</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-6 space-y-6">
          <Card>
            <CardContent className="p-6">
              <CrewForm
                initialValues={{
                  name: crew.name,
                  description: crew.description,
                  isPublic: crew.isPublic,
                  maxMembers: crew.maxMembers,
                }}
                onSubmit={handleEditSubmit}
                onCancel={() => navigate(`/crews/${crewId}`)}
                submitLabel="수정하기"
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>

          {isOwner && (
            <Card className="border-destructive">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <CardTitle className="text-destructive">위험 구역</CardTitle>
                </div>
                <CardDescription>
                  크루를 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isSubmitting}
                >
                  크루 삭제
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>멤버 관리 ({activeMembers.length}명)</CardTitle>
            </CardHeader>
            <CardContent>
              <CrewMemberList
                crewId={crewId}
                members={activeMembers}
                currentUserId={user?.id}
                currentUserRole={currentUserRole}
                onUpdate={fetchCrew}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>대기 멤버</CardTitle>
              <CardDescription>
                가입 요청 승인이 필요한 멤버 목록입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PendingMemberList crewId={crewId} onUpdate={fetchCrew} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bans" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>차단 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {bans.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  차단된 사용자가 없습니다.
                </p>
              ) : (
                <div className="space-y-2">
                  {bans.map((ban) => (
                    <div
                      key={ban.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar user={ban.user} size="default" linkToProfile />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{ban.user.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <TimeAgo date={ban.createdAt} />
                            {ban.reason && (
                              <>
                                <span>•</span>
                                <span className="truncate">사유: {ban.reason}</span>
                              </>
                            )}
                          </div>
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
        </TabsContent>
      </Tabs>

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
