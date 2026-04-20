import { ArrowLeft, Lock, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import GroupChat from "@/components/crew/GroupChat";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCrewActivity, useRsvp } from "@/hooks/useCrewActivities";
import { useCrew } from "@/hooks/useCrews";
import { useActivityChat } from "@/hooks/useGroupChat";
import { useAuth } from "@/lib/auth-context";

export default function ActivityChatPage() {
  const { id: crewId, activityId } = useParams<{ id: string; activityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  const { data: chatData, isLoading: chatLoading } = useActivityChat(
    crewId ?? "",
    activityId ?? "",
  );
  const { data: activity } = useCrewActivity(crewId ?? "", activityId ?? "");
  const { data: crew } = useCrew(crewId ?? "");
  const rsvpMutation = useRsvp();

  const currentMember = crew?.members?.find((member) => member.user.id === user?.id);
  const isCrewOperator = currentMember?.role === "OWNER" || currentMember?.role === "ADMIN";
  const isHost = activity?.createdBy === user?.id;
  const canManageAttendance = Boolean(
    isCrewOperator || (activity?.activityType === "POP_UP" && isHost),
  );
  const myStatus = activity?.attendances.find(
    (attendance) => attendance.userId === user?.id,
  )?.status;
  const isCancelled = activity?.status === "CANCELLED";
  const canAccessChat =
    !isCancelled && (myStatus === "RSVP" || myStatus === "CHECKED_IN" || canManageAttendance);
  const activityTitle = activity?.title ?? "활동";

  const handleJoinAndEnter = () => {
    if (!crewId || !activityId || isCancelled) {
      return;
    }

    rsvpMutation.mutate(
      { crewId, activityId },
      {
        onSuccess: () => {
          setIsJoinDialogOpen(false);
          toast.success("활동에 참여했습니다.");
          navigate(`/crews/${crewId}/activities/${activityId}/chat`);
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "활동 참여에 실패했습니다.");
        },
      },
    );
  };

  const messages = isCancelled
    ? [
        ...(chatData?.messages ?? []),
        {
          id: "activity-cancelled-system-message",
          content: "--- 취소되었습니다 ---",
          senderId: "system",
          sender: {
            id: "system",
            name: "시스템",
            profileImage: null,
          },
          createdAt: activity.createdAt,
          deletedAt: null,
        },
      ]
    : (chatData?.messages ?? []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/crews/${crewId}/activities/${activityId}`)}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-xl font-bold">{activityTitle} 활동 채팅</h1>
      </div>

      {!canAccessChat ? (
        <div className="rounded-3xl border border-border/70 bg-card p-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted/40">
            <Lock className="size-5 text-muted-foreground" />
          </div>
          {isCancelled ? (
            <p className="mt-4 text-base font-medium">취소된 활동의 채팅방은 이용할 수 없습니다.</p>
          ) : (
            <p className="mt-4 text-base font-medium">
              활동 채팅은 참석 신청 후 입장할 수 있습니다.
            </p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {isCancelled
              ? "취소된 활동은 채팅이 잠겨 있습니다."
              : "참석 신청을 마치면 바로 이 활동 채팅방에 입장합니다."}
          </p>
          {!isCancelled ? (
            <Button className="mt-4 gap-2" onClick={() => setIsJoinDialogOpen(true)}>
              <MessageCircle className="size-4" />
              활동 참여하고 채팅방 참여하기
            </Button>
          ) : null}
        </div>
      ) : (
        <GroupChat
          data={chatData ? { ...chatData, messages } : chatData}
          isLoading={chatLoading}
          crewId={crewId ?? ""}
          activityId={activityId}
          title={`${activityTitle} 활동 채팅`}
          subtitle="참여한 멤버와 운영진이 모이는 공간"
          emptyMessage={`${activityTitle} 활동에 첫 메시지를 남겨보세요.`}
          missingConversationMessage="이 활동의 채팅방이 아직 준비되지 않았습니다."
          composerPlaceholder={`${activityTitle} 활동에 메시지 보내기`}
        />
      )}

      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>활동 참여하고 채팅방 참여하기</DialogTitle>
            <DialogDescription>활동 참여 후 바로 채팅방에 입장합니다.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>
              닫기
            </Button>
            <Button onClick={handleJoinAndEnter} disabled={rsvpMutation.isPending}>
              활동 참여하고 채팅방 참여하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
