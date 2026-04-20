import { useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

import { messageKeys, patchConversationSummary } from "@/hooks/useMessages";

import { API_BASE } from "./api-client";
import { useAuth } from "./auth-context";

interface ChatRealtimeMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  deletedAt: string | null;
  createdAt: string;
  sender: { id: string; name: string; profileImage: string | null };
}

type ChatMessageListener = (message: ChatRealtimeMessage) => void;

interface ChatRealtimeContextValue {
  subscribe: (conversationId: string, listener: ChatMessageListener) => () => void;
  sendMessage: (conversationId: string, content: string) => Promise<ChatRealtimeMessage>;
}

interface ChatRealtimeSendError {
  error: string;
}

const ChatRealtimeContext = createContext<ChatRealtimeContextValue>({
  subscribe: () => () => {},
  sendMessage: async () => {
    throw new Error("Chat realtime not connected");
  },
});

function resolveSocketOrigin() {
  return new URL(API_BASE).origin;
}

const SOCKET_PATH = "/api/v1/socket.io";

export function ChatRealtimeProvider({ children }: { children: ReactNode }) {
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

  const sendMessage = useCallback(
    (conversationId: string, content: string) =>
      new Promise<ChatRealtimeMessage>((resolve, reject) => {
        const socket = socketRef.current;
        if (!socket) {
          reject(new Error("채팅 연결이 준비되지 않았습니다."));
          return;
        }

        socket.timeout(5000).emit(
          "chat:send",
          {
            conversationId,
            content,
          },
          (
            error: Error | null,
            response?: ChatRealtimeMessage | ChatRealtimeSendError | string,
          ) => {
            if (error) {
              reject(new Error("메시지를 보내지 못했습니다."));
              return;
            }

            if (typeof response === "string") {
              reject(new Error(response));
              return;
            }

            if (response && "error" in response) {
              reject(new Error(response.error));
              return;
            }

            if (!response) {
              reject(new Error("메시지를 보내지 못했습니다."));
              return;
            }

            resolve(response);
          },
        );
      }),
    [],
  );

  useEffect(() => {
    if (!isAuthenticated || !user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(`${resolveSocketOrigin()}/conversations`, {
      path: SOCKET_PATH,
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      for (const conversationId of listenersRef.current.keys()) {
        socket.emit("chat:subscribe", { conversationId });
      }
    });

    socket.on("chat:message", (message: ChatRealtimeMessage) => {
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

      if (message.senderId !== userRef.current?.id) {
        queryClient.setQueryData(
          messageKeys.unreadCount(),
          (current: number | undefined) => (current ?? 0) + 1,
        );
      }

      const listeners = listenersRef.current.get(message.conversationId);
      listeners?.forEach((listener) => listener(message));
    });

    socket.on("connect_error", (error) => {
      console.error("Chat websocket error:", error);
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
    <ChatRealtimeContext.Provider value={{ subscribe, sendMessage }}>
      {children}
    </ChatRealtimeContext.Provider>
  );
}

export function useChatRealtime() {
  return useContext(ChatRealtimeContext);
}

export type { ChatRealtimeMessage };
