import { Test } from "@nestjs/testing";
import { ConversationsRepository } from "./conversations.repository";
import { DatabaseService } from "../../database/database.service";

const mockDatabaseService = {
  prisma: {
    conversation: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    conversationParticipant: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockDatabaseService.prisma)),
  },
};

describe("ConversationsRepository", () => {
  let repository: ConversationsRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ConversationsRepository,
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();
    repository = module.get(ConversationsRepository);
  });

  describe("findOrCreateDirect", () => {
    it("should create new conversation with 2 participants", async () => {
      const userId1 = "user-1";
      const userId2 = "user-2";

      mockDatabaseService.prisma.conversation.findFirst.mockResolvedValue(null);
      mockDatabaseService.prisma.conversation.create.mockResolvedValue({
        id: "conv-1",
        type: "DIRECT",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await repository.findOrCreateDirect(userId1, userId2);

      expect(mockDatabaseService.prisma.conversation.findFirst).toHaveBeenCalled();
      expect(mockDatabaseService.prisma.conversation.create).toHaveBeenCalledWith({
        data: {
          type: "DIRECT",
          participants: {
            create: [{ userId: userId1 }, { userId: userId2 }],
          },
        },
      });
      expect(result.id).toBe("conv-1");
    });

    it("should return existing conversation if already exists", async () => {
      const userId1 = "user-1";
      const userId2 = "user-2";
      const existingConversation = {
        id: "conv-1",
        type: "DIRECT",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDatabaseService.prisma.conversation.findFirst.mockResolvedValue(
        existingConversation,
      );

      const result = await repository.findOrCreateDirect(userId1, userId2);

      expect(mockDatabaseService.prisma.conversation.findFirst).toHaveBeenCalled();
      expect(mockDatabaseService.prisma.conversation.create).not.toHaveBeenCalled();
      expect(result).toEqual(existingConversation);
    });
  });

  describe("findByUserId", () => {
    it("should return conversations with pagination", async () => {
      const userId = "user-1";
      const conversations = [
        {
          id: "conv-1",
          type: "DIRECT",
          createdAt: new Date(),
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
              deletedAt: null,
            },
          ],
        },
      ];

      mockDatabaseService.prisma.conversation.findMany.mockResolvedValue(
        conversations,
      );

      const result = await repository.findByUserId(userId, undefined, 20);

      expect(mockDatabaseService.prisma.conversation.findMany).toHaveBeenCalledWith({
        where: {
          participants: {
            some: { userId },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
            },
          },
          messages: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 21,
      });
      expect(result).toEqual(conversations);
    });

    it("should support cursor pagination", async () => {
      const userId = "user-1";
      const cursor = "conv-1";

      mockDatabaseService.prisma.conversation.findMany.mockResolvedValue([]);

      await repository.findByUserId(userId, cursor, 20);

      expect(mockDatabaseService.prisma.conversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 1,
          cursor: { id: cursor },
        }),
      );
    });
  });

  describe("findById", () => {
    it("should return conversation with participants", async () => {
      const conversationId = "conv-1";
      const conversation = {
        id: conversationId,
        type: "DIRECT",
        participants: [
          { userId: "user-1", user: { id: "user-1", name: "User 1" } },
          { userId: "user-2", user: { id: "user-2", name: "User 2" } },
        ],
      };

      mockDatabaseService.prisma.conversation.findUnique.mockResolvedValue(
        conversation,
      );

      const result = await repository.findById(conversationId);

      expect(mockDatabaseService.prisma.conversation.findUnique).toHaveBeenCalledWith({
        where: { id: conversationId },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(conversation);
    });
  });

  describe("isParticipant", () => {
    it("should return true if user is participant", async () => {
      const conversationId = "conv-1";
      const userId = "user-1";

      mockDatabaseService.prisma.conversationParticipant.findFirst.mockResolvedValue({
        conversationId,
        userId,
      });

      const result = await repository.isParticipant(conversationId, userId);

      expect(result).toBe(true);
    });

    it("should return false if user is not participant", async () => {
      const conversationId = "conv-1";
      const userId = "user-1";

      mockDatabaseService.prisma.conversationParticipant.findFirst.mockResolvedValue(
        null,
      );

      const result = await repository.isParticipant(conversationId, userId);

      expect(result).toBe(false);
    });
  });

  describe("getMessages", () => {
    it("should return paginated messages", async () => {
      const conversationId = "conv-1";
      const messages = [
        {
          id: "msg-1",
          conversationId,
          senderId: "user-1",
          content: "Hello",
          deletedAt: null,
          createdAt: new Date(),
          sender: { id: "user-1", name: "User 1", profileImage: null },
        },
      ];

      mockDatabaseService.prisma.message.findMany.mockResolvedValue(messages);

      const result = await repository.getMessages(conversationId, undefined, 20);

      expect(mockDatabaseService.prisma.message.findMany).toHaveBeenCalledWith({
        where: {
          conversationId,
          deletedAt: null,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 21,
      });
      expect(result).toEqual(messages);
    });

    it("should support cursor pagination", async () => {
      const conversationId = "conv-1";
      const cursor = "msg-1";

      mockDatabaseService.prisma.message.findMany.mockResolvedValue([]);

      await repository.getMessages(conversationId, cursor, 20);

      expect(mockDatabaseService.prisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 1,
          cursor: { id: cursor },
        }),
      );
    });
  });

  describe("createMessage", () => {
    it("should create message and update conversation", async () => {
      const conversationId = "conv-1";
      const senderId = "user-1";
      const content = "Hello";
      const createdMessage = {
        id: "msg-1",
        conversationId,
        senderId,
        content,
        deletedAt: null,
        createdAt: new Date(),
      };

      mockDatabaseService.prisma.$transaction.mockImplementation(async (cb) => {
        return await cb(mockDatabaseService.prisma);
      });
      mockDatabaseService.prisma.message.create.mockResolvedValue(createdMessage);
      mockDatabaseService.prisma.conversation.update.mockResolvedValue({});

      const result = await repository.createMessage(conversationId, senderId, content);

      expect(mockDatabaseService.prisma.message.create).toHaveBeenCalledWith({
        data: {
          conversationId,
          senderId,
          content,
        },
      });
      expect(mockDatabaseService.prisma.conversation.update).toHaveBeenCalledWith({
        where: { id: conversationId },
        data: { updatedAt: expect.any(Date) },
      });
      expect(result).toEqual(createdMessage);
    });
  });

  describe("updateLastRead", () => {
    it("should update lastReadAt timestamp", async () => {
      const conversationId = "conv-1";
      const userId = "user-1";
      const now = new Date();

      mockDatabaseService.prisma.conversationParticipant.update.mockResolvedValue({
        conversationId,
        userId,
        lastReadAt: now,
      });

      await repository.updateLastRead(conversationId, userId);

      expect(
        mockDatabaseService.prisma.conversationParticipant.update,
      ).toHaveBeenCalledWith({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
        data: {
          lastReadAt: expect.any(Date),
        },
      });
    });
  });

  describe("deleteMessage", () => {
    it("should set deletedAt timestamp", async () => {
      const messageId = "msg-1";
      const deletedMessage = {
        id: messageId,
        deletedAt: new Date(),
      };

      mockDatabaseService.prisma.message.update.mockResolvedValue(deletedMessage);

      const result = await repository.deleteMessage(messageId);

      expect(mockDatabaseService.prisma.message.update).toHaveBeenCalledWith({
        where: { id: messageId },
        data: { deletedAt: expect.any(Date) },
      });
      expect(result).toEqual(deletedMessage);
    });
  });
});
