import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { messageKeys, patchConversationSummary } from "@/hooks/useMessages";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import type { ConversationRoom, ConversationUser } from "@/lib/message-room";
import { type RealtimeChatMessage, useRealtime } from "@/lib/realtime-context";

export interface ChatWindowMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender: ConversationUser;
  content: string;
  createdAt: string;
  deletedAt: string | null;
}

interface ChatWindowResponse {
  conversation: ConversationRoom | null;
  messages: ChatWindowMessage[];
  olderCursor: string | null;
  newerCursor: string | null;
  firstUnreadMessageId: string | null;
}

export interface ChatWindowController extends ChatWindowResponse {
  loading: boolean;
  error: string | null;
  errorStatus: number | null;
  loadingOlder: boolean;
  loadingNewer: boolean;
  sending: boolean;
  sendError: string | null;
  pendingNewMessages: number;
  anchorMessageId: string | null;
  anchorVersion: number;
  bottomScrollVersion: number;
  clearSendError: () => void;
  loadOlder: () => Promise<void>;
  loadNewer: () => Promise<void>;
  retry: () => void;
  sendMessage: (content: string) => Promise<boolean>;
  setNearBottom: (value: boolean) => void;
}

interface UseChatWindowOptions {
  path: string;
  enabled?: boolean;
}

function appendQueryParams(path: string, params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }
    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

