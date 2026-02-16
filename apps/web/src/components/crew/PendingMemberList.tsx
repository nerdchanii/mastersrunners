import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { UserAvatar } from "@/components/common/UserAvatar";
import { TimeAgo } from "@/components/common/TimeAgo";

interface PendingMember {
  id: string;
  userId: string;
  status: "PENDING";
  joinedAt: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface PendingMemberListProps {
  crewId: string;
  onUpdate: () => void;
}

export default function PendingMemberList({ crewId, onUpdate }: PendingMemberListProps) {
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPendingMembers = async () => {
    setIsLoading(true);
    try {
      const allMembers = await api.fetch<PendingMember[]>(`/crews/${crewId}/members`);
      const pending = allMembers.filter((m) => m.status === "PENDING");
      setPendingMembers(pending);
    } catch (err) {
      console.error("Failed to load pending members:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingMembers();
  }, [crewId]);

  const handleApprove = async (memberId: string, userId: string) => {
    setProcessingId(memberId);
    try {
      await api.fetch(`/crews/${crewId}/members/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "ACTIVE" }),
      });
      await fetchPendingMembers();
      onUpdate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "승인에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (memberId: string, userId: string) => {
    setProcessingId(memberId);
    try {
      await api.fetch(`/crews/${crewId}/members/${userId}`, {
        method: "DELETE",
      });
      await fetchPendingMembers();
      onUpdate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "거절에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (pendingMembers.length === 0) {
    return <EmptyState title="대기 중인 멤버가 없습니다" />;
  }

  return (
    <div className="space-y-2">
      {pendingMembers.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-3 rounded-lg border"
        >
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar user={member.user} size="default" linkToProfile />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{member.user.name}</p>
              <TimeAgo date={member.joinedAt} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => handleApprove(member.id, member.userId)}
              disabled={processingId === member.id}
            >
              <Check className="w-4 h-4 mr-1" />
              승인
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleReject(member.id, member.userId)}
              disabled={processingId === member.id}
            >
              <X className="w-4 h-4 mr-1" />
              거절
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
