import { WsException } from "@nestjs/websockets";

import { ConversationsGateway } from "./conversations.gateway.js";

describe("ConversationsGateway", () => {
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

  let gateway: ConversationsGateway;

  beforeEach(() => {
    jest.clearAllMocks();
    gateway = new ConversationsGateway(
      mockJwtService as never,
      mockConfigService as never,
      mockConversationsRepository as never,
      mockBlockRepository as never,
    );
    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as never;
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

  it("sends a chat message over websocket ack and broadcast", async () => {
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
    expect(gateway.server.to).toHaveBeenCalled();
  });
});
