import { MessageCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ConversationList } from "@/components/chat/ConversationList";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversations } from "@/hooks/useMessages";
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

interface MessagesPanelProps {
  compact?: boolean;
  showPageHeader?: boolean;
  activeConversationId?: string | null;
}

export function MessagesPanel({
  compact = false,
  showPageHeader = true,
  activeConversationId,
}: MessagesPanelProps) {
  const navigate = useNavigate();
  const location = useLocation();
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
        if (
          item.conversation.type === "ACTIVITY" &&
          item.conversation.activity?.status === "CANCELLED"
        ) {
          return false;
        }

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
      <div
        data-testid={compact ? "messages-panel-sidebar" : "messages-panel"}
        className={compact ? "flex h-full flex-col" : "mx-auto max-w-3xl space-y-6"}
      >
        {showPageHeader ? <PageHeader title="메시지" /> : null}
        <section className="border-y border-border/60">
          <div className="border-b border-border/60 px-3 py-4">
            {!showPageHeader ? <div className="min-h-16" /> : null}
            <Skeleton className="h-10 w-full rounded-full" />
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-16 rounded-full" />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-testid={compact ? "messages-panel-sidebar" : "messages-panel"}
        className={compact ? "flex h-full flex-col" : "mx-auto max-w-3xl space-y-6"}
      >
        {showPageHeader ? <PageHeader title="메시지" /> : null}
        <section className="border-y border-destructive/30 bg-destructive/5 px-3 py-5">
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "오류가 발생했습니다."}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div
      data-testid={compact ? "messages-panel-sidebar" : "messages-panel"}
      className={compact ? "flex h-full min-h-0 flex-col" : "mx-auto max-w-3xl space-y-6"}
    >
      {showPageHeader ? <PageHeader title="메시지" /> : null}

      <section className="flex min-h-0 flex-1 flex-col border-y border-border/60">
        <div className="border-b border-border/60 px-3 py-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-testid={compact ? "messages-search-sidebar" : "messages-search"}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="이름, 크루명, 활동명으로 찾기"
              className="h-10 rounded-full border-none bg-muted/70 pl-9 shadow-none focus-visible:ring-1"
            />
          </label>

          <div className="mt-2.5 flex gap-2 overflow-x-auto pb-0.5">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-sm transition-colors",
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

        <div className="min-h-0 flex-1 overflow-y-auto">
          {filteredRooms.length === 0 ? (
            <div className="px-3 py-10">
              <EmptyState
                icon={MessageCircle}
                title={emptyState.title}
                description={emptyState.description}
              />
            </div>
          ) : (
            <ConversationList
              items={filteredRooms}
              activeConversationId={activeConversationId}
              activeHref={location.pathname}
              compact={compact}
              onSelect={(href) => navigate(href)}
            />
          )}
        </div>
      </section>

      {!compact && isFetchingNextPage ? (
        <div className="flex justify-center py-2">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : null}

      {!compact && !isFetchingNextPage && hasNextPage ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()}>
            더보기
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function getEmptyState(filter: ConversationFilter, query: string) {
  const state: { title: string; description?: string } = {
    title: "대화가 없습니다",
  };

  if (query.trim()) {
    state.title = "검색 결과가 없습니다";
    return state;
  }

  if (filter !== "ALL") {
    state.title = "조건에 맞는 대화가 없습니다";
    return state;
  }

  return state;
}
