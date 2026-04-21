export interface ConversationUser {
  id: string;
  name: string;
  profileImage: string | null;
}

export interface ConversationParticipant {
  userId: string;
  lastReadAt: string | null;
  leftAt?: string | null;
  joinedAt?: string;
  user: ConversationUser;
}

interface ConversationCrewContext {
  id: string;
  name: string;
  imageUrl: string | null;
}

interface ConversationActivityContext {
  id: string;
  title: string;
  crewId: string;
  status: string;
  crew: ConversationCrewContext | null;
}

export interface ConversationSummaryMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

export interface ConversationRoom {
  id: string;
  type: "DIRECT" | "CREW" | "ACTIVITY";
  name: string | null;
  crewId: string | null;
  activityId: string | null;
  crew: ConversationCrewContext | null;
  activity: ConversationActivityContext | null;
  updatedAt: string;
  participants: ConversationParticipant[];
}

export interface ConversationListItem extends ConversationRoom {
  messages: ConversationSummaryMessage[];
  unreadCount: number;
}

export type ConversationRoomKind = ConversationListItem["type"];

interface ConversationRoomMeta {
  href: string;
  secondaryTitle: string | null;
  title: string;
}

export function getConversationOtherUser(
  conversation: Pick<ConversationRoom, "participants">,
  currentUserId?: string,
) {
  if (!currentUserId) {
    return conversation.participants[0]?.user ?? null;
  }

  return (
    conversation.participants.find((participant) => participant.userId !== currentUserId)?.user ??
    conversation.participants[0]?.user ??
    null
  );
}

export function getConversationRoomMeta(
  conversation: ConversationRoom,
  currentUserId?: string,
): ConversationRoomMeta {
  if (conversation.type === "ACTIVITY") {
    const crewName =
      conversation.activity?.crew?.name ??
      conversation.crew?.name ??
      (conversation.name?.trim() || null) ??
      "크루";
    const activityTitle =
      conversation.activity?.title ?? (conversation.name?.trim() || null) ?? "활동";

    return {
      href:
        conversation.activityId && (conversation.crewId ?? conversation.activity?.crewId)
          ? `/messages/crew/${conversation.crewId ?? conversation.activity?.crewId}/activity/${conversation.activityId}`
          : `/messages/${conversation.id}`,
      secondaryTitle: crewName,
      title: activityTitle,
    };
  }

  if (conversation.type === "CREW") {
    const title =
      conversation.crew?.name ??
      conversation.activity?.crew?.name ??
      conversation.name ??
      "크루 채팅";
    const crewId = conversation.crewId ?? conversation.activity?.crewId ?? null;

    return {
      href: crewId ? `/messages/crew/${crewId}` : `/messages/${conversation.id}`,
      secondaryTitle: null,
      title,
    };
  }

  const otherUser = getConversationOtherUser(conversation, currentUserId);

  return {
    href: `/messages/${conversation.id}`,
    secondaryTitle: null,
    title: otherUser?.name ?? conversation.name ?? "대화",
  };
}

export function matchesConversationQuery(
  conversation: ConversationListItem,
  currentUserId: string | undefined,
  rawQuery: string,
) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const roomMeta = getConversationRoomMeta(conversation, currentUserId);
  const haystack = [
    roomMeta.title,
    roomMeta.secondaryTitle,
    conversation.name,
    conversation.crew?.name,
    conversation.activity?.title,
    conversation.activity?.crew?.name,
    ...conversation.participants.map((participant) => participant.user.name),
    ...conversation.messages.map((message) => message.content),
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}
