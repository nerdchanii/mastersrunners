import { useCallback, useEffect, useState } from "react";

import { api, API_BASE } from "@/lib/api-client";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  deletedAt: string | null;
  createdAt: string;
  sender: { id: string; name: string; profileImage: string | null };
}

export interface Conversation {
  id: string;
  type: "DIRECT";
  updatedAt: string;
  participants: Array<{
    userId: string;
    lastReadAt: string | null;
    user: { id: string; name: string; profileImage: string | null };
  }>;
}

interface ConversationDetailResponse {
  conversation: Conversation;
  messages: Message[];
  nextCursor: string | null;
}

function normalizeMessages(items: Message[]) {
  return [...items].reverse();
}

export function useMessageDetailPage(id?: string) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }, [id]);

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

    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }

    const eventSource = new EventSource(
      `${API_BASE}/conversations/sse?token=${encodeURIComponent(token)}`,
    );

    eventSource.addEventListener("new-message", (event) => {
      try {
        const message = JSON.parse(event.data) as Message;
        if (message.conversationId !== id) {
          return;
        }

        setMessages((prev) => {
          if (prev.some((item) => item.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
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
  }, [id, markAsRead]);

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

      try {
        const newMessage = await api.fetch<Message>(`/conversations/${id}/messages`, {
          method: "POST",
          body: JSON.stringify({ content }),
        });
        setMessages((prev) => [...prev, newMessage]);
        void markAsRead();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "메시지 전송에 실패했습니다.");
        return false;
      } finally {
        setSending(false);
      }
    },
    [id, markAsRead, sending],
  );

  return {
    conversation,
    error,
    loading,
    loadingMore,
    messages,
    nextCursor,
    sending,
    loadMore,
    retry,
    sendMessage,
  };
}
