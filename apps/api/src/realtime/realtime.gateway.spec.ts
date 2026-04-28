import { WsException } from "@nestjs/websockets";

import { RealtimeGateway } from "./realtime.gateway.js";
import { RealtimeEventsService } from "./realtime-events.service.js";

describe("RealtimeGateway", () => {
  const mockJwtService = {
    verifyAsync: jest.fn(),
  };
  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue("secret"),
  };
  const mockConversationsRepository = {
    isParticipant: jest.fn(),
    findById: jest.fn(),
    createMessage: jest.fn(),
    updateLastRead: jest.fn(),
    getTotalUnreadCount: jest.fn(),
  };
  const mockNotificationRepository = {
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    countUnread: jest.fn(),
  };
  const mockBlockRepository = {
    isBlocked: jest.fn(),
  };

  const createClient = (cookie?: string) =>
    ({
      handshake: { headers: { cookie } },
      data: {},
      join: jest.fn().mockResolvedValue(undefined),
      leave: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn(),
    }) as any;

  let events: RealtimeEventsService;
  let gateway: RealtimeGateway;

  beforeEach(() => {
    jest.clearAllMocks();
    events = new RealtimeEventsService();
    gateway = new RealtimeGateway(
      mockJwtService as never,
      mockConfigService as never,
      mockConversationsRepository as never,
      mockNotificationRepository as never,
      mockBlockRepository as never,
      events,
    );
    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as never;
    gateway.afterInit(gateway.server as never);
  });

  it("disconnects websocket clients without auth cookie", async () => {
    const client = createClient();

    await gateway.handleConnection(client);

    expect(client.disconnect).toHaveBeenCalledWith(true);
  });

  it("joins the user room when cookie auth is valid", async () => {
    const client = createClient("mr_access_token=token");
    mockJwtService.verifyAsync.mockResolvedValue({ sub: "user-1", email: "user@example.com" });

    await gateway.handleConnection(client);

    expect(client.data.user).toEqual({ userId: "user-1", email: "user@example.com" });
    expect(client.join).toHaveBeenCalledWith("user:user-1");
  });

  it("allows conversation participants to subscribe", async () => {
    const client = createClient("mr_access_token=token");
    client.data.user = { userId: "user-1" };
    mockConversationsRepository.isParticipant.mockResolvedValue(true);

    await expect(gateway.handleSubscribe(client, { conversationId: "conv-1" })).resolves.toEqual({
      ok: true,
      conversationId: "conv-1",
    });
    expect(client.join).toHaveBeenCalledWith("conversation:conv-1");
  });

  it("rejects subscribe when the user is not a participant", async () => {
    const client = createClient("mr_access_token=token");
    client.data.user = { userId: "user-1" };
    mockConversationsRepository.isParticipant.mockResolvedValue(false);

    await expect(gateway.handleSubscribe(client, { conversationId: "conv-1" })).rejects.toThrow(
      WsException,
    );
  });

  it("sends a chat message over websocket ack and broadcasts to conversation and user rooms", async () => {
    const client = createClient("mr_access_token=token");
    client.data.user = { userId: "user-1" };
    const message = {
      id: "msg-1",
      conversationId: "conv-1",
      senderId: "user-1",
      content: "hello",
      deletedAt: null,
      createdAt: new Date(),
      sender: { id: "user-1", name: "User 1", profileImage: null },
    };

    mockConversationsRepository.isParticipant.mockResolvedValue(true);
    mockConversationsRepository.findById.mockResolvedValue({
      id: "conv-1",
      type: "DIRECT",
      participants: [{ userId: "user-1" }, { userId: "user-2" }],
    });
    mockBlockRepository.isBlocked.mockResolvedValue(false);
    mockConversationsRepository.createMessage.mockResolvedValue(message);

    await expect(
      gateway.handleSend(client, { conversationId: "conv-1", content: "hello" }),
    ).resolves.toEqual(message);
    expect(mockConversationsRepository.createMessage).toHaveBeenCalledWith(
      "conv-1",
      "user-1",
      "hello",
    );
    expect(gateway.server.to).toHaveBeenCalledWith("conversation:conv-1");
    expect(gateway.server.to).toHaveBeenCalledWith("user:user-1");
    expect(gateway.server.to).toHaveBeenCalledWith("user:user-2");
    expect(gateway.server.emit).toHaveBeenCalledWith("chat:message", message);
  });

  it("rejects chat messages longer than the REST message contract", async () => {
    const client = createClient("mr_access_token=token");
    client.data.user = { userId: "user-1" };

    await expect(
      gateway.handleSend(client, { conversationId: "conv-1", content: "a".repeat(2001) }),
    ).rejects.toThrow(WsException);

    expect(mockConversationsRepository.isParticipant).not.toHaveBeenCalled();
    expect(mockConversationsRepository.createMessage).not.toHaveBeenCalled();
  });

  it("rejects chat messages whose raw payload exceeds the REST message contract before trim", async () => {
    const client = createClient("mr_access_token=token");
    client.data.user = { userId: "user-1" };

    await expect(
      gateway.handleSend(client, {
        conversationId: "conv-1",
        content: `${"a".repeat(1999)}  `,
      }),
    ).rejects.toThrow(WsException);

    expect(mockConversationsRepository.isParticipant).not.toHaveBeenCalled();
    expect(mockConversationsRepository.createMessage).not.toHaveBeenCalled();
  });

  it("marks a chat as read and emits the latest unread totals", async () => {
    const client = createClient("mr_access_token=token");
    client.data.user = { userId: "user-1" };
    mockConversationsRepository.isParticipant.mockResolvedValue(true);
    mockConversationsRepository.updateLastRead.mockResolvedValue({});
    mockConversationsRepository.getTotalUnreadCount.mockResolvedValue(4);

    await expect(gateway.handleChatRead(client, { conversationId: "conv-1" })).resolves.toEqual({
      ok: true,
      conversationId: "conv-1",
      unreadCount: 0,
      totalUnreadCount: 4,
    });

    expect(mockConversationsRepository.updateLastRead).toHaveBeenCalledWith("conv-1", "user-1");
    expect(gateway.server.to).toHaveBeenCalledWith("user:user-1");
    expect(gateway.server.emit).toHaveBeenCalledWith("chat:unread:update", {
      conversationId: "conv-1",
      unreadCount: 0,
      totalUnreadCount: 4,
    });
  });

  it("keeps chat read successful when unread total recount fails", async () => {
    const client = createClient("mr_access_token=token");
    client.data.user = { userId: "user-1" };
    mockConversationsRepository.isParticipant.mockResolvedValue(true);
    mockConversationsRepository.updateLastRead.mockResolvedValue({});
    mockConversationsRepository.getTotalUnreadCount.mockRejectedValue(new Error("count failed"));

    await expect(gateway.handleChatRead(client, { conversationId: "conv-1" })).resolves.toEqual({
      ok: true,
      conversationId: "conv-1",
      unreadCount: 0,
      totalUnreadCount: null,
    });

    expect(mockConversationsRepository.updateLastRead).toHaveBeenCalledWith("conv-1", "user-1");
    expect(gateway.server.emit).toHaveBeenCalledWith("chat:unread:update", {
      conversationId: "conv-1",
      unreadCount: 0,
      totalUnreadCount: null,
    });
  });

  it("marks a notification as read and emits the latest unread total", async () => {
    const client = createClient("mr_access_token=token");
    client.data.user = { userId: "user-1" };
    mockNotificationRepository.markAsRead.mockResolvedValue({ count: 1 });
    mockNotificationRepository.countUnread.mockResolvedValue(2);

    await expect(
      gateway.handleNotificationRead(client, { notificationId: "notif-1" }),
    ).resolves.toEqual({
      ok: true,
      unreadCount: 2,
    });

    expect(mockNotificationRepository.markAsRead).toHaveBeenCalledWith("notif-1", "user-1");
    expect(gateway.server.emit).toHaveBeenCalledWith("notification:unread:update", {
      unreadCount: 2,
    });
  });

  it("keeps notification read successful when unread recount fails", async () => {
    const client = createClient("mr_access_token=token");
    client.data.user = { userId: "user-1" };
    mockNotificationRepository.markAsRead.mockResolvedValue({ count: 1 });
    mockNotificationRepository.countUnread.mockRejectedValue(new Error("count failed"));

    await expect(
      gateway.handleNotificationRead(client, { notificationId: "notif-1" }),
    ).resolves.toEqual({
      ok: true,
      unreadCount: null,
    });

    expect(mockNotificationRepository.markAsRead).toHaveBeenCalledWith("notif-1", "user-1");
    expect(gateway.server.emit).toHaveBeenCalledWith("notification:unread:update", {
      unreadCount: null,
    });
  });

  it("marks all notifications as read without recounting unread totals", async () => {
    const client = createClient("mr_access_token=token");
    client.data.user = { userId: "user-1" };
    mockNotificationRepository.markAllAsRead.mockResolvedValue({ count: 3 });

    await expect(gateway.handleNotificationReadAll(client)).resolves.toEqual({
      ok: true,
      unreadCount: 0,
    });

    expect(mockNotificationRepository.markAllAsRead).toHaveBeenCalledWith("user-1");
    expect(mockNotificationRepository.countUnread).not.toHaveBeenCalled();
    expect(gateway.server.emit).toHaveBeenCalledWith("notification:unread:update", {
      unreadCount: 0,
    });
  });
});
