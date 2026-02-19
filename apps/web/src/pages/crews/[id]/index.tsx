import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Lock, Settings, UserPlus, LogOut } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TimeAgo } from "@/components/common/TimeAgo";
import CrewMemberList from "@/components/crew/CrewMemberList";
import CrewActivityList from "@/components/crew/CrewActivityList";
import CrewTagManager from "@/components/crew/CrewTagManager";
import PendingMemberList from "@/components/crew/PendingMemberList";
import CrewAttendanceStats from "@/components/crew/CrewAttendanceStats";
import GroupChat from "@/components/crew/GroupChat";
import { useCrewChat } from "@/hooks/useGroupChat";

interface CrewMember {
  id: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  status: "ACTIVE" | "PENDING";
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
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("members");
  const { data: chatData, isLoading: chatLoading } = useCrewChat(crewId);

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

  useEffect(() => {
    fetchCrew();
  }, [fetchCrew]);

  const currentMember = crew?.members?.find((m) => m.userId === user?.id);
  const isMember = !!currentMember && currentMember.status === "ACTIVE";
  const currentUserRole = currentMember?.role ?? null;
  const isOwnerOrAdmin =
    currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  const handleJoin = async () => {
    if (!crewId) return;
    setIsJoining(true);
    try {
      await api.fetch(`/crews/${crewId}/join`, { method: "POST" });
      await fetchCrew();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "가입에 실패했습니다.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!crewId) return;
    try {
      await api.fetch(`/crews/${crewId}/leave`, { method: "DELETE" });
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
            <p className="text-muted-foreground mb-4">
              {error || "크루를 찾을 수 없습니다."}
            </p>
            <Button variant="outline" onClick={() => navigate("/crews")}>
              크루 목록으로
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeMembers = crew.members.filter((m) => m.status === "ACTIVE");

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      {/* Crew Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              {crew.imageUrl ? (
                <img
                  src={crew.imageUrl}
                  alt={crew.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <Users className="w-8 h-8 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold truncate">{crew.name}</h1>
                {!crew.isPublic && <Lock className="w-5 h-5 text-muted-foreground" />}
              </div>
              <p className="text-sm text-muted-foreground">
                만든이: {crew.creator.name}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>
                    {crew._count.members}명
                    {crew.maxMembers && ` / ${crew.maxMembers}명`}
                  </span>
                </div>
                <Badge variant={crew.isPublic ? "default" : "secondary"}>
                  {crew.isPublic ? "공개" : "비공개"}
                </Badge>
              </div>
            </div>
          </div>

          {crew.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4">
              {crew.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <TimeAgo date={crew.createdAt} />

            <div className="flex items-center gap-2">
              {user && !isMember && (
                <Button onClick={handleJoin} disabled={isJoining}>
                  <UserPlus className="size-4 mr-2" />
                  {isJoining ? "가입 중..." : "크루 가입"}
                </Button>
              )}

              {isMember && currentUserRole !== "OWNER" && (
                <Button
                  variant="destructive"
                  onClick={() => setShowLeaveDialog(true)}
                >
                  <LogOut className="size-4 mr-2" />
                  크루 탈퇴
                </Button>
              )}

              {isOwnerOrAdmin && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/crews/${crewId}/settings`)}
                >
                  <Settings className="size-4 mr-2" />
                  설정
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="members">멤버</TabsTrigger>
          <TabsTrigger value="activities">활동</TabsTrigger>
          <TabsTrigger value="tags">태그</TabsTrigger>
          <TabsTrigger value="stats">통계</TabsTrigger>
          {isMember && <TabsTrigger value="chat">채팅</TabsTrigger>}
          {isOwnerOrAdmin && <TabsTrigger value="pending">대기 멤버</TabsTrigger>}
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                멤버 ({activeMembers.length}명)
              </h2>
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

        <TabsContent value="activities" className="mt-6">
          <CrewActivityList
            crewId={crewId}
            isAdmin={isOwnerOrAdmin}
            isMember={isMember}
          />
        </TabsContent>

        <TabsContent value="tags" className="mt-6">
          <CrewTagManager
            crewId={crewId}
            isAdmin={isOwnerOrAdmin}
            members={activeMembers}
          />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <CrewAttendanceStats crewId={crewId} />
        </TabsContent>

        {isMember && (
          <TabsContent value="chat" className="mt-6">
            <GroupChat data={chatData} isLoading={chatLoading} crewId={crewId} />
          </TabsContent>
        )}

        {isOwnerOrAdmin && (
          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">대기 멤버</h2>
                <PendingMemberList crewId={crewId} onUpdate={fetchCrew} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

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
    </div>
  );
}
