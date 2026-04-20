import { ArrowDown, CalendarDays, ChevronLeft, Users } from "lucide-react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatRoomHeader } from "@/components/chat/ChatRoomHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatBackToMessages } from "@/hooks/useChatBackToMessages";
import { useAuth } from "@/lib/auth-context";
import { getConversationOtherUser, getConversationRoomMeta } from "@/lib/message-room";
import { cn } from "@/lib/utils";

import { type Message, useMessageDetailPage } from "./useMessageDetailPage";

export default function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const chat = useMessageDetailPage(id);
  const handleBack = useChatBackToMessages();
  const [content, setContent] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prependSnapshotRef = useRef<{ height: number; top: number } | null>(null);
  const initialPositionedRef = useRef(false);

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
    if (chat.loading || chat.anchorMessageId || initialPositionedRef.current) {
      return;
    }

    scrollToBottom("auto");
    chat.setNearBottom(true);
    initialPositionedRef.current = true;
  }, [chat.anchorMessageId, chat.loading, chat.messages.length, chat]);

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
    requestAnimationFrame(() => {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement && activeElement.tagName === "TEXTAREA") {
        return;
      }

      const composer = messagesContainerRef.current?.parentElement;
      const textarea = composer?.querySelector("textarea");
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.focus();
      }
    });
  };

  const conversation = chat.conversation;
  const otherUser = conversation ? getConversationOtherUser(conversation, user?.id) : null;
  const roomMeta = conversation ? getConversationRoomMeta(conversation, user?.id) : null;
  const headerHref = useMemo(() => {
    if (!conversation) {
      return null;
    }

    if (conversation.type === "DIRECT") {
      return otherUser ? `/profile/${otherUser.id}` : null;
    }

    if (conversation.type === "CREW") {
      const crewTargetId = conversation.crewId ?? conversation.crew?.id;
      return crewTargetId ? `/crews/${crewTargetId}` : null;
    }

    const targetCrewId = conversation.crewId ?? conversation.activity?.crewId;
    return conversation.activityId && targetCrewId
      ? `/crews/${targetCrewId}/activities/${conversation.activityId}`
      : null;
  }, [conversation, otherUser]);

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
    <div className="relative flex h-full flex-col overflow-hidden">
      <ChatRoomHeader
        backIcon={<ChevronLeft className="h-5 w-5" />}
        onBack={handleBack}
        onIdentityClick={headerHref ? () => navigate(headerHref) : null}
        avatar={
          conversation.type === "DIRECT" && otherUser ? (
            <Avatar className="h-8 w-8">
              {otherUser.profileImage ? (
                <AvatarImage src={otherUser.profileImage} alt={otherUser.name} />
              ) : null}
              <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-muted text-foreground">
              {conversation.type === "ACTIVITY" ? (
                <CalendarDays className="h-3.5 w-3.5" />
              ) : (
                <Users className="h-3.5 w-3.5" />
              )}
            </div>
          )
        }
        title={roomMeta.title}
        meta={
          conversation.type === "CREW" ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Users className="size-3" />
              <span>{conversation.participants.length}</span>
            </span>
          ) : conversation.type === "ACTIVITY" && roomMeta.secondaryTitle ? (
            <span className="max-w-[9rem] truncate text-[11px] text-muted-foreground">
              {roomMeta.secondaryTitle}
            </span>
          ) : null
        }
      />

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto px-2 py-3 pb-2 sm:px-3"
      >
        {chat.loadingOlder ? (
          <div className="pb-3 text-center text-xs text-muted-foreground">
            이전 메시지 불러오는 중...
          </div>
        ) : null}

        <div className="space-y-4">
          {chat.messages.map((message, index) => {
            const isOwn = message.senderId === user?.id;
            const showDate = shouldShowDateDivider(message, index);

            return (
              <div key={message.id} data-message-id={message.id}>
                {chat.firstUnreadMessageId === message.id ? (
                  <div className="my-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border/70" />
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      안 읽은 메시지
                    </span>
                    <div className="h-px flex-1 bg-border/70" />
                  </div>
                ) : null}

                {showDate ? (
                  <div className="my-4 flex justify-center">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                ) : null}

                <div
                  className={`flex ${isOwn ? "justify-end pr-1 sm:pr-2" : "justify-start pl-1 sm:pl-0"}`}
                >
                  <div
                    className={`flex max-w-[72%] gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {!isOwn ? (
                      <Avatar className="h-8 w-8 shrink-0">
                        {message.sender.profileImage ? (
                          <AvatarImage
                            src={message.sender.profileImage}
                            alt={message.sender.name}
                          />
                        ) : null}
                        <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
                      </Avatar>
                    ) : null}

                    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                      <div
                        className={cn(
                          "rounded-[1rem] px-4 py-2",
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

      {chat.pendingNewMessages > 0 || chat.newerCursor ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-[5.5rem] flex justify-center px-4">
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
      ) : null}

      <ChatComposer
        value={content}
        onChange={(nextValue) => {
          chat.clearSendError();
          setContent(nextValue);
        }}
        onSend={() => void handleSend()}
        disabled={chat.sending}
        error={chat.sendError}
        placeholder="메시지를 입력하세요"
      />
    </div>
  );
}
