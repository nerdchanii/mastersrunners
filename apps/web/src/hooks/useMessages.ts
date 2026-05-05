import type { InfiniteData } from "@tanstack/react-query";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { ConversationListItem, ConversationParticipant } from "@/lib/message-room";

export type { ConversationListItem as Conversation, ConversationParticipant };

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  deletedAt: string | null;
  createdAt: string;
  sender: { id: string; name: string; profileImage: string | null };
}

interface ConversationsResponse {
  data: ConversationListItem[];
  nextCursor: string | null;
}

interface ConversationUnreadCountResponse {
  count: number;
}

export const messageKeys = {
  all: ["messages"] as const,
  conversations: () => [...messageKeys.all, "conversations"] as const,
  conversation: (id: string) => [...messageKeys.all, "conversation", id] as const,
  unreadCount: () => [...messageKeys.all, "unread-count"] as const,
};

export function patchConversationSummary(
  data: InfiniteData<ConversationsResponse> | undefined,
  conversationId: string,
  updater: (conversation: ConversationListItem) => ConversationListItem,
): InfiniteData<ConversationsResponse> | undefined {
  if (!data) {
    return data;
  }

  const pages = data.pages.map((page) => ({
    ...page,
    data: page.data.map((conversation) =>
      conversation.id === conversationId ? updater(conversation) : conversation,
    ),
  }));

  const foundConversation = pages
    .flatMap((page) => page.data)
    .find((item) => item.id === conversationId);
  if (!foundConversation || pages.length === 0) {
    return { ...data, pages };
  }

  const normalizedPages = pages.map((page) => ({
    ...page,
    data: page.data.filter((conversation) => conversation.id !== conversationId),
  }));
  normalizedPages[0] = {
    ...normalizedPages[0],
    data: [foundConversation, ...normalizedPages[0].data],
  };

  return {
    ...data,
    pages: normalizedPages,
  };
}

export function removeConversationSummary(
  data: InfiniteData<ConversationsResponse> | undefined,
  conversationId: string,
): InfiniteData<ConversationsResponse> | undefined {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: page.data.filter((conversation) => conversation.id !== conversationId),
    })),
  };
}

export function useConversations() {
  return useInfiniteQuery({
    queryKey: messageKeys.conversations(),
    queryFn: ({ pageParam }) => {
      let path = "/conversations?limit=20";
      if (pageParam) path += `&cursor=${encodeURIComponent(pageParam as string)}`;
      return api.fetch<ConversationsResponse>(path);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    staleTime: 30 * 1000,
    retry: 1,
  });
}

export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: messageKeys.conversation(conversationId),
    queryFn: ({ pageParam }) => {
      let path = `/conversations/${conversationId}?limit=50`;
      if (pageParam) path += `&cursor=${encodeURIComponent(pageParam as string)}`;
      return api.fetch<{ nextCursor?: string | null }>(path);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    enabled: !!conversationId,
    staleTime: 10 * 1000,
    retry: 1,
  });
}

export function useUnreadMessageCount(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: messageKeys.unreadCount(),
    queryFn: () => api.fetch<ConversationUnreadCountResponse>("/conversations/unread-count"),
    enabled: options?.enabled ?? true,
    staleTime: 30 * 1000,
    retry: 1,
    select: (data) => data?.count ?? 0,
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      api.fetch<Message>(`/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.conversation(conversationId) });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
    },
  });
}

export function useMarkAsRead(conversationId: string) {
  return useMutation({
    mutationFn: () => api.fetch(`/conversations/${conversationId}/read`, { method: "PATCH" }),
  });
}

export function useLeaveConversation(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.fetch(`/conversations/${conversationId}/leave`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.setQueryData(messageKeys.conversations(), (current: unknown) =>
        removeConversationSummary(
          current as InfiniteData<ConversationsResponse> | undefined,
          conversationId,
        ),
      );
      queryClient.invalidateQueries({ queryKey: messageKeys.unreadCount() });
      queryClient.removeQueries({ queryKey: messageKeys.conversation(conversationId) });
    },
  });
}

export function useWorkoutTypes() {
  return useQuery({
    queryKey: ["workoutTypes"],
    queryFn: () =>
      api.fetch<Array<{ id: string; name: string; category: string }>>("/workout-types"),
    select: (data) => (Array.isArray(data) ? data : []),
    staleTime: 5 * 60 * 1000, // 5분 캐시
    retry: 1,
  });
}