function mergeMessages(
  current: ChatWindowMessage[],
  incoming: ChatWindowMessage[],
): ChatWindowMessage[] {
  const byId = new Map(current.map((message) => [message.id, message] as const));
  for (const message of incoming) {
    byId.set(message.id, message);
  }

  return [...byId.values()].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

function hasMessage(messages: ChatWindowMessage[], messageId: string) {
  return messages.some((message) => message.id === messageId);
}

export function useChatWindow({
  path,
  enabled = true,
}: UseChatWindowOptions): ChatWindowController {
  const queryClient = useQueryClient();
  const { markConversationRead, sendMessage: sendRealtimeMessage, subscribe } = useRealtime();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<ConversationRoom | null>(null);
  const [messages, setMessages] = useState<ChatWindowMessage[]>([]);
  const [olderCursor, setOlderCursor] = useState<string | null>(null);
  const [newerCursor, setNewerCursor] = useState<string | null>(null);
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadingNewer, setLoadingNewer] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [pendingMessages, setPendingMessages] = useState<ChatWindowMessage[]>([]);
  const [anchorMessageId, setAnchorMessageId] = useState<string | null>(null);
  const [anchorVersion, setAnchorVersion] = useState(0);
  const [bottomScrollVersion, setBottomScrollVersion] = useState(0);
  const nearBottomRef = useRef(true);
  const messagesRef = useRef<ChatWindowMessage[]>([]);
  const newerCursorRef = useRef<string | null>(null);

  const markAsRead = useCallback(
    async (conversationId: string | null | undefined) => {
      if (!conversationId) {
        return;
      }

      try {
        try {
          const update = await markConversationRead(conversationId);
          if (typeof update.totalUnreadCount === "number") {
            queryClient.setQueryData(messageKeys.unreadCount(), update.totalUnreadCount);
          } else {
            queryClient.invalidateQueries({ queryKey: messageKeys.unreadCount() });
          }
        } catch {
          await api.fetch(`/conversations/${conversationId}/read`, { method: "PATCH" });
          queryClient.invalidateQueries({ queryKey: messageKeys.unreadCount() });
        }

        queryClient.setQueryData(messageKeys.conversations(), (current: unknown) =>
          patchConversationSummary(current as any, conversationId, (conversation) => ({
            ...conversation,
            unreadCount: 0,
          })),
        );
      } catch (markReadError) {
        console.error("Failed to mark chat as read:", markReadError);
      }
    },
    [markConversationRead, queryClient],
  );

  const fetchInitialWindow = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setLoading(true);
    setError(null);
    setErrorStatus(null);

    try {
      const data = await api.fetch<ChatWindowResponse>(
        appendQueryParams(path, {
          entry: "unread",
          historyLimit: 40,
          unreadLimit: 100,
        }),
      );

      setConversation(data.conversation);
      setMessages(data.messages ?? []);
      setOlderCursor(data.olderCursor ?? null);
      setNewerCursor(data.newerCursor ?? null);
      setFirstUnreadMessageId(data.firstUnreadMessageId ?? null);
      setPendingMessages([]);

      if (data.firstUnreadMessageId) {
        setAnchorMessageId(data.firstUnreadMessageId);
        setAnchorVersion((value) => value + 1);
      } else {
        setAnchorMessageId(null);
        setBottomScrollVersion((value) => value + 1);
      }

      await markAsRead(data.conversation?.id);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "대화를 불러오지 못했습니다.");
      setErrorStatus(fetchError instanceof ApiError ? fetchError.status : null);
    } finally {
      setLoading(false);
    }
  }, [enabled, markAsRead, path]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    newerCursorRef.current = newerCursor;
  }, [newerCursor]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    void fetchInitialWindow();
  }, [enabled, fetchInitialWindow]);

  useEffect(() => {
    const conversationId = conversation?.id;
    if (!conversationId) {
      return;
    }

    return subscribe(conversationId, async (message: RealtimeChatMessage) => {
      if (hasMessage(messagesRef.current, message.id)) {
        return;
      }

      if (message.senderId === user?.id) {
        setMessages((current) => mergeMessages(current, [message]));
        setBottomScrollVersion((value) => value + 1);
        return;
      }

      if (newerCursorRef.current || !nearBottomRef.current) {
        setPendingMessages((current) => mergeMessages(current, [message]));
        return;
      }

      setMessages((current) => mergeMessages(current, [message]));
      setBottomScrollVersion((value) => value + 1);
      await markAsRead(conversationId);
    });
  }, [conversation?.id, markAsRead, subscribe, user?.id]);

  const loadOlder = useCallback(async () => {
    const cursor = messagesRef.current[0]?.id ?? olderCursor;
    if (!cursor || loadingOlder) {
      return;
    }

    setLoadingOlder(true);
    try {
      const data = await api.fetch<ChatWindowResponse>(
        appendQueryParams(path, {
          direction: "older",
          cursor,
          limit: 40,
        }),
      );

      setMessages((current) => mergeMessages(data.messages ?? [], current));
      setOlderCursor(data.olderCursor ?? null);
      setNewerCursor(data.newerCursor ?? newerCursorRef.current);
      if (data.firstUnreadMessageId) {
        setFirstUnreadMessageId(data.firstUnreadMessageId);
      }
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : "이전 메시지를 불러오지 못했습니다.",
      );
      setErrorStatus(fetchError instanceof ApiError ? fetchError.status : null);
    } finally {
      setLoadingOlder(false);
    }
  }, [loadingOlder, olderCursor, path]);

  const loadNewer = useCallback(async () => {
    if (loadingNewer) {
      return;
    }

    if (!newerCursor) {
      if (pendingMessages.length > 0) {
        setMessages((current) => mergeMessages(current, pendingMessages));
        setPendingMessages([]);
        setBottomScrollVersion((value) => value + 1);
        await markAsRead(conversation?.id);
      }
      return;
    }

    const cursor = messagesRef.current.at(-1)?.id ?? newerCursor;
    setLoadingNewer(true);
    try {
      const data = await api.fetch<ChatWindowResponse>(
        appendQueryParams(path, {
          direction: "newer",
          cursor,
          limit: 100,
        }),
      );

      setMessages((current) => mergeMessages(current, data.messages ?? []));
      setOlderCursor(data.olderCursor ?? olderCursor);
      setNewerCursor(data.newerCursor ?? null);
      setPendingMessages([]);
      await markAsRead(data.conversation?.id ?? conversation?.id);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : "새 메시지를 불러오지 못했습니다.",
      );
      setErrorStatus(fetchError instanceof ApiError ? fetchError.status : null);
    } finally {
      setLoadingNewer(false);
    }
  }, [conversation?.id, loadingNewer, markAsRead, newerCursor, olderCursor, path, pendingMessages]);

  const sendMessage = useCallback(
    async (content: string) => {
      const conversationId = conversation?.id;
      if (!conversationId || !content.trim() || sending) {
        return false;
      }

      setSending(true);
      setSendError(null);

      try {
        const message = await sendRealtimeMessage(conversationId, content);

        setMessages((current) => mergeMessages(current, [message]));
        setBottomScrollVersion((value) => value + 1);
        queryClient.setQueryData(messageKeys.conversations(), (current: unknown) =>
          patchConversationSummary(current as any, conversationId, (conversation) => ({
            ...conversation,
            updatedAt: message.createdAt,
            unreadCount: 0,
            messages: [
              {
                id: message.id,
                senderId: message.senderId,
                content: message.content,
                createdAt: message.createdAt,
              },
            ],
          })),
        );
        await markAsRead(conversationId);
        return true;
      } catch (sendMessageError) {
        setSendError(
          sendMessageError instanceof Error
            ? sendMessageError.message
            : "메시지를 보내지 못했습니다.",
        );
        return false;
      } finally {
        setSending(false);
      }
    },
    [conversation?.id, markAsRead, queryClient, sendRealtimeMessage, sending],
  );

  const retry = useCallback(() => {
    void fetchInitialWindow();
  }, [fetchInitialWindow]);

  const setNearBottom = useCallback((value: boolean) => {
    nearBottomRef.current = value;
  }, []);

  const clearSendError = useCallback(() => {
    setSendError(null);
  }, []);

  return {
    conversation,
    messages,
    olderCursor,
    newerCursor,
    firstUnreadMessageId,
    loading,
    error,
    errorStatus,
    loadingOlder,
    loadingNewer,
    sending,
    sendError,
    pendingNewMessages: pendingMessages.length,
    anchorMessageId,
    anchorVersion,
    bottomScrollVersion,
    clearSendError,
    loadOlder,
    loadNewer,
    retry,
    sendMessage,
    setNearBottom,
  };
}
