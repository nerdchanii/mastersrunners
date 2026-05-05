import { CalendarDays, Users } from "lucide-react";

import { TimeAgo } from "@/components/common/TimeAgo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Conversation } from "@/hooks/useMessages";
import { getConversationOtherUser, getConversationRoomMeta } from "@/lib/message-room";
import { cn } from "@/lib/utils";

interface ConversationListItemData {
  conversation: Conversation;
  lastMessage: Conversation["messages"][number] | null;
  meta: ReturnType<typeof getConversationRoomMeta>;
  otherUser: ReturnType<typeof getConversationOtherUser>;
}

interface ConversationListProps {
  items: ConversationListItemData[];
  activeConversationId?: string | null;
  activeHref?: string | null;
  compact?: boolean;
  onSelect: (href: string) => void;
}

export function ConversationList({
  items,
  activeConversationId,
  activeHref,
  compact = false,
  onSelect,
}: ConversationListProps) {
  return (
    <div className="divide-y divide-border/60">
      {items.map(({ conversation, lastMessage, meta, otherUser }) => {
        const isActive =
          conversation.id === activeConversationId ||
          (activeHref ? meta.href === activeHref : false);
        const rowHeightClass = compact ? "min-h-[84px]" : "min-h-[88px]";
        const participantCount =
          conversation.type === "DIRECT" ? null : conversation.participants.length;
        const secondaryLabel = conversation.type === "ACTIVITY" ? meta.secondaryTitle : null;

        return (
          <button
            key={conversation.id}
            type="button"
            data-testid={`conversation-row-${conversation.id}`}
            className={cn(
              "flex w-full items-start gap-3 text-left transition-colors",
              rowHeightClass,
              compact ? "px-3 py-3" : "px-3 py-3.5",
              isActive
                ? "bg-accent/65 shadow-[inset_2px_0_0_0_hsl(var(--foreground))]"
                : "hover:bg-accent/30",
            )}
            onClick={() => onSelect(meta.href)}
          >
            <RoomAvatar conversation={conversation} otherUser={otherUser} compact={compact} />

            <div className="min-w-0 flex-1 self-stretch">
              <div className="flex h-full min-h-0 items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="min-w-0">
                    <div
                      className={cn("flex items-center gap-2", compact ? "text-[13px]" : "text-sm")}
                    >
                      <h3 className="truncate font-semibold text-foreground">{meta.title}</h3>
                      {participantCount ? (
                        <span
                          className={cn(
                            "inline-flex shrink-0 items-center gap-1 text-muted-foreground",
                            compact ? "text-[11px]" : "text-xs",
                          )}
                        >
                          <Users className={compact ? "size-3" : "size-3.5"} />
                          <span>{participantCount}</span>
                        </span>
                      ) : null}
                    </div>

                    {secondaryLabel ? (
                      <div
                        className={cn(
                          "mt-1 truncate text-muted-foreground",
                          compact ? "text-[11px]" : "text-xs",
                        )}
                      >
                        {secondaryLabel}
                      </div>
                    ) : null}
                  </div>

                  <p
                    className={cn(
                      "mt-2 truncate",
                      compact ? "text-[12px]" : "text-sm",
                      conversation.unreadCount > 0
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {lastMessage?.content ?? "아직 대화가 없습니다."}
                  </p>
                </div>

                <div className="flex h-full shrink-0 flex-col items-end justify-between gap-2">
                  {lastMessage ? (
                    <span
                      className={cn(
                        "whitespace-nowrap text-muted-foreground",
                        compact ? "text-[11px]" : "text-xs",
                      )}
                    >
                      <TimeAgo date={lastMessage.createdAt} />
                    </span>
                  ) : (
                    <span />
                  )}

                  {conversation.unreadCount > 0 ? (
                    <Badge className="min-w-[20px] rounded-full px-1.5 text-[10px]">
                      {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                    </Badge>
                  ) : (
                    <span />
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function RoomAvatar({
  conversation,
  otherUser,
  compact,
}: {
  conversation: Conversation;
  otherUser: ReturnType<typeof getConversationOtherUser>;
  compact: boolean;
}) {
  const sizeClass = compact ? "size-10" : "size-12";
  const iconClass = compact ? "size-4" : "size-5";

  if (conversation.type === "DIRECT") {
    return (
      <Avatar className={cn(sizeClass, "shrink-0")}>
        {otherUser?.profileImage ? (
          <AvatarImage src={otherUser.profileImage} alt={otherUser.name} />
        ) : null}
        <AvatarFallback>{otherUser?.name?.[0] ?? "대"}</AvatarFallback>
      </Avatar>
    );
  }

  if (conversation.type === "CREW") {
    return (
      <Avatar className={cn(sizeClass, "shrink-0")}>
        {conversation.crew?.imageUrl ? (
          <AvatarImage src={conversation.crew.imageUrl} alt={conversation.crew.name} />
        ) : null}
        <AvatarFallback>{conversation.crew?.name?.[0] ?? "크"}</AvatarFallback>
      </Avatar>
    );
  }

  const Icon = conversation.type === "ACTIVITY" ? CalendarDays : Users;

  return (
    <div
      className={cn(
        sizeClass,
        "flex shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted text-foreground",
      )}
    >
      <Icon className={iconClass} aria-hidden="true" />
    </div>
  );
}
