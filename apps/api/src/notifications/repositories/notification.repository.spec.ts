import { Test } from "@nestjs/testing";
import { NotificationRepository } from "./notification.repository.js";
import { DatabaseService } from "../../database/database.service.js";

const mockPrisma = {
  notification: {
    create: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn(),
  },
};

describe("NotificationRepository", () => {
  let repository: NotificationRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        NotificationRepository,
        { provide: DatabaseService, useValue: { prisma: mockPrisma } },
      ],
    }).compile();
    repository = module.get(NotificationRepository);
  });

  describe("create", () => {
    it("should create a notification", async () => {
      const data = {
        userId: "user-1",
        actorId: "actor-1",
        type: "LIKE",
        referenceType: "POST",
        referenceId: "post-1",
        message: "회원님의 게시글을 좋아합니다.",
      };
      const mockResult = { id: "notif-1", ...data, isRead: false, createdAt: new Date() };
      mockPrisma.notification.create.mockResolvedValue(mockResult);

      const result = await repository.create(data);

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data,
        include: {
          actor: {
            select: { id: true, name: true, profileImage: true },
          },
        },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe("findByUser", () => {
    it("should find notifications by userId with cursor pagination", async () => {
      const userId = "user-1";
      const mockItems = [
        { id: "notif-1", userId, type: "LIKE", isRead: false, createdAt: new Date() },
        { id: "notif-2", userId, type: "COMMENT", isRead: false, createdAt: new Date() },
      ];
      mockPrisma.notification.findMany.mockResolvedValue(mockItems);

      const result = await repository.findByUser(userId, { limit: 20 });

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
          take: 21,
          orderBy: { createdAt: "desc" },
        }),
      );
      expect(result.data).toEqual(mockItems);
      expect(result.hasMore).toBe(false);
    });

    it("should filter unread notifications when unreadOnly is true", async () => {
      const userId = "user-1";
      mockPrisma.notification.findMany.mockResolvedValue([]);

      await repository.findByUser(userId, { unreadOnly: true });

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId, isRead: false },
        }),
      );
    });
  });

  describe("markAsRead", () => {
    it("should mark specific notification as read", async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 1 });

      const result = await repository.markAsRead("notif-1", "user-1");

      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { id: "notif-1", userId: "user-1" },
        data: { isRead: true },
      });
      expect(result.count).toBe(1);
    });
  });

  describe("markAllAsRead", () => {
    it("should mark all unread notifications as read", async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

      await repository.markAllAsRead("user-1");

      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-1", isRead: false },
        data: { isRead: true },
      });
    });
  });

  describe("countUnread", () => {
    it("should count unread notifications", async () => {
      mockPrisma.notification.count.mockResolvedValue(3);

      const result = await repository.countUnread("user-1");

      expect(mockPrisma.notification.count).toHaveBeenCalledWith({
        where: { userId: "user-1", isRead: false },
      });
      expect(result).toBe(3);
    });
  });
});
