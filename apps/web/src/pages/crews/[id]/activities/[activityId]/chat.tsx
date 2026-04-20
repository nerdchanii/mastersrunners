import { ArrowLeft, CalendarDays, UserMinus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { ChatHeaderMenu } from "@/components/chat/ChatHeaderMenu";
import { ChatRoomHeader } from "@/components/chat/ChatRoomHeader";
import { ChatSplitLayout } from "@/components/chat/ChatSplitLayout";
import { MessagesSidebar } from "@/components/chat/MessagesSidebar";
import GroupChat from "@/components/crew/GroupChat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useChatBackToMessages } from "@/hooks/useChatBackToMessages";
import { useCancelRsvp, useCrewActivity } from "@/hooks/useCrewActivities";
import { useCrew } from "@/hooks/useCrews";
import { useActivityChat } from "@/hooks/useGroupChat";
import { useAuth } from "@/lib/auth-context";

export default function ActivityChatPage() {
  const { id: crewId, activityId } = useParams<{ id: string; activityId: string }>();
  const navigate = useNavigate();
  const handleBack = useChatBackToMessages();
  const { user } = useAuth();

  const chat = useActivityChat(crewId ?? "", activityId ?? "");
  const { data: activity } = useCrewActivity(crewId ?? "", activityId ?? "");
  const cancelRsvp = useCancelRsvp();
  const { data: crew } = useCrew(crewId ?? "");
  const currentMember = crew?.members?.find((member) => member.user.id === user?.id);
  const isAdmin = currentMember?.role === "OWNER" || currentMember?.role === "ADMIN";
  const isHost = activity?.createdBy === user?.id;
  const canManage = Boolean(isAdmin || (activity?.activityType === "POP_UP" && isHost));
  const myStatus = activity?.attendances.find(
    (attendance) => attendance.userId === user?.id,
  )?.status;
  const canAccessChat = myStatus === "RSVP" || myStatus === "CHECKED_IN" || canManage;
  const activityTitle = activity?.title ?? "활동";
  const crewName = crew?.name ?? chat.conversation?.activity?.crew?.name ?? "크루";

  const handleCancelAttendance = async () => {
    if (!crewId || !activityId || cancelRsvp.isPending) {
      return;
    }

    const confirmed = window.confirm("이 활동 참석을 취소하시겠습니까?");
    if (!confirmed) {
      return;
    }

    try {
      await cancelRsvp.mutateAsync({ crewId, activityId });
      navigate(`/crews/${crewId}/activities/${activityId}`, { replace: true });
    } catch (cancelError) {
      console.error("Failed to cancel attendance:", cancelError);
    }
  };

  return (
    <ChatSplitLayout sidebar={<MessagesSidebar activeConversationId={chat.conversation?.id} />}>
      <div className="flex h-full flex-col overflow-hidden">
        <ChatRoomHeader
          backIcon={<ArrowLeft className="size-4" />}
          onBack={handleBack}
          onIdentityClick={() => navigate(`/crews/${crewId}/activities/${activityId}`)}
          avatar={
            <Avatar className="size-8 border border-border/60">
              <AvatarFallback>
                <CalendarDays className="size-3.5" />
              </AvatarFallback>
            </Avatar>
          }
          title={activityTitle}
          meta={
            <span className="max-w-[9rem] truncate text-[11px] text-muted-foreground">
              {crewName}
            </span>
          }
          actions={
            <ChatHeaderMenu
              actions={
                myStatus === "RSVP"
                  ? [
                      {
                        label: "참석 취소",
                        icon: <UserMinus className="size-4" />,
                        onSelect: () => {
                          void handleCancelAttendance();
                        },
                        disabled: cancelRsvp.isPending,
                        variant: "destructive",
                      },
                    ]
                  : []
              }
            />
          }
        />

        {activity?.status === "CANCELLED" ? (
          <div className="m-4 rounded-xl border bg-card p-6 text-center">
            <p className="text-base font-medium">취소된 활동이라 채팅을 볼 수 없습니다.</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => navigate(`/crews/${crewId}/activities/${activityId}`)}
            >
              활동 상세로 돌아가기
            </Button>
          </div>
        ) : activity && !canAccessChat ? (
          <div className="m-4 rounded-xl border bg-card p-6 text-center">
            <p className="text-base font-medium">참석 후 대화를 볼 수 있습니다.</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => navigate(`/crews/${crewId}/activities/${activityId}`)}
            >
              활동 상세로 돌아가기
            </Button>
          </div>
        ) : chat.error ? (
          <div className="m-4 rounded-xl border bg-card p-6 text-center">
            <p className="text-base font-medium">{chat.error}</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => navigate(`/crews/${crewId}/activities/${activityId}`)}
            >
              활동 상세로 돌아가기
            </Button>
          </div>
        ) : (
          <GroupChat
            className="flex-1 overflow-hidden"
            chat={chat}
            emptyMessage="아직 대화가 없습니다."
            missingConversationMessage="대화를 준비 중입니다."
            composerPlaceholder="메시지를 입력하세요"
          />
        )}
      </div>
    </ChatSplitLayout>
  );
}
