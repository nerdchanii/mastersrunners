import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { messageKeys } from "@/hooks/useMessages";
import { api, API_BASE } from "@/lib/api-client";
import type { ConversationRoom } from "@/lib/message-room";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  deletedAt: string | null;
  createdAt: string;
  sender: { id: string; name: string; profileImage: string | null };
}

export type Conversation = ConversationRoom;

interface ConversationDetailResponse {
  conversation: Conversation;
  messages: Message[];
  nextCursor: string | null;
}

function normalizeMessages(items: Message[]) {
  return [...items].reverse();
}

function appendUniqueMessage(items: Message[], next: Message) {
  if (items.some((message) => message.id === next.id)) {
    return items;
  }

  return [...items, next].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

export function useMessageDetailPage(id?: string) {
  const queryClient = useQueryClient();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const fetchConversation = useCallback(
    async (cursor?: string | null) => {
      if (!id) {
        return;
      }

      try {
        if (cursor) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        let path = `/conversations/${id}?limit=50`;
        if (cursor) {
          path += `&cursor=${encodeURIComponent(cursor)}`;
        }

        const data = await api.fetch<ConversationDetailResponse>(path);
        if (!data) {
          return;
        }

        const normalizedMessages = normalizeMessages(data.messages ?? []);
        setConversation(data.conversation);
        if (cursor) {
          setMessages((prev) => [...normalizedMessages, ...prev]);
        } else {
          setMessages(normalizedMessages);
        }
        setNextCursor(data.nextCursor ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [id],
  );

  const markAsRead = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      await api.fetch(`/conversations/${id}/read`, { method: "PATCH" });
      queryClient.invalidateQueries({ queryKey: messageKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }, [id, queryClient]);

  useEffect(() => {
    if (!id) {
      return;
    }

    void fetchConversation();
    void markAsRead();
  }, [fetchConversation, id, markAsRead]);

  useEffect(() => {
    if (!id) {
      return;
    }

    const eventSource = new EventSource(`${API_BASE}/conversations/sse`, {
      withCredentials: true,
    });

    eventSource.addEventListener("new-message", (event) => {
      try {
        const message = JSON.parse(event.data) as Message;
        if (message.conversationId !== id) {
          return;
        }

        setMessages((prev) => appendUniqueMessage(prev, message));
        queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
        void markAsRead();
      } catch (err) {
        console.error("Failed to parse SSE message:", err);
      }
    });

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
    };

    return () => {
      eventSource.close();
    };
  }, [id, markAsRead, queryClient]);

  const loadMore = useCallback(() => {
    if (!nextCursor || loadingMore) {
      return;
    }

    void fetchConversation(nextCursor);
  }, [fetchConversation, loadingMore, nextCursor]);

  const retry = useCallback(() => {
    void fetchConversation();
  }, [fetchConversation]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!id || !content.trim() || sending) {
        return false;
      }

      setSending(true);
      setSendError(null);

      try {
        const newMessage = await api.fetch<Message>(`/conversations/${id}/messages`, {
          method: "POST",
          body: JSON.stringify({ content }),
        });
        setMessages((prev) => appendUniqueMessage(prev, newMessage));
        queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
        void markAsRead();
        return true;
      } catch (err) {
        setSendError(err instanceof Error ? err.message : "메시지 전송에 실패했습니다.");
        return false;
      } finally {
        setSending(false);
      }
    },
    [id, markAsRead, queryClient, sending],
  );

  const clearSendError = useCallback(() => {
    setSendError(null);
  }, []);

  return {
    conversation,
    clearSendError,
    error,
    loading,
    loadingMore,
    messages,
    nextCursor,
    sendError,
    sending,
    loadMore,
    retry,
    sendMessage,
  };
}
