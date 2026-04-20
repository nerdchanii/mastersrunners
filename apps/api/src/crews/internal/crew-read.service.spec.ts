import { ForbiddenException, NotFoundException } from "@nestjs/common";

import { CrewReadService } from "./crew-read.service";

const mockCrewRepo = {
  findById: jest.fn(),
};

const mockCrewMemberRepo = {
  findMember: jest.fn(),
};

const mockConversationsRepo = {
  findById: jest.fn(),
  getConversationWindow: jest.fn(),
  updateLastRead: jest.fn(),
};

describe("CrewReadService", () => {
  let service: CrewReadService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CrewReadService(
      mockCrewRepo as never,
      mockCrewMemberRepo as never,
      mockConversationsRepo as never,
      {} as never,
    );
  });

  describe("getCrewChat", () => {
    it("rejects non-members", async () => {
      mockCrewRepo.findById.mockResolvedValue({ id: "crew-1", chatConversationId: "conv-1" });
      mockCrewMemberRepo.findMember.mockResolvedValue(null);

      await expect(service.getCrewChat("crew-1", "user-1")).rejects.toThrow(ForbiddenException);
    });

    it("rejects inactive members", async () => {
      mockCrewRepo.findById.mockResolvedValue({ id: "crew-1", chatConversationId: "conv-1" });
      mockCrewMemberRepo.findMember.mockResolvedValue({
        crewId: "crew-1",
        userId: "user-1",
        status: "PENDING",
      });

      await expect(service.getCrewChat("crew-1", "user-1")).rejects.toThrow(ForbiddenException);
    });

    it("returns an empty payload when no chat exists", async () => {
      mockCrewRepo.findById.mockResolvedValue({ id: "crew-1", chatConversationId: null });
      mockCrewMemberRepo.findMember.mockResolvedValue({
        crewId: "crew-1",
        userId: "user-1",
        status: "ACTIVE",
      });

      await expect(service.getCrewChat("crew-1", "user-1")).resolves.toEqual({
        conversation: null,
        messages: [],
        olderCursor: null,
        newerCursor: null,
        firstUnreadMessageId: null,
      });
    });

    it("loads chat data for active members", async () => {
      const conversation = { id: "conv-1" };
      const messages = [{ id: "msg-1" }];

      mockCrewRepo.findById.mockResolvedValue({ id: "crew-1", chatConversationId: "conv-1" });
      mockCrewMemberRepo.findMember.mockResolvedValue({
        crewId: "crew-1",
        userId: "user-1",
        status: "ACTIVE",
      });
      mockConversationsRepo.findById.mockResolvedValue(conversation);
      mockConversationsRepo.getConversationWindow.mockResolvedValue({
        messages,
        olderCursor: null,
        newerCursor: null,
        firstUnreadMessageId: null,
      });
      mockConversationsRepo.updateLastRead.mockResolvedValue({});

      await expect(service.getCrewChat("crew-1", "user-1")).resolves.toMatchObject({
        conversation,
        messages,
        olderCursor: null,
        newerCursor: null,
        firstUnreadMessageId: null,
      });
      expect(mockConversationsRepo.updateLastRead).toHaveBeenCalledWith("conv-1", "user-1");
    });

    it("throws when the crew does not exist", async () => {
      mockCrewRepo.findById.mockResolvedValue(null);

      await expect(service.getCrewChat("crew-1", "user-1")).rejects.toThrow(NotFoundException);
    });
  });
});
