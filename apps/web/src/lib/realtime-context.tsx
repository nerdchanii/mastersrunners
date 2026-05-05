import { useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

import { notificationKeys } from "@/hooks/notification-keys";
import { messageKeys, patchConversationSummary } from "@/hooks/useMessages";

import { API_BASE } from "./api-client";
import { useAuth } from "./auth-context";

export interface RealtimeChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  deletedAt: string | null;
  createdAt: string;
  sender: { id: string; name: string; profileImage: string | null };
}

type ChatMessageListener = (message: RealtimeChatMessage) => void | Promise<void>;

interface RealtimeAckError {
  error: string;
}

interface ChatUnreadUpdate {
  conversationId: string;
  unreadCount: number;
  totalUnreadCount: number | null;
}

interface NotificationUnreadUpdate {
  unreadCount: number | null;
}

interface RealtimeContextValue {
  subscribe: (conversationId: string, listener: ChatMessageListener) => () => void;
  sendMessage: (conversationId: string, content: string) => Promise<RealtimeChatMessage>;
  markConversationRead: (conversationId: string) => Promise<ChatUnreadUpdate & { ok: true }>;
  markNotificationRead: (
    notificationId: string,
  ) => Promise<NotificationUnreadUpdate & { ok: true }>;
  markAllNotificationsRead: () => Promise<NotificationUnreadUpdate & { ok: true }>;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  subscribe: () => () => {},
  sendMessage: async () => {
    throw new Error("Realtime socket not connected");
  },
  markConversationRead: async () => {
    throw new Error("Realtime socket not connected");
  },
  markNotificationRead: async () => {
    throw new Error("Realtime socket not connected");
  },
  markAllNotificationsRead: async () => {
    throw new Error("Realtime socket not connected");
  },
});

function resolveSocketOrigin() {
  return new URL(API_BASE).origin;
}

const SOCKET_PATH = "/api/v1/socket.io";

function isAckError(response: unknown): response is RealtimeAckError {
  return Boolean(response && typeof response === "object" && "error" in response);
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef(new Map<string, Set<ChatMessageListener>>());
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const subscribe = useCallback((conversationId: string, listener: ChatMessageListener) => {
    const listeners = listenersRef.current.get(conversationId) ?? new Set<ChatMessageListener>();
    const isFirstListener = listeners.size === 0;
    listeners.add(listener);
    listenersRef.current.set(conversationId, listeners);

    if (isFirstListener) {
      socketRef.current?.emit("chat:subscribe", { conversationId });
    }

    return () => {
      const registeredListeners = listenersRef.current.get(conversationId);
      if (!registeredListeners) {
        return;
      }

      registeredListeners.delete(listener);
      if (registeredListeners.size === 0) {
        listenersRef.current.delete(conversationId);
        socketRef.current?.emit("chat:unsubscribe", { conversationId });
      }
    };
  }, []);

  const emitWithAck = useCallback(
    <TResponse,>(
      event: string,
      payload?: unknown,
      fallbackMessage = "요청을 처리하지 못했습니다.",
    ) =>
      new Promise<TResponse>((resolve, reject) => {
        const socket = socketRef.current;
        if (!socket) {
          reject(new Error("실시간 연결이 준비되지 않았습니다."));
          return;
        }

        socket.timeout(5000).emit(event, payload, (error: Error | null, response?: TResponse) => {
          if (error) {
            reject(new Error(fallbackMessage));
            return;
          }

          if (typeof response === "string") {
            reject(new Error(response));
            return;
          }

          if (isAckError(response)) {
            reject(new Error(response.error));
            return;
          }

          if (!response) {
            reject(new Error(fallbackMessage));
            return;
          }

          resolve(response);
        });
      }),
    [],
  );

  const sendMessage = useCallback(
    (conversationId: string, content: string) =>
      emitWithAck<RealtimeChatMessage>(
        "chat:send",
        { conversationId, content },
        "메시지를 보내지 못했습니다.",
      ),
    [emitWithAck],
  );

  const markConversationRead = useCallback(
    (conversationId: string) =>
      emitWithAck<ChatUnreadUpdate & { ok: true }>(
        "chat:read",
        { conversationId },
        "읽음 상태를 반영하지 못했습니다.",
      ),
    [emitWithAck],
  );

  const markNotificationRead = useCallback(
    (notificationId: string) =>
      emitWithAck<NotificationUnreadUpdate & { ok: true }>(
        "notification:read",
        { notificationId },
        "알림 읽음 상태를 반영하지 못했습니다.",
      ),
    [emitWithAck],
  );

  const markAllNotificationsRead = useCallback(
    () =>
      emitWithAck<NotificationUnreadUpdate & { ok: true }>(
        "notification:read-all",
        undefined,
        "알림 읽음 상태를 반영하지 못했습니다.",
      ),
    [emitWithAck],
  );

  useEffect(() => {
    if (!isAuthenticated || !user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(`${resolveSocketOrigin()}/realtime`, {
      path: SOCKET_PATH,
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });

      for (const conversationId of listenersRef.current.keys()) {
        socket.emit("chat:subscribe", { conversationId });
      }
    });

    socket.on("chat:message", (message: RealtimeChatMessage) => {
      queryClient.setQueryData(messageKeys.conversations(), (current: unknown) =>
        patchConversationSummary(current as any, message.conversationId, (conversation) => ({
          ...conversation,
          updatedAt: message.createdAt,
          unreadCount:
            message.senderId === userRef.current?.id
              ? conversation.unreadCount
              : conversation.unreadCount + 1,
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

      const conversations = queryClient.getQueryData(messageKeys.conversations()) as
        | { pages?: Array<{ data?: Array<{ id: string }> }> }
        | undefined;
      const hasConversation = conversations?.pages?.some((page) =>
        page.data?.some((conversation) => conversation.id === message.conversationId),
      );
      if (!hasConversation) {
        queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
      }

      if (message.senderId !== userRef.current?.id) {
        queryClient.setQueryData(
          messageKeys.unreadCount(),
          (current: number | undefined) => (current ?? 0) + 1,
        );
      }

      const listeners = listenersRef.current.get(message.conversationId);
      listeners?.forEach((listener) => {
        void listener(message);
      });
    });

    socket.on("chat:unread:update", (update: ChatUnreadUpdate) => {
      if (typeof update.totalUnreadCount === "number") {
        queryClient.setQueryData(messageKeys.unreadCount(), update.totalUnreadCount);
      } else {
        queryClient.invalidateQueries({ queryKey: messageKeys.unreadCount() });
      }
      queryClient.setQueryData(messageKeys.conversations(), (current: unknown) =>
        patchConversationSummary(current as any, update.conversationId, (conversation) => ({
          ...conversation,
          unreadCount: update.unreadCount,
        })),
      );
    });

    socket.on("notification:new", () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      queryClient.setQueryData(
        notificationKeys.unreadCount(),
        (current: number | undefined) => (current ?? 0) + 1,
      );
    });

    socket.on("notification:unread:update", (update: NotificationUnreadUpdate) => {
      if (typeof update.unreadCount === "number") {
        queryClient.setQueryData(notificationKeys.unreadCount(), update.unreadCount);
      } else {
        queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Realtime websocket error:", error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, queryClient, user]);

  return (
    <RealtimeContext.Provider
      value={{
        subscribe,
        sendMessage,
        markConversationRead,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
