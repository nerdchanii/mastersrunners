import { ArrowDown, CalendarDays, ChevronLeft, Users } from "lucide-react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { getConversationOtherUser, getConversationRoomMeta } from "@/lib/message-room";
import { cn } from "@/lib/utils";

import { type Message, useMessageDetailPage } from "./useMessageDetailPage";

export default function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const chat = useMessageDetailPage(id);
  const [content, setContent] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prependSnapshotRef = useRef<{ height: number; top: number } | null>(null);

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const shouldShowDateDivider = (currentMessage: Message, index: number) => {
    if (index === 0) return true;
    const prevMessage = chat.messages[index - 1];
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const prevDate = new Date(prevMessage.createdAt).toDateString();
    return currentDate !== prevDate;
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  const syncNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    const remainingBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    chat.setNearBottom(remainingBottom < 96);
  }, [chat]);

  useLayoutEffect(() => {
    if (!prependSnapshotRef.current || !messagesContainerRef.current) {
      return;
    }

    const container = messagesContainerRef.current;
    const snapshot = prependSnapshotRef.current;
    prependSnapshotRef.current = null;
    container.scrollTop = container.scrollHeight - snapshot.height + snapshot.top;
  }, [chat.messages]);

  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !chat.anchorMessageId) {
      return;
    }

    const anchor = container.querySelector<HTMLElement>(
      `[data-message-id="${chat.anchorMessageId}"]`,
    );
    if (!anchor) {
      return;
    }

    anchor.scrollIntoView({ block: "start", behavior: "auto" });
    container.scrollBy({ top: -12, behavior: "auto" });
    chat.setNearBottom(false);
  }, [chat]);

  useLayoutEffect(() => {
    scrollToBottom(chat.loading ? "auto" : "smooth");
    chat.setNearBottom(true);
  }, [chat]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    const remainingBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = remainingBottom < 96;
    chat.setNearBottom(isNearBottom);

    if (container.scrollTop < 96 && chat.olderCursor && !chat.loadingOlder) {
      prependSnapshotRef.current = {
        height: container.scrollHeight,
        top: container.scrollTop,
      };
      void chat.loadOlder();
    }

    if (remainingBottom < 160 && chat.newerCursor && !chat.loadingNewer) {
      void chat.loadNewer();
    }
  };

  useLayoutEffect(() => {
    syncNearBottom();
  }, [chat.messages, syncNearBottom]);

  const handleSend = async () => {
    if (!content.trim() || chat.sending) return;

    const trimmedContent = content.trim();
    setContent("");
    const ok = await chat.sendMessage(trimmedContent);
    if (!ok) {
      setContent(trimmedContent);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  if (chat.loading) {
    return (
      <div className="mx-auto flex h-full max-w-3xl flex-col overflow-hidden">
        <div className="border-b border-border/60 bg-background/95 px-1 py-4 backdrop-blur-sm sm:px-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="flex-1 space-y-4 px-1 py-4 sm:px-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
              <Skeleton className="h-16 w-64 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (chat.error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4">
        <div className="max-w-md border-y border-destructive/30 bg-destructive/5 px-4 py-4">
          <p className="text-destructive">{chat.error}</p>
          <button
            onClick={chat.retry}
            className="mt-2 text-sm text-destructive underline hover:text-destructive/80"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const conversation = chat.conversation;
  const otherUser = conversation ? getConversationOtherUser(conversation, user?.id) : null;
  const roomMeta = conversation ? getConversationRoomMeta(conversation, user?.id) : null;

  if (!conversation || !roomMeta) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4">
        <p className="text-muted-foreground">대화를 찾을 수 없습니다</p>
        <Button onClick={() => navigate("/messages")} className="mt-4">
          메시지 목록으로
        </Button>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex h-full max-w-3xl flex-col overflow-hidden">
      <div className="sticky top-0 z-10 border-b border-border/60 bg-background/95 px-1 py-4 backdrop-blur-sm sm:px-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/messages")}
            className="shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          {conversation.type === "DIRECT" && otherUser ? (
            <Avatar className="h-10 w-10">
              {otherUser.profileImage && (
                <AvatarImage src={otherUser.profileImage} alt={otherUser.name} />
              )}
              <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-muted text-foreground">
              {conversation.type === "ACTIVITY" ? (
                <CalendarDays className="h-4 w-4" />
              ) : (
                <Users className="h-4 w-4" />
              )}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{roomMeta.title}</h2>
            {roomMeta.secondaryTitle && (
              <p className="text-xs text-muted-foreground">{roomMeta.secondaryTitle}</p>
            )}
          </div>
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto px-1 py-3 pb-3 sm:px-2"
      >
        {chat.loadingOlder && (
          <div className="pb-3 text-center text-xs text-muted-foreground">
            이전 메시지 불러오는 중...
          </div>
        )}

        <div className="space-y-4">
          {chat.messages.map((message, index) => {
            const isOwn = message.senderId === user?.id;
            const showDate = shouldShowDateDivider(message, index);

            return (
              <div key={message.id} data-message-id={message.id}>
                {chat.firstUnreadMessageId === message.id && (
                  <div className="my-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border/70" />
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      안 읽은 메시지
                    </span>
                    <div className="h-px flex-1 bg-border/70" />
                  </div>
                )}

                {showDate && (
                  <div className="my-4 flex justify-center">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                )}

                <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex max-w-[70%] gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
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
                          <p className="whitespace-pre-wrap break-words text-sm">
                            {message.content}
                          </p>
                        )}
                      </div>
                      <span className="mt-1 text-xs text-muted-foreground">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {(chat.pendingNewMessages > 0 || chat.newerCursor) && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[6rem] flex justify-center px-4">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="pointer-events-auto rounded-full shadow-sm"
            onClick={() => void chat.loadNewer()}
          >
            <ArrowDown className="mr-1 size-3.5" />
            {chat.pendingNewMessages > 0
              ? `새 메시지 ${chat.pendingNewMessages}개`
              : "다음 메시지 보기"}
          </Button>
        </div>
      )}

      <div className="sticky bottom-0 shrink-0 border-t border-border/60 bg-background/95 px-1 py-3 backdrop-blur-sm sm:px-2">
        <div className="flex gap-2">
          <Textarea
            value={content}
            onChange={(e) => {
              chat.clearSendError();
              setContent(e.target.value);
            }}
            onKeyDown={handleKeyPress}
            placeholder="메시지를 입력하세요"
            className="min-h-[60px] max-h-[120px] resize-none text-sm"
            disabled={chat.sending}
          />
          <Button
            onClick={() => void handleSend()}
            disabled={!content.trim() || chat.sending}
            className="h-[60px] shrink-0 px-6"
          >
            {chat.sending ? "전송 중..." : "전송"}
          </Button>
        </div>
        {chat.sendError && <p className="mt-2 text-xs text-destructive">{chat.sendError}</p>}
      </div>
    </div>
  );
}
