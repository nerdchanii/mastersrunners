import { ArrowDown, Send } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { GroupChatController } from "@/hooks/useGroupChat";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface GroupChatProps {
  className?: string;
  chat: GroupChatController;
  emptyMessage?: string;
  missingConversationMessage?: string;
  composerPlaceholder?: string;
  initialMessage?: string;
}

function toMinuteKey(createdAt: string) {
  const date = new Date(createdAt);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
}

function shouldShowAvatar(
  messages: GroupChatController["messages"],
  index: number,
  isOwn: boolean,
) {
  if (isOwn) {
    return false;
  }

  const previous = messages[index - 1];
  if (!previous || previous.deletedAt) {
    return true;
  }

  return previous.senderId !== messages[index].senderId;
}

function shouldShowSenderName(
  messages: GroupChatController["messages"],
  index: number,
  isOwn: boolean,
) {
  return shouldShowAvatar(messages, index, isOwn);
}

function shouldShowTimestamp(messages: GroupChatController["messages"], index: number) {
  const current = messages[index];
  const next = messages[index + 1];

  if (!next || next.deletedAt) {
    return true;
  }

  if (next.senderId !== current.senderId) {
    return true;
  }

  return toMinuteKey(next.createdAt) !== toMinuteKey(current.createdAt);
}

export default function GroupChat({
  className,
  chat,
  emptyMessage = "아직 대화가 없습니다.",
  missingConversationMessage = "대화를 준비 중입니다.",
  composerPlaceholder = "메시지를 입력하세요",
  initialMessage = "",
}: GroupChatProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState(initialMessage);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prependSnapshotRef = useRef<{ height: number; top: number } | null>(null);

  const resizeTextarea = () => {
    const element = textareaRef.current;
    if (!element) return;

    element.style.height = "0px";
    const nextHeight = Math.min(element.scrollHeight, 144);
    element.style.height = `${nextHeight}px`;
    element.style.overflowY = element.scrollHeight > 144 ? "auto" : "hidden";
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  const syncNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    const remainingBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    chat.setNearBottom(remainingBottom < 96);
  }, [chat]);

  useEffect(() => {
    resizeTextarea();
  }, [message]);

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
    if (!container) {
      return;
    }

    if (!chat.anchorMessageId) {
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

  useEffect(() => {
    syncNearBottom();
  }, [chat.messages, syncNearBottom]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const trimmed = message.trim();
    setMessage("");
    const ok = await chat.sendMessage(trimmed);
    if (!ok) {
      setMessage(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  if (chat.loading) {
    return (
      <div className="space-y-4 p-4 lg:rounded-3xl lg:border lg:border-border/60 lg:bg-background/80">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!chat.conversation) {
    return (
      <section className="px-4 py-10 text-center text-sm text-muted-foreground lg:rounded-3xl lg:border lg:border-border/60 lg:bg-background/80">
        {missingConversationMessage}
      </section>
    );
  }

  return (
    <section
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background",
        "lg:overflow-hidden lg:rounded-3xl lg:border lg:border-border/60 lg:bg-background/80",
        className,
      )}
    >
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-3 pb-3 sm:px-4"
      >
        {chat.loadingOlder && (
          <div className="pb-3 text-center text-xs text-muted-foreground">
            이전 메시지 불러오는 중...
          </div>
        )}

        {chat.messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="space-y-3">
            {chat.messages.map((msg, index) => {
              const isOwn = msg.senderId === user?.id;

              return (
                <div key={msg.id}>
                  {chat.firstUnreadMessageId === msg.id && (
                    <div className="mb-3 flex items-center gap-3">
                      <div className="h-px flex-1 bg-border/70" />
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        안 읽은 메시지
                      </span>
                      <div className="h-px flex-1 bg-border/70" />
                    </div>
                  )}

                  <div data-message-id={msg.id}>
                    <MessageBubble
                      message={msg}
                      isOwn={isOwn}
                      showAvatar={shouldShowAvatar(chat.messages, index, isOwn)}
                      showSenderName={shouldShowSenderName(chat.messages, index, isOwn)}
                      showTimestamp={shouldShowTimestamp(chat.messages, index)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(chat.pendingNewMessages > 0 || chat.newerCursor) && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[5.75rem] flex justify-center px-4">
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

      <div className="sticky bottom-0 shrink-0 border-t border-border/60 bg-background/98 px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-4 backdrop-blur-sm">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              chat.clearSendError();
              setMessage(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder={composerPlaceholder}
            className="flex-1 resize-none rounded-2xl border border-input bg-background px-3 py-3 text-[13px] leading-5 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 sm:text-sm"
            rows={1}
          />
          <Button
            size="icon"
            onClick={() => void handleSend()}
            disabled={!message.trim() || chat.sending}
            className="size-11 shrink-0 rounded-2xl"
          >
            <Send className="size-4" />
          </Button>
        </div>
        {chat.sendError && <p className="mt-2 text-xs text-destructive">{chat.sendError}</p>}
      </div>
    </section>
  );
}

function MessageBubble({
  message,
  isOwn,
  showAvatar,
  showSenderName,
  showTimestamp,
}: {
  message: GroupChatController["messages"][number];
  isOwn: boolean;
  showAvatar: boolean;
  showSenderName: boolean;
  showTimestamp: boolean;
}) {
  if (message.deletedAt) {
    return (
      <div className="py-1 text-center text-xs text-muted-foreground">삭제된 메시지입니다.</div>
    );
  }

  return (
    <div className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
      {!isOwn &&
        (showAvatar ? (
          <UserAvatar
            user={{
              id: message.sender.id,
              name: message.sender.name,
              profileImage: message.sender.profileImage,
            }}
            size="sm"
          />
        ) : (
          <div className="w-8 shrink-0" aria-hidden="true" />
        ))}
      <div className={`max-w-[78%] sm:max-w-[70%] ${isOwn ? "text-right" : ""}`}>
        {!isOwn && showSenderName && (
          <p className="mb-0.5 text-[11px] text-muted-foreground sm:text-xs">
            {message.sender.name}
          </p>
        )}
        <div
          className={`inline-block rounded-3xl px-3 py-2 text-[13px] leading-5 sm:text-sm ${
            isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        {showTimestamp && (
          <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
            {new Date(message.createdAt).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </div>
  );
}
