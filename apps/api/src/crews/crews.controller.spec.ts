import { Test } from "@nestjs/testing";
import { CrewsController } from "./crews.controller.js";
import { CrewsService } from "./crews.service.js";

const mockUser = { userId: "user-123" };
const mockReq = { user: mockUser } as any;

const mockCrewsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findMyCrews: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  join: jest.fn(),
  leave: jest.fn(),
  kickMember: jest.fn(),
  promoteToAdmin: jest.fn(),
  demoteToMember: jest.fn(),
  getBannedMembers: jest.fn(),
  unbanMember: jest.fn(),
  getPendingMembers: jest.fn(),
  approveMember: jest.fn(),
  rejectMember: jest.fn(),
  createTag: jest.fn(),
  getTags: jest.fn(),
  updateTag: jest.fn(),
  deleteTag: jest.fn(),
  assignTagToMember: jest.fn(),
  removeTagFromMember: jest.fn(),
  createActivity: jest.fn(),
  getActivities: jest.fn(),
  getActivity: jest.fn(),
  updateActivity: jest.fn(),
  deleteActivity: jest.fn(),
  checkIn: jest.fn(),
  getAttendees: jest.fn(),
};

describe("CrewsController", () => {
  let controller: CrewsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [CrewsController],
      providers: [{ provide: CrewsService, useValue: mockCrewsService }],
    }).compile();
    controller = module.get(CrewsController);
  });

  // ============ Pending Members ============

  describe("getPendingMembers", () => {
    it("should call service.getPendingMembers with crewId and userId", async () => {
      const expected = [{ id: "m1", status: "PENDING" }];
      mockCrewsService.getPendingMembers.mockResolvedValue(expected);

      const result = await controller.getPendingMembers("crew-1", mockReq);

      expect(mockCrewsService.getPendingMembers).toHaveBeenCalledWith("crew-1", "user-123");
      expect(result).toEqual(expected);
    });
  });

  describe("approveMember", () => {
    it("should call service.approveMember with crewId, userId, targetUserId", async () => {
      const expected = { status: "ACTIVE" };
      mockCrewsService.approveMember.mockResolvedValue(expected);

      const result = await controller.approveMember("crew-1", "user-target", mockReq);

      expect(mockCrewsService.approveMember).toHaveBeenCalledWith("crew-1", "user-123", "user-target");
      expect(result).toEqual(expected);
    });
  });

  describe("rejectMember", () => {
    it("should call service.rejectMember with crewId, userId, targetUserId", async () => {
      const expected = { success: true };
      mockCrewsService.rejectMember.mockResolvedValue(expected);

      const result = await controller.rejectMember("crew-1", "user-target", mockReq);

      expect(mockCrewsService.rejectMember).toHaveBeenCalledWith("crew-1", "user-123", "user-target");
      expect(result).toEqual(expected);
    });
  });

  // ============ Tags ============

  describe("createTag", () => {
    it("should call service.createTag with crewId, userId, name, color", async () => {
      const dto = { name: "Active", color: "#FF0000" };
      const expected = { id: "tag-1", ...dto };
      mockCrewsService.createTag.mockResolvedValue(expected);

      const result = await controller.createTag("crew-1", mockReq, dto as any);

      expect(mockCrewsService.createTag).toHaveBeenCalledWith("crew-1", "user-123", "Active", "#FF0000");
      expect(result).toEqual(expected);
    });
  });

  describe("getTags", () => {
    it("should call service.getTags with crewId", async () => {
      const expected = [{ id: "tag-1", name: "Active" }];
      mockCrewsService.getTags.mockResolvedValue(expected);

      const result = await controller.getTags("crew-1");

      expect(mockCrewsService.getTags).toHaveBeenCalledWith("crew-1");
      expect(result).toEqual(expected);
    });
  });

  describe("updateTag", () => {
    it("should call service.updateTag with tagId, crewId, userId, data", async () => {
      const dto = { name: "Updated" };
      const expected = { id: "tag-1", name: "Updated" };
      mockCrewsService.updateTag.mockResolvedValue(expected);

      const result = await controller.updateTag("crew-1", "tag-1", mockReq, dto as any);

      expect(mockCrewsService.updateTag).toHaveBeenCalledWith("tag-1", "crew-1", "user-123", dto);
      expect(result).toEqual(expected);
    });
  });

  describe("deleteTag", () => {
    it("should call service.deleteTag with tagId, crewId, userId", async () => {
      const expected = { id: "tag-1" };
      mockCrewsService.deleteTag.mockResolvedValue(expected);

      const result = await controller.deleteTag("crew-1", "tag-1", mockReq);

      expect(mockCrewsService.deleteTag).toHaveBeenCalledWith("tag-1", "crew-1", "user-123");
      expect(result).toEqual(expected);
    });
  });

  describe("assignTagToMember", () => {
    it("should call service.assignTagToMember with crewId, userId, memberId, tagId", async () => {
      const expected = { crewMemberId: "member-1", crewTagId: "tag-1" };
      mockCrewsService.assignTagToMember.mockResolvedValue(expected);

      const result = await controller.assignTagToMember("crew-1", "member-1", "tag-1", mockReq);

      expect(mockCrewsService.assignTagToMember).toHaveBeenCalledWith("crew-1", "user-123", "member-1", "tag-1");
      expect(result).toEqual(expected);
    });
  });

  describe("removeTagFromMember", () => {
    it("should call service.removeTagFromMember with crewId, userId, memberId, tagId", async () => {
      const expected = { success: true };
      mockCrewsService.removeTagFromMember.mockResolvedValue(expected);

      const result = await controller.removeTagFromMember("crew-1", "member-1", "tag-1", mockReq);

      expect(mockCrewsService.removeTagFromMember).toHaveBeenCalledWith("crew-1", "user-123", "member-1", "tag-1");
      expect(result).toEqual(expected);
    });
  });

  // ============ Activities ============

  describe("createActivity", () => {
    it("should call service.createActivity with crewId, userId, activity data", async () => {
      const dto = {
        title: "Morning Run",
        description: "5K easy run",
        activityDate: "2026-03-01T06:00:00.000Z",
        location: "Han River",
        latitude: 37.5326,
        longitude: 127.024612,
      };
      const expected = { id: "activity-1", ...dto };
      mockCrewsService.createActivity.mockResolvedValue(expected);

      const result = await controller.createActivity("crew-1", mockReq, dto as any);

      expect(mockCrewsService.createActivity).toHaveBeenCalledWith("crew-1", "user-123", {
        title: "Morning Run",
        description: "5K easy run",
        activityDate: new Date("2026-03-01T06:00:00.000Z"),
        location: "Han River",
        latitude: 37.5326,
        longitude: 127.024612,
      });
      expect(result).toEqual(expected);
    });
  });

  describe("getActivities", () => {
    it("should call service.getActivities with crewId, cursor, limit", async () => {
      const expected = { items: [{ id: "a1" }], nextCursor: null };
      mockCrewsService.getActivities.mockResolvedValue(expected);

      const result = await controller.getActivities("crew-1", "cursor-1", "10");

      expect(mockCrewsService.getActivities).toHaveBeenCalledWith("crew-1", "cursor-1", 10);
      expect(result).toEqual(expected);
    });

    it("should call service.getActivities without limit if not provided", async () => {
      const expected = { items: [], nextCursor: null };
      mockCrewsService.getActivities.mockResolvedValue(expected);

      const result = await controller.getActivities("crew-1", undefined, undefined);

      expect(mockCrewsService.getActivities).toHaveBeenCalledWith("crew-1", undefined, undefined);
      expect(result).toEqual(expected);
    });
  });

  describe("getActivity", () => {
    it("should call service.getActivity with activityId", async () => {
      const expected = { id: "activity-1", title: "Run" };
      mockCrewsService.getActivity.mockResolvedValue(expected);

      const result = await controller.getActivity("activity-1");

      expect(mockCrewsService.getActivity).toHaveBeenCalledWith("activity-1");
      expect(result).toEqual(expected);
    });
  });

  describe("updateActivity", () => {
    it("should call service.updateActivity with activityId, crewId, userId, data", async () => {
      const dto = { title: "Updated Run" };
      const expected = { id: "activity-1", title: "Updated Run" };
      mockCrewsService.updateActivity.mockResolvedValue(expected);

      const result = await controller.updateActivity("crew-1", "activity-1", mockReq, dto as any);

      expect(mockCrewsService.updateActivity).toHaveBeenCalledWith("activity-1", "crew-1", "user-123", { title: "Updated Run" });
      expect(result).toEqual(expected);
    });
  });

  describe("deleteActivity", () => {
    it("should call service.deleteActivity with activityId, crewId, userId", async () => {
      const expected = { id: "activity-1" };
      mockCrewsService.deleteActivity.mockResolvedValue(expected);

      const result = await controller.deleteActivity("crew-1", "activity-1", mockReq);

      expect(mockCrewsService.deleteActivity).toHaveBeenCalledWith("activity-1", "crew-1", "user-123");
      expect(result).toEqual(expected);
    });
  });

  describe("checkIn", () => {
    it("should call service.checkIn with activityId, userId, method", async () => {
      const expected = { id: "att-1", method: "QR" };
      mockCrewsService.checkIn.mockResolvedValue(expected);

      const result = await controller.checkIn("activity-1", mockReq, "QR");

      expect(mockCrewsService.checkIn).toHaveBeenCalledWith("activity-1", "user-123", "QR");
      expect(result).toEqual(expected);
    });

    it("should call service.checkIn with undefined method if not provided", async () => {
      const expected = { id: "att-1", method: "QR" };
      mockCrewsService.checkIn.mockResolvedValue(expected);

      const result = await controller.checkIn("activity-1", mockReq, undefined);

      expect(mockCrewsService.checkIn).toHaveBeenCalledWith("activity-1", "user-123", undefined);
      expect(result).toEqual(expected);
    });
  });

  describe("getAttendees", () => {
    it("should call service.getAttendees with activityId", async () => {
      const expected = [{ id: "att-1", userId: "user-1" }];
      mockCrewsService.getAttendees.mockResolvedValue(expected);

      const result = await controller.getAttendees("activity-1");

      expect(mockCrewsService.getAttendees).toHaveBeenCalledWith("activity-1");
      expect(result).toEqual(expected);
    });
  });
});
