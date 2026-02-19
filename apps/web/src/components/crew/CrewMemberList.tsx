import { toast } from "sonner";
import { useState } from "react";
import { Crown, Shield, UserX, ChevronUp, ChevronDown } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { TimeAgo } from "@/components/common/TimeAgo";

interface Member {
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

interface CrewMemberListProps {
  crewId: string;
  members: Member[];
  currentUserId?: string;
  currentUserRole?: "OWNER" | "ADMIN" | "MEMBER" | null;
  onUpdate: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: "소유자",
  ADMIN: "관리자",
  MEMBER: "멤버",
};

export default function CrewMemberList({
  crewId,
  members,
  currentUserId,
  currentUserRole,
  onUpdate,
}: CrewMemberListProps) {
  const [kickTarget, setKickTarget] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sortedMembers = [...members].sort((a, b) => {
    const order = { OWNER: 0, ADMIN: 1, MEMBER: 2 };
    return (order[a.role] ?? 3) - (order[b.role] ?? 3);
  });

  const canManage = currentUserRole === "OWNER" || currentUserRole === "ADMIN";
  const isOwner = currentUserRole === "OWNER";

  const handleKick = async (reason?: string) => {
    if (!kickTarget) return;
    setIsLoading(true);
    try {
      await api.fetch(`/crews/${crewId}/members/${kickTarget.userId}`, {
        method: "DELETE",
        body: JSON.stringify({ reason }),
      });
      setKickTarget(null);
      onUpdate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "추방에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromote = async (userId: string) => {
    setIsLoading(true);
    try {
      await api.fetch(`/crews/${crewId}/members/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: "ADMIN" }),
      });
      onUpdate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "승격에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemote = async (userId: string) => {
    setIsLoading(true);
    try {
      await api.fetch(`/crews/${crewId}/members/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: "MEMBER" }),
      });
      onUpdate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "강등에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (members.length === 0) {
    return <EmptyState title="멤버가 없습니다" />;
  }

  return (
    <>
      <div className="space-y-2">
        {sortedMembers.map((member) => {
          const isSelf = member.userId === currentUserId;
          const canKickThis = canManage && !isSelf && member.role !== "OWNER";
          const canPromoteThis = isOwner && !isSelf && member.role === "MEMBER";
          const canDemoteThis = isOwner && !isSelf && member.role === "ADMIN";

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar user={member.user} size="default" linkToProfile />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {member.user.name}
                    </span>
                    {member.role === "OWNER" && (
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    {member.role === "ADMIN" && (
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {ROLE_LABELS[member.role]}
                    </Badge>
                    <TimeAgo date={member.joinedAt} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              {(canKickThis || canPromoteThis || canDemoteThis) && (
                <div className="flex items-center gap-1.5">
                  {canPromoteThis && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePromote(member.userId)}
                      disabled={isLoading}
                      title="관리자로 승격"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                  )}
                  {canDemoteThis && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDemote(member.userId)}
                      disabled={isLoading}
                      title="멤버로 강등"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  )}
                  {canKickThis && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setKickTarget(member)}
                      disabled={isLoading}
                      title="추방"
                    >
                      <UserX className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Kick Confirmation Dialog */}
      <ConfirmDialog
        open={!!kickTarget}
        onOpenChange={(open) => !open && setKickTarget(null)}
        onConfirm={() => handleKick()}
        title="멤버 추방"
        description={`${kickTarget?.user.name}님을 크루에서 추방하시겠습니까?`}
        confirmLabel="추방"
        variant="destructive"
        loading={isLoading}
      />
    </>
  );
}
