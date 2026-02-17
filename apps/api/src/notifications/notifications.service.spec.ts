import { Test } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { NotificationsService } from "./notifications.service.js";
import { NotificationRepository } from "./repositories/notification.repository.js";
import { NotificationsSseService } from "./notifications-sse.service.js";

const mockRepo = {
  create: jest.fn(),
  findByUser: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  countUnread: jest.fn(),
};

const mockSseService = {
  sendToUser: jest.fn(),
};

describe("NotificationsService", () => {
  let service: NotificationsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: NotificationRepository, useValue: mockRepo },
        { provide: NotificationsSseService, useValue: mockSseService },
      ],
    }).compile();
    service = module.get(NotificationsService);
  });

  describe("createNotification", () => {
    it("should create notification and send via SSE", async () => {
      const data = {
        userId: "user-1",
        actorId: "actor-1",
        type: "LIKE",
        referenceType: "POST",
        referenceId: "post-1",
        message: "좋아요를 받았습니다.",
      };
      const mockNotif = { id: "notif-1", ...data, isRead: false, createdAt: new Date() };
      mockRepo.create.mockResolvedValue(mockNotif);

      const result = await service.createNotification(data);

      expect(mockRepo.create).toHaveBeenCalledWith(data);
      expect(mockSseService.sendToUser).toHaveBeenCalledWith("user-1", mockNotif);
      expect(result).toEqual(mockNotif);
    });
  });

  describe("getNotifications", () => {
    it("should delegate to repo.findByUser", async () => {
      const userId = "user-1";
      const mockResult = { data: [], nextCursor: null, hasMore: false };
      mockRepo.findByUser.mockResolvedValue(mockResult);

      const result = await service.getNotifications(userId, { limit: 10 });

      expect(mockRepo.findByUser).toHaveBeenCalledWith(userId, { limit: 10 });
      expect(result).toEqual(mockResult);
    });
  });

  describe("markAsRead", () => {
    it("should mark notification as read and return success", async () => {
      mockRepo.markAsRead.mockResolvedValue({ count: 1 });

      const result = await service.markAsRead("notif-1", "user-1");

      expect(mockRepo.markAsRead).toHaveBeenCalledWith("notif-1", "user-1");
      expect(result).toEqual({ success: true });
    });

    it("should throw NotFoundException when notification not found", async () => {
      mockRepo.markAsRead.mockResolvedValue({ count: 0 });

      await expect(service.markAsRead("non-existent", "user-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("markAllAsRead", () => {
    it("should mark all notifications as read", async () => {
      mockRepo.markAllAsRead.mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead("user-1");

      expect(mockRepo.markAllAsRead).toHaveBeenCalledWith("user-1");
      expect(result).toEqual({ success: true });
    });
  });

  describe("getUnreadCount", () => {
    it("should return unread count", async () => {
      mockRepo.countUnread.mockResolvedValue(3);

      const result = await service.getUnreadCount("user-1");

      expect(mockRepo.countUnread).toHaveBeenCalledWith("user-1");
      expect(result).toEqual({ count: 3 });
    });
  });
});
