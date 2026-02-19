import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface ChatUser {
  id: string;
  name: string;
  profileImage: string | null;
}

interface ChatParticipant {
  userId: string;
  lastReadAt: string | null;
  joinedAt: string;
  user: ChatUser;
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  sender: ChatUser;
  createdAt: string;
  deletedAt: string | null;
}

interface ChatConversation {
  id: string;
  type: string;
  name: string | null;
  crewId: string | null;
  activityId: string | null;
  participants: ChatParticipant[];
}

export interface ChatResponse {
  conversation: ChatConversation | null;
  messages: ChatMessage[];
  nextCursor: string | null;
}

export const groupChatKeys = {
  crew: (crewId: string) => ["crews", crewId, "chat"] as const,
  activity: (crewId: string, activityId: string) =>
    ["crews", crewId, "activities", activityId, "chat"] as const,
};

export function useCrewChat(crewId: string) {
  return useQuery({
    queryKey: groupChatKeys.crew(crewId),
    queryFn: () => api.fetch<ChatResponse>(`/crews/${crewId}/chat`),
    enabled: !!crewId,
    refetchInterval: 10000, // Poll every 10 seconds for new messages
  });
}

export function useActivityChat(crewId: string, activityId: string) {
  return useQuery({
    queryKey: groupChatKeys.activity(crewId, activityId),
    queryFn: () =>
      api.fetch<ChatResponse>(`/crews/${crewId}/activities/${activityId}/chat`),
    enabled: !!crewId && !!activityId,
    refetchInterval: 10000,
  });
}

export function useSendGroupMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
      crewId?: string;
      activityId?: string;
    }) =>
      api.fetch(`/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: (_r, vars) => {
      if (vars.crewId && vars.activityId) {
        queryClient.invalidateQueries({
          queryKey: groupChatKeys.activity(vars.crewId, vars.activityId),
        });
      } else if (vars.crewId) {
        queryClient.invalidateQueries({
          queryKey: groupChatKeys.crew(vars.crewId),
        });
      }
    },
  });
}
