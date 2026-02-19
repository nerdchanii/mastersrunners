import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Send, MessageCircle } from "lucide-react";
import type { ChatMessage, ChatResponse } from "@/hooks/useGroupChat";
import { useSendGroupMessage } from "@/hooks/useGroupChat";

interface GroupChatProps {
  data: ChatResponse | undefined;
  isLoading: boolean;
  crewId: string;
  activityId?: string;
}

export default function GroupChat({ data, isLoading, crewId, activityId }: GroupChatProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendMessage = useSendGroupMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [data?.messages]);

  const handleSend = () => {
    if (!message.trim() || !data?.conversation) return;

    sendMessage.mutate(
      {
        conversationId: data.conversation.id,
        content: message.trim(),
        crewId,
        activityId,
      },
      {
        onSuccess: () => setMessage(""),
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
        <CardContent className="py-8 text-center text-muted-foreground">
          <MessageCircle className="size-8 mx-auto mb-2 opacity-50" />
          채팅방이 아직 생성되지 않았습니다.
        </CardContent>
      </Card>
    );
  }

  // Reverse messages for chronological display (API returns newest first)
  const sortedMessages = [...(data.messages || [])].reverse();

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="pb-2 border-b shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="size-5" />
          채팅
          <span className="text-sm font-normal text-muted-foreground">
            ({data.conversation.participants.length}명)
          </span>
        </CardTitle>
      </CardHeader>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedMessages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            아직 메시지가 없습니다. 첫 메시지를 보내보세요!
          </p>
        ) : (
          sortedMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === user?.id} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t shrink-0">
        <div className="flex items-center gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
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
      </div>
    </Card>
  );
}

function MessageBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  if (message.deletedAt) {
    return (
      <div className="text-center text-xs text-muted-foreground py-1">
        삭제된 메시지입니다.
      </div>
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
        {!isOwn && (
          <p className="text-xs text-muted-foreground mb-0.5">{message.sender.name}</p>
        )}
        <div
          className={`inline-block rounded-lg px-3 py-2 text-sm ${
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date(message.createdAt).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
