import { MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage, ChatResponse } from "@/hooks/useGroupChat";
import { useSendGroupMessage } from "@/hooks/useGroupChat";
import { useAuth } from "@/lib/auth-context";

interface GroupChatProps {
  data: ChatResponse | undefined;
  isLoading: boolean;
  crewId: string;
  activityId?: string;
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  missingConversationMessage?: string;
  composerPlaceholder?: string;
}

export default function GroupChat({
  data,
  isLoading,
  crewId,
  activityId,
  title,
  subtitle,
  emptyMessage = "아직 메시지가 없습니다. 첫 메시지를 보내보세요!",
  missingConversationMessage = "채팅방이 아직 준비되지 않았습니다.",
  composerPlaceholder = "메시지를 입력하세요...",
}: GroupChatProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldScrollOnNextUpdateRef = useRef(true);
  const sendMessage = useSendGroupMessage();

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const isNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    return container.scrollHeight - container.scrollTop - container.clientHeight < 80;
  };

  // Reverse messages for chronological display (API returns newest first)
  const sortedMessages = [...(data?.messages || [])].reverse();
  const lastMessageId = sortedMessages.at(-1)?.id;

  useEffect(() => {
    if (!lastMessageId) {
      scrollToBottom("auto");
      return;
    }

    if (shouldScrollOnNextUpdateRef.current || isNearBottom()) {
      scrollToBottom();
    }
    shouldScrollOnNextUpdateRef.current = false;
  }, [lastMessageId]);

  const handleSend = () => {
    if (!message.trim() || !data?.conversation) return;

    shouldScrollOnNextUpdateRef.current = true;
    sendMessage.mutate(
      {
        conversationId: data.conversation.id,
        content: message.trim(),
        crewId,
        activityId,
      },
      {
        onSuccess: () => setMessage(""),
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "메시지 전송에 실패했습니다.");
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data?.conversation) {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="size-5" />
            {title ?? "채팅"}
          </CardTitle>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          <MessageCircle className="size-8 mx-auto mb-2 opacity-50" />
          {missingConversationMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="pb-2 border-b shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="size-5" />
          {title ?? "채팅"}
          <span className="text-sm font-normal text-muted-foreground">
            ({data.conversation.participants.length}명)
          </span>
        </CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>

      {/* Messages area */}
      <div ref={messagesContainerRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {sortedMessages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          sortedMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === user?.id} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t p-3">
        <div className="flex items-center gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={composerPlaceholder}
            className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            rows={1}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim() || sendMessage.isPending}
          >
            <Send className="size-4" />
          </Button>
        </div>
        {sendMessage.isError && (
          <p className="mt-2 text-xs text-destructive">
            {sendMessage.error instanceof Error
              ? sendMessage.error.message
              : "메시지 전송에 실패했습니다."}
          </p>
        )}
      </div>
    </Card>
  );
}

function MessageBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  if (message.deletedAt) {
    return (
      <div className="py-1 text-center text-xs text-muted-foreground">삭제된 메시지입니다.</div>
    );
  }

  return (
    <div className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
      {!isOwn && (
        <UserAvatar
          user={{
            id: message.sender.id,
            name: message.sender.name,
            profileImage: message.sender.profileImage,
          }}
          size="sm"
        />
      )}
      <div className={`max-w-[70%] ${isOwn ? "text-right" : ""}`}>
        {!isOwn && <p className="mb-0.5 text-xs text-muted-foreground">{message.sender.name}</p>}
        <div
          className={`inline-block rounded-lg px-3 py-2 text-sm ${
            isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {new Date(message.createdAt).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
