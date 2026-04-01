import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type {
  ConversationListItem,
  ConversationParticipant,
  ConversationRoom,
} from "@/lib/message-room";

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

interface ConversationDetailResponse {
  conversation: ConversationRoom;
  messages: Message[];
  nextCursor: string | null;
}

export const messageKeys = {
  all: ["messages"] as const,
  conversations: () => [...messageKeys.all, "conversations"] as const,
  conversation: (id: string) => [...messageKeys.all, "conversation", id] as const,
  unreadCount: () => [...messageKeys.all, "unread-count"] as const,
};

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
    refetchInterval: 10 * 1000,
  });
}

export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: messageKeys.conversation(conversationId),
    queryFn: ({ pageParam }) => {
      let path = `/conversations/${conversationId}?limit=50`;
      if (pageParam) path += `&cursor=${encodeURIComponent(pageParam as string)}`;
      return api.fetch<ConversationDetailResponse>(path);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    enabled: !!conversationId,
    staleTime: 10 * 1000,
    retry: 1,
    refetchInterval: 10 * 1000,
  });
}

export function useUnreadMessageCount(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: messageKeys.unreadCount(),
    queryFn: async () => {
      const data = await api.fetch<ConversationsResponse>("/conversations?limit=100");
      return data?.data?.reduce((sum, conversation) => sum + conversation.unreadCount, 0) ?? 0;
    },
    enabled: options?.enabled ?? true,
    staleTime: 30 * 1000,
    refetchInterval: 10 * 1000,
    retry: 1,
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
