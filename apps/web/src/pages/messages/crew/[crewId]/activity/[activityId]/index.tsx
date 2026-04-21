import { ArrowLeft, Lock, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { toast } from "sonner";

import { ChatRoomHeader } from "@/components/chat/ChatRoomHeader";
import { ChatViewportSkeleton } from "@/components/chat/ChatViewportSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import GroupChat from "@/components/crew/GroupChat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatBackToMessages } from "@/hooks/useChatBackToMessages";
import { useCrewActivity, useRsvp } from "@/hooks/useCrewActivities";
import { useCrew } from "@/hooks/useCrews";
import { useActivityChat } from "@/hooks/useGroupChat";
import { useAuth } from "@/lib/auth-context";
import { getConversationRoomMeta } from "@/lib/message-room";
import type { SelectedConversationSummary } from "@/pages/messages/shell";

export default function ActivityMessagePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedConversation } = useOutletContext<{
    selectedConversation: SelectedConversationSummary | null;
  }>();
  const { crewId, activityId } = useParams<{ crewId: string; activityId: string }>();
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const chat = useActivityChat(crewId ?? "", activityId ?? "");
  const { data: activity } = useCrewActivity(crewId ?? "", activityId ?? "");
  const { data: crew } = useCrew(crewId ?? "");
  const rsvpMutation = useRsvp();
  const handleBack = useChatBackToMessages();

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

  if (!crewId || !activityId) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <EmptyState
          icon={MessageCircle}
          title="활동을 찾을 수 없습니다."
          actionLabel="메시지 목록으로"
          onAction={() => navigate("/messages")}
        />
      </div>
    );
  }

  const conversation = chat.conversation ?? selectedConversation?.conversation ?? null;
  const selectedSummary =
    conversation?.id === selectedConversation?.conversation.id ? selectedConversation : null;
  const roomMeta = selectedSummary
    ? selectedSummary.meta
    : conversation
      ? getConversationRoomMeta(conversation, user?.id)
      : null;
  const title = roomMeta?.title ?? activity?.title ?? "활동 채팅";
  const secondaryTitle = roomMeta?.secondaryTitle ?? crew?.name ?? null;
  const participantCount = conversation?.participants.length ?? 0;

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
          navigate(`/messages/crew/${crewId}/activity/${activityId}`);
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "활동 참여에 실패했습니다.");
        },
      },
    );
  };

  if (chat.loading && !conversation) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-16 w-full rounded-3xl" />
        <Skeleton className="h-[540px] w-full rounded-3xl" />
      </div>
    );
  }

  if (chat.error && canAccessChat) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <EmptyState
          icon={MessageCircle}
          title={chat.error}
          actionLabel="메시지 목록으로"
          onAction={() => navigate("/messages")}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ChatRoomHeader
        backIcon={<ArrowLeft className="size-4" />}
        onBack={handleBack}
        onIdentityClick={() => navigate(`/crews/${crewId}/activities/${activityId}`)}
        avatar={
          <Avatar className="size-8 border border-border/60">
            <AvatarFallback>
              <MessageCircle className="size-3.5" />
            </AvatarFallback>
          </Avatar>
        }
        title={title}
        subtitle={secondaryTitle}
        meta={
          participantCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>{participantCount}명</span>
            </span>
          ) : null
        }
      />

      {!canAccessChat ? (
        <div className="mx-auto w-full max-w-3xl p-4">
          <div className="rounded-3xl border border-border/70 bg-card p-6 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted/40">
              <Lock className="size-5 text-muted-foreground" />
            </div>
            {isCancelled ? (
              <p className="mt-4 text-base font-medium">
                취소된 활동의 채팅방은 이용할 수 없습니다.
              </p>
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
        </div>
      ) : chat.loading ? (
        <ChatViewportSkeleton />
      ) : (
        <GroupChat
          className="flex-1 overflow-hidden"
          chat={chat}
          emptyMessage={`${title}에 첫 메시지를 남겨보세요.`}
          missingConversationMessage="이 활동의 채팅방이 아직 준비되지 않았습니다."
          composerPlaceholder={`${title}에 메시지 보내기`}
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
