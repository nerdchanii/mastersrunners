import { ArrowLeft, MessageCircle, Users } from "lucide-react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

import { ChatRoomHeader } from "@/components/chat/ChatRoomHeader";
import { ChatViewportSkeleton } from "@/components/chat/ChatViewportSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import GroupChat from "@/components/crew/GroupChat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatBackToMessages } from "@/hooks/useChatBackToMessages";
import { useCrewChat } from "@/hooks/useGroupChat";
import { getConversationRoomMeta } from "@/lib/message-room";
import type { SelectedConversationSummary } from "@/pages/messages/shell";

export default function CrewMessagePage() {
  const params = useParams();
  const navigate = useNavigate();
  const { selectedConversation } = useOutletContext<{
    selectedConversation: SelectedConversationSummary | null;
  }>();
  const crewId = params.crewId as string;
  const chat = useCrewChat(crewId, !!crewId);
  const handleBack = useChatBackToMessages();
  const selectedConversationId = selectedConversation?.conversation.id ?? null;

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

  const conversation = chat.conversation ?? selectedConversation?.conversation ?? null;
  const selectedSummary = conversation?.id === selectedConversationId ? selectedConversation : null;
  const roomMeta = selectedSummary
    ? selectedSummary.meta
    : conversation
      ? getConversationRoomMeta(conversation)
      : null;
  const crewTitle = roomMeta?.title ?? "대화";
  const participantCount = conversation?.participants.length ?? 0;

  if (chat.loading && !conversation) {
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

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ChatRoomHeader
        backIcon={<ArrowLeft className="size-4" />}
        onBack={handleBack}
        onIdentityClick={() => navigate(`/crews/${crewId}`)}
        avatar={
          <Avatar className="size-8 border border-border/60">
            {chat.conversation?.crew?.imageUrl ? (
              <AvatarImage src={chat.conversation.crew.imageUrl} alt={crewTitle} />
            ) : null}
            <AvatarFallback>
              <Users className="size-3.5" />
            </AvatarFallback>
          </Avatar>
        }
        title={crewTitle}
        meta={
          participantCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Users className="size-3" />
              <span>{participantCount}</span>
            </span>
          ) : null
        }
      />

      {chat.loading ? (
        <ChatViewportSkeleton />
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
