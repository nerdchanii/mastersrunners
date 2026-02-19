import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import GroupChat from "@/components/crew/GroupChat";
import { useActivityChat } from "@/hooks/useGroupChat";
import { useCrewActivity } from "@/hooks/useCrewActivities";

export default function ActivityChatPage() {
  const { id: crewId, activityId } = useParams<{ id: string; activityId: string }>();
  const navigate = useNavigate();

  const { data: chatData, isLoading: chatLoading } = useActivityChat(crewId ?? "", activityId ?? "");
  const { data: activity } = useCrewActivity(crewId ?? "", activityId ?? "");

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
        <h1 className="text-xl font-bold">{activity?.title ?? "활동"} 채팅</h1>
      </div>

      <GroupChat
        data={chatData}
        isLoading={chatLoading}
        crewId={crewId ?? ""}
        activityId={activityId}
      />
    </div>
  );
}
