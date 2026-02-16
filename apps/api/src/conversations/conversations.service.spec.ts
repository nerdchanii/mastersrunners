import { Test } from "@nestjs/testing";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { ConversationsService } from "./conversations.service";
import { ConversationsRepository } from "./repositories/conversations.repository";
import { BlockRepository } from "../block/repositories/block.repository";
import { ConversationsSseService } from "./conversations-sse.service";

const mockConversationsRepository = {
  findOrCreateDirect: jest.fn(),
  findByUserId: jest.fn(),
  findById: jest.fn(),
  isParticipant: jest.fn(),
  getMessages: jest.fn(),
  createMessage: jest.fn(),
  updateLastRead: jest.fn(),
  deleteMessage: jest.fn(),
  getUnreadCount: jest.fn(),
  getMessageById: jest.fn(),
};

const mockBlockRepository = {
  isBlocked: jest.fn(),
};

const mockSseService = {
  sendToUser: jest.fn(),
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
        { provide: ConversationsSseService, useValue: mockSseService },
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
      mockConversationsRepository.findOrCreateDirect.mockResolvedValue(
        existingConversation,
      );

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

      expect(mockConversationsRepository.findByUserId).toHaveBeenCalledWith(
        userId,
        undefined,
        20,
      );
      expect(result.data).toHaveLength(2);
      expect(result.data[0].unreadCount).toBe(2);
      expect(result.nextCursor).toBeNull();
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
      const conversation = {
        id: conversationId,
        type: "DIRECT",
        participants: [
          { userId: "user-1", user: { id: "user-1", name: "User 1" } },
          { userId: "user-2", user: { id: "user-2", name: "User 2" } },
        ],
      };
      const messages = [
        {
          id: "msg-1",
          conversationId,
          senderId: "user-2",
          content: "Hello",
          createdAt: new Date(),
          sender: { id: "user-2", name: "User 2" },
        },
      ];

      mockConversationsRepository.findById.mockResolvedValue(conversation);
      mockConversationsRepository.isParticipant.mockResolvedValue(true);
      mockConversationsRepository.getMessages.mockResolvedValue(messages);

      const result = await service.getConversation(conversationId, userId);

      expect(mockConversationsRepository.findById).toHaveBeenCalledWith(conversationId);
      expect(mockConversationsRepository.isParticipant).toHaveBeenCalledWith(
        conversationId,
        userId,
      );
      expect(mockConversationsRepository.getMessages).toHaveBeenCalledWith(
        conversationId,
        undefined,
        50,
      );
      expect(result.conversation).toEqual(conversation);
      expect(result.messages).toHaveLength(1);
    });

    it("should throw NotFoundException if conversation not found", async () => {
      const conversationId = "conv-1";
      const userId = "user-1";

      mockConversationsRepository.findById.mockResolvedValue(null);

      await expect(
        service.getConversation(conversationId, userId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getConversation(conversationId, userId),
      ).rejects.toThrow("대화를 찾을 수 없습니다.");
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

      await expect(
        service.getConversation(conversationId, userId),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.getConversation(conversationId, userId),
      ).rejects.toThrow("이 대화에 참여할 권한이 없습니다.");
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
        participants: [
          { userId: "user-1" },
          { userId: otherUserId },
        ],
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

      await expect(
        service.sendMessage(conversationId, userId, content),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.sendMessage(conversationId, userId, content),
      ).rejects.toThrow("이 대화에 참여할 권한이 없습니다.");
    });

    it("should throw if blocked", async () => {
      const conversationId = "conv-1";
      const userId = "user-1";
      const content = "Hello";
      const otherUserId = "user-2";
      const conversation = {
        id: conversationId,
        participants: [
          { userId: "user-1" },
          { userId: otherUserId },
        ],
      };

      mockConversationsRepository.isParticipant.mockResolvedValue(true);
      mockConversationsRepository.findById.mockResolvedValue(conversation);
      mockBlockRepository.isBlocked.mockResolvedValue(true);

      await expect(
        service.sendMessage(conversationId, userId, content),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.sendMessage(conversationId, userId, content),
      ).rejects.toThrow("차단된 사용자에게 메시지를 보낼 수 없습니다.");
    });

    it("should send SSE event to recipient when message is created", async () => {
      const conversationId = "conv-1";
      const userId = "user-1";
      const recipientId = "user-2";
      const content = "Hello";
      const conversation = {
        id: conversationId,
        participants: [
          { userId: "user-1" },
          { userId: recipientId },
        ],
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

      expect(mockSseService.sendToUser).toHaveBeenCalledWith(recipientId, createdMessage);
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

      await service.markAsRead(conversationId, userId);

      expect(mockConversationsRepository.isParticipant).toHaveBeenCalledWith(
        conversationId,
        userId,
      );
      expect(mockConversationsRepository.updateLastRead).toHaveBeenCalledWith(
        conversationId,
        userId,
      );
    });

    it("should throw if not participant", async () => {
      const conversationId = "conv-1";
      const userId = "user-1";

      mockConversationsRepository.isParticipant.mockResolvedValue(false);

      await expect(service.markAsRead(conversationId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.markAsRead(conversationId, userId)).rejects.toThrow(
        "이 대화에 참여할 권한이 없습니다.",
      );
    });
  });

  describe("deleteMessage", () => {
    it("should soft delete own message", async () => {
      const messageId = "msg-1";
      const userId = "user-1";
      const message = {
        id: messageId,
        senderId: userId,
        content: "Hello",
        deletedAt: null,
      };
      const deletedMessage = {
        ...message,
        deletedAt: new Date(),
      };

      mockConversationsRepository.getMessageById.mockResolvedValue(message);
      mockConversationsRepository.deleteMessage.mockResolvedValue(deletedMessage);

      const result = await service.deleteMessage(messageId, userId);

      expect(mockConversationsRepository.getMessageById).toHaveBeenCalledWith(messageId);
      expect(mockConversationsRepository.deleteMessage).toHaveBeenCalledWith(messageId);
      expect(result).toEqual(deletedMessage);
    });

    it("should throw NotFoundException if message not found", async () => {
      const messageId = "msg-1";
      const userId = "user-1";

      mockConversationsRepository.getMessageById.mockResolvedValue(null);

      await expect(service.deleteMessage(messageId, userId)).rejects.toThrow(
        NotFoundException,
      );
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

      await expect(service.deleteMessage(messageId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.deleteMessage(messageId, userId)).rejects.toThrow(
        "본인의 메시지만 삭제할 수 있습니다.",
      );
    });
  });
});
