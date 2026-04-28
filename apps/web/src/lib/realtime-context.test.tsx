import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render } from "@testing-library/react";
import { type PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { messageKeys } from "@/hooks/useMessages";
import { notificationKeys } from "@/hooks/useNotifications";

import { RealtimeProvider } from "./realtime-context";

const { ioMock, socketMock, handlers } = vi.hoisted(() => {
  const handlers = new Map<string, (...args: any[]) => void>();
  const socketMock = {
    on: vi.fn((event: string, handler: (...args: any[]) => void) => {
      handlers.set(event, handler);
      return socketMock;
    }),
    emit: vi.fn(),
    disconnect: vi.fn(),
    timeout: vi.fn(() => socketMock),
  };
  return {
    handlers,
    socketMock,
    ioMock: vi.fn(() => socketMock),
  };
});

vi.mock("socket.io-client", () => ({
  io: ioMock,
}));

vi.mock("./api-client", () => ({
  API_BASE: "https://dev.mastersrunners.com/api/v1",
}));

vi.mock("./auth-context", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: "user-1", name: "김러너" },
  }),
}));

describe("RealtimeProvider", () => {
  beforeEach(() => {
    handlers.clear();
    ioMock.mockClear();
    socketMock.on.mockClear();
    socketMock.emit.mockClear();
    socketMock.disconnect.mockClear();
    socketMock.timeout.mockClear();
  });

  function renderProvider(queryClient: QueryClient) {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    return render(<RealtimeProvider>child</RealtimeProvider>, { wrapper });
  }

  it("opens one /realtime socket connection for authenticated users", () => {
    const queryClient = new QueryClient();

    renderProvider(queryClient);

    expect(ioMock).toHaveBeenCalledTimes(1);
    expect(ioMock).toHaveBeenCalledWith("https://dev.mastersrunners.com/realtime", {
      path: "/api/v1/socket.io",
      withCredentials: true,
      transports: ["websocket"],
    });
  });

  it("revalidates unread snapshots when the socket connects", () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    renderProvider(queryClient);

    act(() => {
      handlers.get("connect")?.();
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: messageKeys.unreadCount() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: messageKeys.conversations() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: notificationKeys.unreadCount(),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: notificationKeys.list() });
  });

  it("updates message unread cache from chat unread events", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(messageKeys.unreadCount(), 7);

    renderProvider(queryClient);

    act(() => {
      handlers.get("chat:unread:update")?.({
        conversationId: "conv-1",
        unreadCount: 0,
        totalUnreadCount: 4,
      });
    });

    expect(queryClient.getQueryData(messageKeys.unreadCount())).toBe(4);
  });

  it("revalidates message unread cache when chat unread event has no authoritative total", () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
    queryClient.setQueryData(messageKeys.unreadCount(), 7);

    renderProvider(queryClient);

    act(() => {
      handlers.get("chat:unread:update")?.({
        conversationId: "conv-1",
        unreadCount: 0,
        totalUnreadCount: null,
      });
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: messageKeys.unreadCount() });
  });

  it("updates notification unread cache from notification events", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(notificationKeys.unreadCount(), 5);

    renderProvider(queryClient);

    act(() => {
      handlers.get("notification:unread:update")?.({ unreadCount: 2 });
    });

    expect(queryClient.getQueryData(notificationKeys.unreadCount())).toBe(2);
  });

  it("revalidates notification unread cache when notification event has no authoritative count", () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
    queryClient.setQueryData(notificationKeys.unreadCount(), 5);

    renderProvider(queryClient);

    act(() => {
      handlers.get("notification:unread:update")?.({ unreadCount: null });
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: notificationKeys.unreadCount(),
    });
  });
});
