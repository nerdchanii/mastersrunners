import { ChevronLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

import { type Message, useMessageDetailPage } from "./useMessageDetailPage";

export default function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState("");
  const {
    clearSendError,
    conversation,
    error,
    loading,
    loadingMore,
    messages,
    nextCursor,
    sendError,
    sending,
    loadMore,
    retry,
    sendMessage,
  } = useMessageDetailPage(id);

  useEffect(() => {
    // Scroll to bottom when messages change (but not when loading more)
    if (!loadingMore && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loadingMore]);

  const handleSend = async () => {
    if (!content.trim() || sending) return;

    const trimmedContent = content.trim();
    setContent("");
    const ok = await sendMessage(trimmedContent);
    if (!ok) {
      setContent(trimmedContent);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLoadMore = () => {
    loadMore();
  };

  const getOtherUser = () => {
    if (!conversation) return null;
    return conversation.participants.find((p) => p.userId !== user?.id)?.user;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const shouldShowDateDivider = (currentMessage: Message, index: number) => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const prevDate = new Date(prevMessage.createdAt).toDateString();
    return currentDate !== prevDate;
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-7.5rem)] md:h-[calc(100vh-4rem)]">
        <div className="border-b bg-background p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
              <Skeleton className="h-16 w-64 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-7.5rem)] md:h-[calc(100vh-4rem)] p-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 max-w-md">
          <p className="text-destructive">{error}</p>
          <button
            onClick={retry}
            className="mt-2 text-destructive hover:text-destructive/80 underline text-sm"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const otherUser = getOtherUser();

  if (!conversation || !otherUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-7.5rem)] md:h-[calc(100vh-4rem)] p-4">
        <p className="text-muted-foreground">대화를 찾을 수 없습니다</p>
        <Button onClick={() => navigate("/messages")} className="mt-4">
          메시지 목록으로
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] md:h-[calc(100vh-7.5rem)] md:h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur-sm p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/messages")}
            className="shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            {otherUser.profileImage && (
              <AvatarImage src={otherUser.profileImage} alt={otherUser.name} />
            )}
            <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
          </Avatar>
          <h2 className="font-semibold text-lg">{otherUser.name}</h2>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {nextCursor && (
          <div className="flex justify-center mb-4">
            <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? "불러오는 중..." : "이전 메시지 보기"}
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message, index) => {
            const isOwn = message.senderId === user?.id;
            const showDate = shouldShowDateDivider(message, index);

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                )}

                <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex gap-2 max-w-[70%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {!isOwn && (
                      <Avatar className="h-8 w-8 shrink-0">
                        {message.sender.profileImage && (
                          <AvatarImage
                            src={message.sender.profileImage}
                            alt={message.sender.name}
                          />
                        )}
                        <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
                      </Avatar>
                    )}

                    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2",
                          message.deletedAt
                            ? "bg-muted text-muted-foreground italic"
                            : isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground",
                        )}
                      >
                        {message.deletedAt ? (
                          <p className="text-sm">삭제된 메시지입니다</p>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t bg-background/95 backdrop-blur-sm p-4">
        <div className="flex gap-2">
          <Textarea
            value={content}
            onChange={(e) => {
              clearSendError();
              setContent(e.target.value);
            }}
            onKeyDown={handleKeyPress}
            placeholder="메시지를 입력하세요 (Shift+Enter로 줄바꿈)"
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!content.trim() || sending}
            className="shrink-0 h-[60px] px-6"
          >
            {sending ? "전송 중..." : "전송"}
          </Button>
        </div>
        {sendError && <p className="mt-2 text-xs text-destructive">{sendError}</p>}
      </div>
    </div>
  );
}
