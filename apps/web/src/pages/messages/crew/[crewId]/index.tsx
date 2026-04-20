import { ArrowLeft, MessageCircle, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import GroupChat from "@/components/crew/GroupChat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCrewChat } from "@/hooks/useGroupChat";
import { getConversationRoomMeta } from "@/lib/message-room";

export default function CrewMessagePage() {
  const params = useParams();
  const navigate = useNavigate();
  const crewId = params.crewId as string;
  const chat = useCrewChat(crewId, !!crewId);

  if (!crewId || crewId === "_") {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <EmptyState
          icon={MessageCircle}
          title="크루를 찾을 수 없습니다."
          actionLabel="메시지 목록으로"
          onAction={() => navigate("/messages")}
        />
      </div>
    );
  }

  if (chat.loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-16 w-full rounded-3xl" />
        <Skeleton className="h-[540px] w-full rounded-3xl" />
      </div>
    );
  }

  if (chat.error) {
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

  const roomMeta = chat.conversation ? getConversationRoomMeta(chat.conversation) : null;
  const crewTitle = roomMeta?.title ?? "대화";
  const participantCount = chat.conversation?.participants.length ?? 0;

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col overflow-hidden">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate("/messages")}>
          <ArrowLeft className="size-4" />
        </Button>
        <Avatar className="size-11 border border-border/60">
          {chat.conversation?.crew?.imageUrl && (
            <AvatarImage src={chat.conversation.crew.imageUrl} alt={crewTitle} />
          )}
          <AvatarFallback>
            <Users className="size-4" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-foreground">{crewTitle}</h1>
          {participantCount > 0 && (
            <p className="text-xs text-muted-foreground">{participantCount}명</p>
          )}
        </div>
      </div>

      <GroupChat
        className="flex-1 overflow-hidden"
        chat={chat}
        emptyMessage="아직 대화가 없습니다."
        missingConversationMessage="대화를 준비 중입니다."
        composerPlaceholder="메시지를 입력하세요"
      />
    </div>
  );
}
