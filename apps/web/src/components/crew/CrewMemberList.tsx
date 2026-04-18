import {
  ChevronDown,
  ChevronUp,
  Crown,
  MessageCircle,
  MoreHorizontal,
  Shield,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { TimeAgo } from "@/components/common/TimeAgo";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api-client";

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
  const navigate = useNavigate();
  const [kickTarget, setKickTarget] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messagingUserId, setMessagingUserId] = useState<string | null>(null);

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

  const handleStartDirectMessage = async (targetUserId: string) => {
    if (messagingUserId) return;
    setMessagingUserId(targetUserId);
    try {
      const conversation = await api.fetch<{ id: string }>("/conversations", {
        method: "POST",
        body: JSON.stringify({ participantId: targetUserId }),
      });

      if (!conversation?.id) {
        throw new Error("대화를 시작할 수 없습니다.");
      }

      navigate(`/messages/${conversation.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "DM 시작에 실패했습니다.");
    } finally {
      setMessagingUserId(null);
    }
  };

  if (members.length === 0) {
    return <EmptyState title="멤버가 없습니다" />;
  }

  return (
    <>
      <div className="divide-y divide-border/40">
        {sortedMembers.map((member) => {
          const isSelf = member.userId === currentUserId;
          const canMessageThis = !!currentUserId && !isSelf;
          const canKickThis = canManage && !isSelf && member.role !== "OWNER";
          const canPromoteThis = isOwner && !isSelf && member.role === "MEMBER";
          const canDemoteThis = isOwner && !isSelf && member.role === "ADMIN";
          const hasAdminActions = canKickThis || canPromoteThis || canDemoteThis;
          const isMessagingThis = messagingUserId === member.userId;

          return (
            <div
              key={member.id}
              className="group flex items-center justify-between gap-4 py-4 transition-colors hover:bg-muted/5 sm:px-2"
            >
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar user={member.user} size="default" linkToProfile />
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[15px] font-semibold text-foreground">
                      {member.user.name}
                    </span>
                    {isSelf && (
                      <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-bold">
                        나
                      </Badge>
                    )}
                    {member.role === "OWNER" && (
                      <Crown className="size-3.5 fill-amber-500 text-amber-500" />
                    )}
                    {member.role === "ADMIN" && (
                      <Shield className="size-3.5 fill-blue-500 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <span className="font-medium text-primary/80">{ROLE_LABELS[member.role]}</span>
                    <span className="size-1 rounded-full bg-border" />
                    <TimeAgo date={member.joinedAt} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canMessageThis && (
                  <Button
                    size="icon-sm"
                    variant="outline"
                    className="size-8 rounded-full border-primary/20 bg-primary/5 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleStartDirectMessage(member.userId)}
                    disabled={isLoading || isMessagingThis}
                    title={`${member.user.name}님께 메시지 보내기`}
                  >
                    <MessageCircle className="size-4" />
                  </Button>
                )}

                {hasAdminActions && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="size-8 rounded-full">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">멤버 관리</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {canPromoteThis && (
                        <DropdownMenuItem onClick={() => handlePromote(member.userId)}>
                          <ChevronUp className="mr-2 size-4" />
                          관리자 지정
                        </DropdownMenuItem>
                      )}
                      {canDemoteThis && (
                        <DropdownMenuItem onClick={() => handleDemote(member.userId)}>
                          <ChevronDown className="mr-2 size-4" />
                          관리자 해제
                        </DropdownMenuItem>
                      )}
                      {hasAdminActions && canKickThis && <DropdownMenuSeparator />}
                      {canKickThis && (
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setKickTarget(member)}
                        >
                          <UserX className="mr-2 size-4" />
                          내보내기
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!kickTarget}
        onOpenChange={(open) => !open && setKickTarget(null)}
        onConfirm={() => handleKick()}
        title="멤버를 내보낼까요?"
        description={`${kickTarget?.user.name}님은 다시 초대하거나 재가입 요청을 받아야 합니다.`}
        confirmLabel="내보내기"
        variant="destructive"
        loading={isLoading}
      />
    </>
  );
}
