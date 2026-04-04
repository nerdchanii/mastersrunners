import { CalendarDays, MessageCircle, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { TimeAgo } from "@/components/common/TimeAgo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { type Conversation, useConversations } from "@/hooks/useMessages";
import { useAuth } from "@/lib/auth-context";
import {
  type ConversationRoomKind,
  getConversationOtherUser,
  getConversationRoomMeta,
  matchesConversationQuery,
} from "@/lib/message-room";
import { cn } from "@/lib/utils";

type ConversationFilter = "ALL" | ConversationRoomKind;

const filterOptions: Array<{ label: string; value: ConversationFilter }> = [
  { value: "ALL", label: "전체" },
  { value: "DIRECT", label: "1:1" },
  { value: "CREW", label: "크루" },
  { value: "ACTIVITY", label: "활동" },
];

export default function MessagesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ConversationFilter>("ALL");
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useConversations();

  const conversations = useMemo(
    () => data?.pages.flatMap((page) => page?.data ?? []) ?? [],
    [data],
  );

  const roomItems = useMemo(
    () =>
      conversations.map((conversation) => ({
        conversation,
        lastMessage: conversation.messages[0] ?? null,
        meta: getConversationRoomMeta(conversation, user?.id),
        otherUser: getConversationOtherUser(conversation, user?.id),
      })),
    [conversations, user?.id],
  );

  const counts = useMemo(
    () =>
      roomItems.reduce<Record<ConversationFilter, number>>(
        (acc, item) => {
          acc.ALL += 1;
          acc[item.conversation.type] += 1;
          return acc;
        },
        { ALL: 0, DIRECT: 0, CREW: 0, ACTIVITY: 0 },
      ),
    [roomItems],
  );

  const filteredRooms = useMemo(
    () =>
      roomItems.filter((item) => {
        if (filter !== "ALL" && item.conversation.type !== filter) {
          return false;
        }

        return matchesConversationQuery(item.conversation, user?.id, query);
      }),
    [filter, query, roomItems, user?.id],
  );

  const emptyState = getEmptyState(filter, query);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader title="메시지" />
        <section className="overflow-hidden rounded-3xl border border-border/60 bg-background/80 shadow-sm">
          <div className="border-b border-border/60 px-4 py-4">
            <Skeleton className="h-10 w-full rounded-2xl" />
            <div className="mt-3 flex gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-16 rounded-full" />
              ))}
            </div>
          </div>
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 px-4 py-4">
                <Skeleton className="size-12 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader title="메시지" />
        <section className="rounded-3xl border border-destructive/30 bg-destructive/5 px-5 py-6">
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "오류가 발생했습니다."}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="메시지" />

      <section className="overflow-hidden rounded-3xl border border-border/60 bg-background/80 shadow-sm">
        <div className="border-b border-border/60 px-4 py-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="이름, 크루명, 활동명으로 찾기"
              className="h-10 rounded-2xl border-none bg-muted/70 pl-9 shadow-none focus-visible:ring-1"
            />
          </label>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors",
                  filter === option.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border/70 bg-background text-muted-foreground hover:bg-accent",
                )}
              >
                <span>{option.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[11px]",
                    filter === option.value
                      ? "bg-background/20 text-background"
                      : "bg-muted text-foreground",
                  )}
                >
                  {counts[option.value]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="px-4 py-10">
            <EmptyState
              icon={MessageCircle}
              title={emptyState.title}
              description={emptyState.description}
            />
          </div>
        ) : (
          <div className="divide-y">
            {filteredRooms.map(({ conversation, lastMessage, meta, otherUser }) => (
              <button
                key={conversation.id}
                type="button"
                className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-accent/40"
                onClick={() => navigate(meta.href)}
              >
                <RoomAvatar conversation={conversation} otherUser={otherUser} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-foreground">
                          {meta.title}
                        </h3>
                        <span className="inline-flex shrink-0 items-center rounded-full border border-border/70 px-2 py-0.5 text-[11px] text-muted-foreground">
                          {meta.kindLabel}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {meta.subtitle}
                        {conversation.type !== "DIRECT" &&
                          ` · ${conversation.participants.length}명`}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          <TimeAgo date={lastMessage.createdAt} />
                        </span>
                      )}
                      {conversation.unreadCount > 0 && (
                        <Badge className="min-w-[20px] rounded-full px-1.5 text-[10px]">
                          {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p
                    className={cn(
                      "mt-2 truncate text-sm",
                      conversation.unreadCount > 0
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {lastMessage?.content ?? getFallbackPreview(conversation)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {!isFetchingNextPage && hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()}>
            더보기
          </Button>
        </div>
      )}
    </div>
  );
}

function RoomAvatar({
  conversation,
  otherUser,
}: {
  conversation: Conversation;
  otherUser: ReturnType<typeof getConversationOtherUser>;
}) {
  if (conversation.type === "DIRECT") {
    return (
      <Avatar className="size-12 shrink-0">
        {otherUser?.profileImage && (
          <AvatarImage src={otherUser.profileImage} alt={otherUser.name} />
        )}
        <AvatarFallback>{otherUser?.name?.[0] ?? "대"}</AvatarFallback>
      </Avatar>
    );
  }

  const Icon = conversation.type === "ACTIVITY" ? CalendarDays : Users;
  const fallback = conversation.type === "ACTIVITY" ? "활" : "크";

  return (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted text-foreground">
      <span className="sr-only">
        {conversation.type === "ACTIVITY" ? "활동 채팅방" : "크루 채팅방"}
      </span>
      <Icon className="size-5" aria-hidden="true" />
      <span className="sr-only">{fallback}</span>
    </div>
  );
}

function getFallbackPreview(conversation: Conversation) {
  if (conversation.type === "ACTIVITY") {
    return "아직 메시지가 없습니다.";
  }

  if (conversation.type === "CREW") {
    return "아직 메시지가 없습니다.";
  }

  return "아직 메시지가 없습니다.";
}

function getEmptyState(filter: ConversationFilter, query: string) {
  if (query.trim()) {
    return {
      title: "검색 결과가 없습니다",
      description: "검색어를 다시 확인해 주세요.",
    };
  }

  if (filter === "DIRECT") {
    return {
      title: "1:1 메시지가 없습니다",
    };
  }

  if (filter === "CREW") {
    return {
      title: "크루 채팅이 없습니다",
    };
  }

  if (filter === "ACTIVITY") {
    return {
      title: "활동 채팅이 없습니다",
    };
  }

  return {
    title: "대화가 없습니다",
  };
}
