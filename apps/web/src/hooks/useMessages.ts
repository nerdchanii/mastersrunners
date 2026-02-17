import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface ConversationParticipant {
  userId: string;
  lastReadAt: string | null;
  user: { id: string; name: string; profileImage: string | null };
}

export interface Conversation {
  id: string;
  type: "DIRECT";
  updatedAt: string;
  participants: ConversationParticipant[];
  messages: Array<{
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  }>;
  unreadCount: number;
}

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
  data: Conversation[];
  nextCursor: string | null;
}

interface ConversationDetailResponse {
  conversation: Omit<Conversation, "messages" | "unreadCount">;
  messages: Message[];
  nextCursor: string | null;
}

export const messageKeys = {
  all: ["messages"] as const,
  conversations: () => [...messageKeys.all, "conversations"] as const,
  conversation: (id: string) => [...messageKeys.all, "conversation", id] as const,
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
    mutationFn: () =>
      api.fetch(`/conversations/${conversationId}/read`, { method: "PATCH" }),
  });
}

export function useWorkoutTypes() {
  return useQuery({
    queryKey: ["workoutTypes"],
    queryFn: () => api.fetch<Array<{ id: string; name: string; category: string }>>("/workout-types"),
    select: (data) => (Array.isArray(data) ? data : []),
    staleTime: 5 * 60 * 1000, // 5분 캐시
    retry: 1,
  });
}
