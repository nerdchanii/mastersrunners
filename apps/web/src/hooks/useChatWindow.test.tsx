import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { type PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useChatWindow } from "./useChatWindow";

const { fetchMock, subscribeMock, sendRealtimeMessageMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  subscribeMock: vi.fn(),
  sendRealtimeMessageMock: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({
  api: {
    fetch: fetchMock,
  },
  ApiError: class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: { id: "user-1", name: "김러너" },
  }),
}));

vi.mock("@/lib/chat-realtime-context", () => ({
  useChatRealtime: () => ({
    subscribe: subscribeMock,
    sendMessage: sendRealtimeMessageMock,
  }),
}));

describe("useChatWindow", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    subscribeMock.mockReset();
    sendRealtimeMessageMock.mockReset();
  });

  it("keeps buffered incoming messages unread until they are loaded into view", async () => {
    let subscriptionListener:
      | ((message: {
          id: string;
          conversationId: string;
          senderId: string;
          content: string;
          createdAt: string;
          deletedAt: string | null;
          sender: { id: string; name: string; profileImage: string | null };
        }) => Promise<void>)
      | undefined;

    subscribeMock.mockImplementation(
      (
        _conversationId: string,
        listener: (message: {
          id: string;
          conversationId: string;
          senderId: string;
          content: string;
          createdAt: string;
          deletedAt: string | null;
          sender: { id: string; name: string; profileImage: string | null };
        }) => Promise<void>,
      ) => {
        subscriptionListener = listener;
        return () => {};
      },
    );

    fetchMock.mockImplementation((path: string, init?: RequestInit) => {
      if (
        path === "/conversations/conv-1?entry=unread&historyLimit=40&unreadLimit=100" &&
        init === undefined
      ) {
        return Promise.resolve({
          conversation: { id: "conv-1", participants: [] },
          messages: [
            {
              id: "message-1",
              conversationId: "conv-1",
              senderId: "user-2",
              content: "기존 메시지",
              createdAt: "2026-04-22T00:00:00.000Z",
              deletedAt: null,
              sender: { id: "user-2", name: "이러너", profileImage: null },
            },
          ],
          olderCursor: null,
          newerCursor: null,
          firstUnreadMessageId: null,
        });
      }

      if (path === "/conversations/conv-1/read" && init?.method === "PATCH") {
        return Promise.resolve({});
      }

      throw new Error(`Unexpected request: ${path}`);
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useChatWindow({ path: "/conversations/conv-1" }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchMock).toHaveBeenCalledWith("/conversations/conv-1/read", { method: "PATCH" });

    act(() => {
      result.current.setNearBottom(false);
    });

    await act(async () => {
      await subscriptionListener?.({
        id: "message-2",
        conversationId: "conv-1",
        senderId: "user-2",
        content: "새 메시지",
        createdAt: "2026-04-22T00:01:00.000Z",
        deletedAt: null,
        sender: { id: "user-2", name: "이러너", profileImage: null },
      });
    });

    expect(result.current.pendingNewMessages).toBe(1);
    expect(result.current.messages).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      await result.current.loadNewer();
    });

    expect(result.current.pendingNewMessages).toBe(0);
    expect(result.current.messages).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenLastCalledWith("/conversations/conv-1/read", { method: "PATCH" });
  });
});
