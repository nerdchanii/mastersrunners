import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { BlockRepository } from "../block/repositories/block.repository";
import { RealtimeEventsService } from "../realtime/realtime-events.service";

import { ConversationsRepository } from "./repositories/conversations.repository";
import { ConversationsService } from "./conversations.service";

const mockConversationsRepository = {
  findOrCreateDirect: jest.fn(),
  findByUserId: jest.fn(),
  findById: jest.fn(),
  isParticipant: jest.fn(),
  getConversationWindow: jest.fn(),
  createMessage: jest.fn(),
  updateLastRead: jest.fn(),
  deleteMessage: jest.fn(),
  getUnreadCount: jest.fn(),
  getTotalUnreadCount: jest.fn(),
  getMessageById: jest.fn(),
  removeParticipant: jest.fn(),
  setParticipantLeftAt: jest.fn(),
};

const mockBlockRepository = {
  isBlocked: jest.fn(),
};

const mockRealtimeEvents = {
  emitChatMessage: jest.fn(),
  emitChatUnreadUpdate: jest.fn(),
};

describe("ConversationsService", () => {
  let service: ConversationsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ConversationsService,
        { provide: ConversationsRepository, useValue: mockConversationsRepository },
        { provide: BlockRepository, useValue: mockBlockRepository },
        { provide: RealtimeEventsService, useValue: mockRealtimeEvents },
      ],
    }).compile();
    service = module.get(ConversationsService);
  });

  describe("startConversation", () => {
    it("should create new conversation", async () => {
      const userId = "user-1";
      const participantId = "user-2";
      const conversation = {
        id: "conv-1",
        type: "DIRECT",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBlockRepository.isBlocked.mockResolvedValue(false);
      mockConversationsRepository.findOrCreateDirect.mockResolvedValue(conversation);

      const result = await service.startConversation(userId, participantId);

      expect(mockBlockRepository.isBlocked).toHaveBeenCalledWith(userId, participantId);
      expect(mockConversationsRepository.findOrCreateDirect).toHaveBeenCalledWith(
        userId,
        participantId,
      );
      expect(result).toEqual(conversation);
    });

    it("should return existing conversation if already exists", async () => {
      const userId = "user-1";
      const participantId = "user-2";
      const existingConversation = {
        id: "conv-1",
        type: "DIRECT",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBlockRepository.isBlocked.mockResolvedValue(false);
      mockConversationsRepository.findOrCreateDirect.mockResolvedValue(existingConversation);

      const result = await service.startConversation(userId, participantId);

      expect(result).toEqual(existingConversation);
    });

    it("should throw if trying to message self", async () => {
      const userId = "user-1";
      const participantId = "user-1";

      await expect(service.startConversation(userId, participantId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.startConversation(userId, participantId)).rejects.toThrow(
        "자기 자신에게 메시지를 보낼 수 없습니다.",
      );
    });

    it("should throw if user is blocked", async () => {
      const userId = "user-1";
      const participantId = "user-2";

      mockBlockRepository.isBlocked.mockResolvedValue(true);

      await expect(service.startConversation(userId, participantId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.startConversation(userId, participantId)).rejects.toThrow(
        "차단된 사용자와 대화를 시작할 수 없습니다.",
      );
    });
  });

  describe("getConversations", () => {
    it("should return conversations list with unread counts", async () => {
      const userId = "user-1";
      const conversations = [
        {
          id: "conv-1",
          type: "DIRECT",
          updatedAt: new Date(),
          participants: [
            { userId: "user-1", user: { id: "user-1", name: "User 1" } },
            { userId: "user-2", user: { id: "user-2", name: "User 2" } },
          ],
          messages: [
            {
              id: "msg-1",
              content: "Hello",
              senderId: "user-2",
              createdAt: new Date(),
            },
          ],
        },
        {
          id: "conv-2",
          type: "DIRECT",
          updatedAt: new Date(),
          participants: [
            { userId: "user-1", user: { id: "user-1", name: "User 1" } },
            { userId: "user-3", user: { id: "user-3", name: "User 3" } },
          ],
          messages: [],
        },
      ];

      mockConversationsRepository.findByUserId.mockResolvedValue(conversations);
      mockConversationsRepository.getUnreadCount.mockResolvedValue(2);

      const result = await service.getConversations(userId, undefined, 20);

      expect(mockConversationsRepository.findByUserId).toHaveBeenCalledWith(userId, undefined, 20);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].unreadCount).toBe(2);
      expect(result.nextCursor).toBeNull();
    });

    it("preserves crew and activity room identity metadata", async () => {
      const userId = "user-1";
      const conversations = [
        {
          id: "conv-crew",
          type: "CREW",
          crewId: "crew-1",
          activityId: null,
          crew: { id: "crew-1", name: "서울 러닝 크루" },
          activity: null,
          updatedAt: new Date(),
          participants: [],
          messages: [],
        },
        {
          id: "conv-activity",
          type: "ACTIVITY",
          crewId: "crew-1",
          activityId: "activity-1",
          crew: { id: "crew-1", name: "서울 러닝 크루" },
          activity: {
            id: "activity-1",
            title: "월요일 아침 러닝",
            crewId: "crew-1",
            status: "SCHEDULED",
            crew: { id: "crew-1", name: "서울 러닝 크루" },
          },
          updatedAt: new Date(),
          participants: [],
          messages: [],
        },
      ];

      mockConversationsRepository.findByUserId.mockResolvedValue(conversations);
      mockConversationsRepository.getUnreadCount.mockResolvedValue(0);

      const result = await service.getConversations(userId);

      expect(result.data[0]).toMatchObject({
        type: "CREW",
        crew: { id: "crew-1", name: "서울 러닝 크루" },
      });
      expect(result.data[1]).toMatchObject({
        type: "ACTIVITY",
        activity: {
          id: "activity-1",
          title: "월요일 아침 러닝",
        },
      });
    });

    it("should return nextCursor if more items exist", async () => {
      const userId = "user-1";
      const limit = 2;
      const conversations = [
        {
          id: "conv-1",
          type: "DIRECT",
          updatedAt: new Date(),
          participants: [],
          messages: [],
        },
        {
          id: "conv-2",
          type: "DIRECT",
          updatedAt: new Date(),
          participants: [],
          messages: [],
        },
        {
          id: "conv-3",
          type: "DIRECT",
          updatedAt: new Date(),
          participants: [],
          messages: [],
        },
      ];

      mockConversationsRepository.findByUserId.mockResolvedValue(conversations);
      mockConversationsRepository.getUnreadCount.mockResolvedValue(0);

      const result = await service.getConversations(userId, undefined, limit);

      expect(result.data).toHaveLength(2);
      expect(result.nextCursor).toBe("conv-2");
    });
  });

  describe("getConversation", () => {
    it("should return conversation with messages", async () => {
      const conversationId = "conv-1";
      const userId = "user-1";
      const now = new Date("2026-04-02T04:00:00.000Z");
      const conversation = {
        id: conversationId,
        type: "DIRECT",
        name: null,
        crewId: null,
        activityId: null,
        crew: null,
        activity: null,
        updatedAt: now,
        participants: [
          {
            userId: "user-1",
            lastReadAt: null,
            leftAt: null,
            joinedAt: now,
            user: { id: "user-1", name: "User 1", profileImage: null },
          },
          {
            userId: "user-2",
            lastReadAt: null,
            leftAt: null,
            joinedAt: now,
            user: { id: "user-2", name: "User 2", profileImage: null },
          },
        ],
      };
      const messages = [
        {
          id: "msg-1",
          conversationId,
          senderId: "user-2",
          content: "Hello",
          deletedAt: null,
          createdAt: now,
          sender: { id: "user-2", name: "User 2", profileImage: null },
        },
      ];

      mockConversationsRepository.findById.mockResolvedValue(conversation);
      mockConversationsRepository.isParticipant.mockResolvedValue(true);
      mockBlockRepository.isBlocked.mockResolvedValue(false);
      mockConversationsRepository.getConversationWindow.mockResolvedValue({
        messages,
        olderCursor: null,
        newerCursor: null,
        firstUnreadMessageId: null,
      });
      mockConversationsRepository.updateLastRead.mockResolvedValue({});

      const result = await service.getConversation(conversationId, userId);

      expect(mockConversationsRepository.findById).toHaveBeenCalledWith(conversationId);
      expect(mockConversationsRepository.isParticipant).toHaveBeenCalledWith(
        conversationId,
        userId,
      );
      expect(mockConversationsRepository.getConversationWindow).toHaveBeenCalledWith(
        conversationId,
        userId,
        {},
      );
      expect(result.conversation).toEqual(conversation);
      expect(result.messages).toEqual(messages);
      expect(result.olderCursor).toBeNull();
      expect(result.newerCursor).toBeNull();
      expect(result.firstUnreadMessageId).toBeNull();
    });

    it("should throw NotFoundException if conversation not found", async () => {
      const conversationId = "conv-1";
      const userId = "user-1";

      mockConversationsRepository.findById.mockResolvedValue(null);

      await expect(service.getConversation(conversationId, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getConversation(conversationId, userId)).rejects.toThrow(
        "대화를 찾을 수 없습니다.",
      );
    });

    it("should throw ForbiddenException if not participant", async () => {
      const conversationId = "conv-1";
      const userId = "user-1";
      const conversation = {
        id: conversationId,
        type: "DIRECT",
        participants: [
          { userId: "user-2", user: { id: "user-2", name: "User 2" } },
          { userId: "user-3", user: { id: "user-3", name: "User 3" } },
        ],
      };

      mockConversationsRepository.findById.mockResolvedValue(conversation);
      mockConversationsRepository.isParticipant.mockResolvedValue(false);

      await expect(service.getConversation(conversationId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.getConversation(conversationId, userId)).rejects.toThrow(
        "이 대화에 참여할 권한이 없습니다.",
      );
    });

    it("should throw ForbiddenException if other participant is blocked", async () => {
      const conversationId = "conv-1";
      const userId = "user-1";
      const otherUserId = "user-2";
      const conversation = {
        id: conversationId,
        type: "DIRECT",
        participants: [
          { userId, user: { id: userId, name: "User 1" } },
          { userId: otherUserId, user: { id: otherUserId, name: "User 2" } },
        ],
      };

      mockConversationsRepository.findById.mockResolvedValue(conversation);
      mockConversationsRepository.isParticipant.mockResolvedValue(true);
      mockBlockRepository.isBlocked.mockResolvedValue(true);

      await expect(service.getConversation(conversationId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.getConversation(conversationId, userId)).rejects.toThrow(
        "차단 관계로 인해 대화를 볼 수 없습니다.",
      );
    });

    it("does not apply direct-message block rules to crew conversations", async () => {
      const conversationId = "conv-crew";
      const userId = "user-1";
      const conversation = {
        id: conversationId,
        type: "CREW",
        name: "서울 러닝 크루",
        crewId: "crew-1",
        activityId: null,
        crew: { id: "crew-1", name: "서울 러닝 크루", imageUrl: null },
        activity: null,
        updatedAt: new Date("2026-04-22T00:00:00.000Z"),
        participants: [
          {
            userId,
            lastReadAt: null,
            leftAt: null,
            joinedAt: new Date("2026-04-20T00:00:00.000Z"),
            user: { id: userId, name: "User 1", profileImage: null },
          },
          {
            userId: "user-2",
            lastReadAt: null,
            leftAt: null,
            joinedAt: new Date("2026-04-20T00:00:00.000Z"),
            user: { id: "user-2", name: "User 2", profileImage: null },
          },
          {
            userId: "user-3",
            lastReadAt: null,
            leftAt: null,
            joinedAt: new Date("2026-04-20T00:00:00.000Z"),
            user: { id: "user-3", name: "User 3", profileImage: null },
          },
        ],
      };

      mockConversationsRepository.findById.mockResolvedValue(conversation);
      mockConversationsRepository.isParticipant.mockResolvedValue(true);
      mockConversationsRepository.getConversationWindow.mockResolvedValue({
        messages: [],
        olderCursor: null,
        newerCursor: null,
        firstUnreadMessageId: null,
      });
      mockConversationsRepository.updateLastRead.mockResolvedValue({});

      await expect(service.getConversation(conversationId, userId)).resolves.toMatchObject({
        conversation: expect.objectContaining({ id: conversationId, type: "CREW" }),
      });
      expect(mockBlockRepository.isBlocked).not.toHaveBeenCalled();
    });

    it("rejects direct conversation detail when the user left and no newer message exists", async () => {
      const conversationId = "conv-hidden";
      const userId = "user-1";
      const now = new Date("2026-04-21T09:00:00.000Z");

      mockConversationsRepository.findById.mockResolvedValue({
        id: conversationId,
        type: "DIRECT",
        name: null,
        crewId: null,
        activityId: null,
        crew: null,
        activity: null,
        updatedAt: now,
        participants: [
          {
            userId,
            lastReadAt: now,
            leftAt: now,
            joinedAt: now,
            user: { id: userId, name: "User 1", profileImage: null },
          },
          {
            userId: "user-2",
            lastReadAt: null,
            leftAt: null,
            joinedAt: now,
            user: { id: "user-2", name: "User 2", profileImage: null },
          },
        ],
      });
      mockConversationsRepository.isParticipant.mockResolvedValue(true);
      mockBlockRepository.isBlocked.mockResolvedValue(false);
      mockConversationsRepository.getConversationWindow.mockResolvedValue({
        messages: [],
        olderCursor: null,
        newerCursor: null,
        firstUnreadMessageId: null,
      });
      mockConversationsRepository.updateLastRead.mockResolvedValue({});

      await expect(service.getConversation(conversationId, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockConversationsRepository.updateLastRead).not.toHaveBeenCalled();
    });
  });

  describe("getUnreadCount", () => {
    it("returns the lightweight unread total for the current user", async () => {
      mockConversationsRepository.getTotalUnreadCount.mockResolvedValue(7);

      await expect(service.getUnreadCount("user-1")).resolves.toEqual({ count: 7 });
      expect(mockConversationsRepository.getTotalUnreadCount).toHaveBeenCalledWith("user-1");
    });
  });

  describe("sendMessage", () => {
    it("should create message and update conversation", async () => {
      const conversationId = "conv-1";
      const userId = "user-1";
      const content = "Hello";
      const otherUserId = "user-2";
      const conversation = {
        id: conversationId,
        type: "DIRECT",
        participants: [{ userId: "user-1" }, { userId: otherUserId }],
      };
      const createdMessage = {
        id: "msg-1",
        conversationId,
        senderId: userId,
        content,
        createdAt: new Date(),
        deletedAt: null,
      };

      mockConversationsRepository.isParticipant.mockResolvedValue(true);
      mockConversationsRepository.findById.mockResolvedValue(conversation);
      mockBlockRepository.isBlocked.mockResolvedValue(false);
      mockConversationsRepository.createMessage.mockResolvedValue(createdMessage);

      const result = await service.sendMessage(conversationId, userId, content);

      expect(mockConversationsRepository.isParticipant).toHaveBeenCalledWith(
        conversationId,
        userId,
      );
      expect(mockBlockRepository.isBlocked).toHaveBeenCalledWith(userId, otherUserId);
      expect(mockConversationsRepository.createMessage).toHaveBeenCalledWith(
        conversationId,
        userId,
        content,
      );
      expect(result).toEqual(createdMessage);
    });

    it("should throw if not participant", async () => {
      const conversationId = "conv-1";
      const userId = "user-1";
      const content = "Hello";

      mockConversationsRepository.isParticipant.mockResolvedValue(false);

      await expect(service.sendMessage(conversationId, userId, content)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.sendMessage(conversationId, userId, content)).rejects.toThrow(
        "이 대화에 참여할 권한이 없습니다.",
      );
    });

    it("should throw if blocked", async () => {
      const conversationId = "conv-1";
      const userId = "user-1";
      const content = "Hello";
      const otherUserId = "user-2";
      const conversation = {
        id: conversationId,
        type: "DIRECT",
        participants: [{ userId: "user-1" }, { userId: otherUserId }],
      };

      mockConversationsRepository.isParticipant.mockResolvedValue(true);
      mockConversationsRepository.findById.mockResolvedValue(conversation);
      mockBlockRepository.isBlocked.mockResolvedValue(true);

      await expect(service.sendMessage(conversationId, userId, content)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.sendMessage(conversationId, userId, content)).rejects.toThrow(
        "차단된 사용자에게 메시지를 보낼 수 없습니다.",
      );
    });

    it("does not apply direct-message block rules to crew chat sends", async () => {
      const conversationId = "conv-crew";
      const userId = "user-1";
      const content = "Hello";
      const conversation = {
        id: conversationId,
        type: "CREW",
        participants: [{ userId: "user-1" }, { userId: "user-2" }, { userId: "user-3" }],
      };
      const createdMessage = {
        id: "msg-1",
        conversationId,
        senderId: userId,
        content,
        createdAt: new Date(),
        deletedAt: null,
      };

      mockConversationsRepository.isParticipant.mockResolvedValue(true);
      mockConversationsRepository.findById.mockResolvedValue(conversation);
      mockConversationsRepository.createMessage.mockResolvedValue(createdMessage);

      await expect(service.sendMessage(conversationId, userId, content)).resolves.toEqual(
        createdMessage,
      );
      expect(mockBlockRepository.isBlocked).not.toHaveBeenCalled();
    });

    it("should emit websocket event to all conversation participants when message is created", async () => {
      const conversationId = "conv-1";
      const userId = "user-1";
      const recipientId = "user-2";
      const content = "Hello";
      const conversation = {
        id: conversationId,
        type: "DIRECT",
        participants: [{ userId: "user-1" }, { userId: recipientId }],
      };
      const createdMessage = {
        id: "msg-1",
        conversationId,
        senderId: userId,
        content,
        createdAt: new Date(),
        deletedAt: null,
        sender: { id: userId, name: "User 1", profileImage: null },
      };

      mockConversationsRepository.isParticipant.mockResolvedValue(true);
      mockConversationsRepository.findById.mockResolvedValue(conversation);
      mockBlockRepository.isBlocked.mockResolvedValue(false);
      mockConversationsRepository.createMessage.mockResolvedValue(createdMessage);

      await service.sendMessage(conversationId, userId, content);

      expect(mockRealtimeEvents.emitChatMessage).toHaveBeenCalledWith(
        conversationId,
        [userId, recipientId],
        createdMessage,
      );
    });
  });

  describe("markAsRead", () => {
    it("should update lastReadAt", async () => {
      const conversationId = "conv-1";
      const userId = "user-1";

      mockConversationsRepository.isParticipant.mockResolvedValue(true);
      mockConversationsRepository.updateLastRead.mockResolvedValue({
        conversationId,
        userId,
        lastReadAt: new Date(),
      });
      mockConversationsRepository.getTotalUnreadCount.mockResolvedValue(3);

      await service.markAsRead(conversationId, userId);

      expect(mockConversationsRepository.isParticipant).toHaveBeenCalledWith(
        conversationId,
        userId,
      );
      expect(mockConversationsRepository.updateLastRead).toHaveBeenCalledWith(
        conversationId,
        userId,
      );
      expect(mockRealtimeEvents.emitChatUnreadUpdate).toHaveBeenCalledWith(userId, {
        conversationId,
        unreadCount: 0,
        totalUnreadCount: 3,
      });
    });

    it("should keep read successful when unread total refresh fails", async () => {
      const conversationId = "conv-1";
      const userId = "user-1";

      mockConversationsRepository.isParticipant.mockResolvedValue(true);
      mockConversationsRepository.updateLastRead.mockResolvedValue({
        conversationId,
        userId,
        lastReadAt: new Date(),
      });
      mockConversationsRepository.getTotalUnreadCount.mockRejectedValue(new Error("count failed"));

      await expect(service.markAsRead(conversationId, userId)).resolves.toMatchObject({
        conversationId,
        userId,
      });

      expect(mockRealtimeEvents.emitChatUnreadUpdate).toHaveBeenCalledWith(userId, {
        conversationId,
        unreadCount: 0,
        totalUnreadCount: null,
      });
    });

    it("should throw if not participant", async () => {
      const conversationId = "conv-1";
      const userId = "user-1";

      mockConversationsRepository.isParticipant.mockResolvedValue(false);

      await expect(service.markAsRead(conversationId, userId)).rejects.toThrow(ForbiddenException);
      await expect(service.markAsRead(conversationId, userId)).rejects.toThrow(
        "이 대화에 참여할 권한이 없습니다.",
      );
    });
  });

  describe("leaveConversation", () => {
    it("allows leaving direct conversations", async () => {
      mockConversationsRepository.findById.mockResolvedValue({
        id: "conv-1",
        type: "DIRECT",
        participants: [{ userId: "user-1" }, { userId: "user-2" }],
      });
      mockConversationsRepository.setParticipantLeftAt.mockResolvedValue({
        conversationId: "conv-1",
        userId: "user-1",
        leftAt: new Date(),
      });

      await expect(service.leaveConversation("conv-1", "user-1")).resolves.toEqual({
        id: "conv-1",
      });
      expect(mockConversationsRepository.setParticipantLeftAt).toHaveBeenCalledWith(
        "conv-1",
        "user-1",
        expect.any(Date),
      );
    });

    it("rejects leaving crew chat", async () => {
      mockConversationsRepository.findById.mockResolvedValue({
        id: "conv-crew",
        type: "CREW",
        participants: [{ userId: "user-1" }],
      });

      await expect(service.leaveConversation("conv-crew", "user-1")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("deleteMessage", () => {
    it("should soft delete own message and return { id }", async () => {
      const messageId = "msg-1";
      const userId = "user-1";
      const message = {
        id: messageId,
        senderId: userId,
        content: "Hello",
        deletedAt: null,
      };

      mockConversationsRepository.getMessageById.mockResolvedValue(message);
      mockConversationsRepository.deleteMessage.mockResolvedValue(undefined);

      const result = await service.deleteMessage(messageId, userId);

      expect(mockConversationsRepository.getMessageById).toHaveBeenCalledWith(messageId);
      expect(mockConversationsRepository.deleteMessage).toHaveBeenCalledWith(messageId);
      expect(result).toEqual({ id: messageId });
    });

    it("should throw NotFoundException if message not found", async () => {
      const messageId = "msg-1";
      const userId = "user-1";

      mockConversationsRepository.getMessageById.mockResolvedValue(null);

      await expect(service.deleteMessage(messageId, userId)).rejects.toThrow(NotFoundException);
      await expect(service.deleteMessage(messageId, userId)).rejects.toThrow(
        "메시지를 찾을 수 없습니다.",
      );
    });

    it("should throw NotFoundException if message is already deleted", async () => {
      const messageId = "msg-1";
      const userId = "user-1";
      const message = {
        id: messageId,
        senderId: userId,
        content: "Hello",
        deletedAt: new Date(),
      };

      mockConversationsRepository.getMessageById.mockResolvedValue(message);

      await expect(service.deleteMessage(messageId, userId)).rejects.toThrow(NotFoundException);
      await expect(service.deleteMessage(messageId, userId)).rejects.toThrow(
        "메시지를 찾을 수 없습니다.",
      );
    });

    it("should throw ForbiddenException if not own message", async () => {
      const messageId = "msg-1";
      const userId = "user-1";
      const message = {
        id: messageId,
        senderId: "user-2",
        content: "Hello",
        deletedAt: null,
      };

      mockConversationsRepository.getMessageById.mockResolvedValue(message);

      await expect(service.deleteMessage(messageId, userId)).rejects.toThrow(ForbiddenException);
      await expect(service.deleteMessage(messageId, userId)).rejects.toThrow(
        "본인의 메시지만 삭제할 수 있습니다.",
      );
    });
  });
});
