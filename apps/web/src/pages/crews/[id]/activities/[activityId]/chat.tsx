import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import GroupChat from "@/components/crew/GroupChat";
import { Button } from "@/components/ui/button";
import { useCrewActivity } from "@/hooks/useCrewActivities";
import { useCrew } from "@/hooks/useCrews";
import { useActivityChat } from "@/hooks/useGroupChat";
import { useAuth } from "@/lib/auth-context";

export default function ActivityChatPage() {
  const { id: crewId, activityId } = useParams<{ id: string; activityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: chatData, isLoading: chatLoading } = useActivityChat(
    crewId ?? "",
    activityId ?? "",
  );
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

      {activity && !canAccessChat ? (
        <div className="rounded-xl border bg-card p-6 text-center">
          <p className="text-base font-medium">
            이 활동 채팅은 참석 신청 또는 체크인 후 사용할 수 있습니다.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            활동 상세에서 참석 상태를 먼저 변경한 뒤 다시 들어와 주세요.
          </p>
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
          data={chatData}
          isLoading={chatLoading}
          crewId={crewId ?? ""}
          activityId={activityId}
          title={`${activityTitle} 활동 채팅`}
          subtitle="참석자와 운영진을 위한 대화 공간"
          emptyMessage={`${activityTitle} 활동에 첫 메시지를 남겨보세요.`}
          missingConversationMessage="이 활동의 채팅방이 아직 준비되지 않았습니다."
          composerPlaceholder={`${activityTitle} 활동에 메시지 보내기`}
        />
      )}
    </div>
  );
}
