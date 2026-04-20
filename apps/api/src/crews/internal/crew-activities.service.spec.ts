import { ForbiddenException } from "@nestjs/common";

import { CrewActivitiesService } from "./crew-activities.service";

const mockCrewRepo = {
  findById: jest.fn(),
};

const mockCrewMemberRepo = {
  findMember: jest.fn(),
};

const mockCrewActivityRepo = {
  findById: jest.fn(),
};

const mockConversationsRepo = {
  findById: jest.fn(),
  getConversationWindow: jest.fn(),
  updateLastRead: jest.fn(),
  removeAllParticipants: jest.fn(),
};

describe("CrewActivitiesService", () => {
  let service: CrewActivitiesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CrewActivitiesService(
      mockCrewRepo as never,
      mockCrewMemberRepo as never,
      mockCrewActivityRepo as never,
      mockConversationsRepo as never,
    );
  });

  describe("getActivityChat", () => {
    const baseActivity = {
      id: "activity-1",
      crewId: "crew-1",
      createdBy: "host-1",
      activityType: "OFFICIAL",
      status: "SCHEDULED",
      chatConversationId: "conv-activity-1",
      attendances: [],
    };

    it("rejects non-members", async () => {
      mockCrewActivityRepo.findById.mockResolvedValue(baseActivity);
      mockCrewMemberRepo.findMember.mockResolvedValue(null);

      await expect(service.getActivityChat("crew-1", "activity-1", "user-1")).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("rejects inactive members", async () => {
      mockCrewActivityRepo.findById.mockResolvedValue(baseActivity);
      mockCrewMemberRepo.findMember.mockResolvedValue({
        userId: "user-1",
        role: "MEMBER",
        status: "PENDING",
      });

      await expect(service.getActivityChat("crew-1", "activity-1", "user-1")).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("rejects active members without attendance", async () => {
      mockCrewActivityRepo.findById.mockResolvedValue(baseActivity);
      mockCrewMemberRepo.findMember.mockResolvedValue({
        userId: "user-1",
        role: "MEMBER",
        status: "ACTIVE",
      });

      await expect(service.getActivityChat("crew-1", "activity-1", "user-1")).rejects.toThrow(
        "참석 후 대화를 확인할 수 있습니다.",
      );
    });

    it("rejects cancelled activities", async () => {
      mockCrewActivityRepo.findById.mockResolvedValue({
        ...baseActivity,
        status: "CANCELLED",
      });

      await expect(service.getActivityChat("crew-1", "activity-1", "user-1")).rejects.toThrow(
        "취소된 활동의 채팅은 확인할 수 없습니다.",
      );
    });

    it("allows RSVP members", async () => {
      mockCrewActivityRepo.findById.mockResolvedValue({
        ...baseActivity,
        attendances: [{ userId: "user-1", status: "RSVP" }],
      });
      mockCrewMemberRepo.findMember.mockResolvedValue({
        userId: "user-1",
        role: "MEMBER",
        status: "ACTIVE",
      });
      mockConversationsRepo.findById.mockResolvedValue({ id: "conv-activity-1" });
      mockConversationsRepo.getConversationWindow.mockResolvedValue({
        messages: [{ id: "msg-1" }],
        olderCursor: null,
        newerCursor: null,
        firstUnreadMessageId: null,
      });
      mockConversationsRepo.updateLastRead.mockResolvedValue({});

      await expect(
        service.getActivityChat("crew-1", "activity-1", "user-1"),
      ).resolves.toMatchObject({
        conversation: { id: "conv-activity-1" },
        messages: [{ id: "msg-1" }],
        olderCursor: null,
        newerCursor: null,
        firstUnreadMessageId: null,
      });
    });

    it("allows admins without attendance", async () => {
      mockCrewActivityRepo.findById.mockResolvedValue(baseActivity);
      mockCrewMemberRepo.findMember.mockResolvedValue({
        userId: "user-1",
        role: "ADMIN",
        status: "ACTIVE",
      });
      mockConversationsRepo.findById.mockResolvedValue({ id: "conv-activity-1" });
      mockConversationsRepo.getConversationWindow.mockResolvedValue({
        messages: [],
        olderCursor: null,
        newerCursor: null,
        firstUnreadMessageId: null,
      });
      mockConversationsRepo.updateLastRead.mockResolvedValue({});

      await expect(
        service.getActivityChat("crew-1", "activity-1", "user-1"),
      ).resolves.toMatchObject({
        conversation: { id: "conv-activity-1" },
        messages: [],
        olderCursor: null,
        newerCursor: null,
        firstUnreadMessageId: null,
      });
    });

    it("allows popup hosts without attendance", async () => {
      mockCrewActivityRepo.findById.mockResolvedValue({
        ...baseActivity,
        activityType: "POP_UP",
        createdBy: "user-1",
      });
      mockCrewMemberRepo.findMember.mockResolvedValue({
        userId: "user-1",
        role: "MEMBER",
        status: "ACTIVE",
      });
      mockConversationsRepo.findById.mockResolvedValue({ id: "conv-activity-1" });
      mockConversationsRepo.getConversationWindow.mockResolvedValue({
        messages: [],
        olderCursor: null,
        newerCursor: null,
        firstUnreadMessageId: null,
      });
      mockConversationsRepo.updateLastRead.mockResolvedValue({});

      await expect(
        service.getActivityChat("crew-1", "activity-1", "user-1"),
      ).resolves.toMatchObject({
        conversation: { id: "conv-activity-1" },
        messages: [],
        olderCursor: null,
        newerCursor: null,
        firstUnreadMessageId: null,
      });
    });
  });
});
