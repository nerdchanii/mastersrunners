import { ArrowLeft, CalendarDays } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import GroupChat from "@/components/crew/GroupChat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCrewActivity } from "@/hooks/useCrewActivities";
import { useCrew } from "@/hooks/useCrews";
import { useActivityChat } from "@/hooks/useGroupChat";
import { useAuth } from "@/lib/auth-context";

export default function ActivityChatPage() {
  const { id: crewId, activityId } = useParams<{ id: string; activityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const chat = useActivityChat(crewId ?? "", activityId ?? "");
  const { data: activity } = useCrewActivity(crewId ?? "", activityId ?? "");
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

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/crews/${crewId}/activities/${activityId}`)}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <Avatar className="size-11 border border-border/60">
          <AvatarFallback>
            <CalendarDays className="size-4" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-foreground">{activityTitle}</h1>
          <p className="truncate text-xs text-muted-foreground">{crewName}</p>
        </div>
      </div>

      {activity && !canAccessChat ? (
        <div className="rounded-xl border bg-card p-6 text-center">
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
  );
}
