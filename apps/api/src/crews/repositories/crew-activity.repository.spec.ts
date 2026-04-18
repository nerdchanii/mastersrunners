import { Test } from "@nestjs/testing";

import { DatabaseService } from "../../database/database.service.js";

import { CrewActivityRepository } from "./crew-activity.repository.js";

describe("CrewActivityRepository", () => {
  let repository: CrewActivityRepository;

  const mockPrisma = {
    crewActivity: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    crewAttendance: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    crewMember: {
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CrewActivityRepository,
        {
          provide: DatabaseService,
          useValue: { prisma: mockPrisma },
        },
      ],
    }).compile();

    repository = module.get<CrewActivityRepository>(CrewActivityRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a crew activity", async () => {
      const data = {
        crewId: "crew-1",
        title: "Morning Run",
        description: "5K easy run",
        activityDate: new Date("2026-02-20"),
        location: "Han River Park",
        latitude: 37.5326,
        longitude: 127.024612,
        createdBy: "user-1",
        qrCode: "qr-unique-code",
      };

      const expected = {
        id: "activity-1",
        ...data,
        createdAt: new Date(),
      };

      mockPrisma.crewActivity.create.mockResolvedValue(expected);

      const result = await repository.create(data);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewActivity.create).toHaveBeenCalledWith({
        data,
      });
    });
  });

  describe("findByCrewId", () => {
    it("should find activities with cursor pagination", async () => {
      const crewId = "crew-1";
      const cursor = "activity-2";
      const limit = 10;

      const expected = [
        {
          id: "activity-1",
          crewId,
          title: "Morning Run",
          activityDate: new Date("2026-02-20"),
        },
      ];

      mockPrisma.crewActivity.findMany.mockResolvedValue(expected);

      const result = await repository.findByCrewId(crewId, { cursor, limit });

      expect(result).toEqual(expected);
      expect(mockPrisma.crewActivity.findMany).toHaveBeenCalledWith({
        where: { crewId },
        orderBy: { activityDate: "desc" },
        take: limit + 1,
        skip: 1,
        cursor: { id: cursor },
        include: {
          attendances: {
            select: {
              userId: true,
              status: true,
              checkedAt: true,
              method: true,
              rsvpAt: true,
            },
          },
        },
      });
    });

    it("should find activities without cursor", async () => {
      const crewId = "crew-1";
      const limit = 20;

      const expected = [
        {
          id: "activity-1",
          crewId,
          title: "Evening Run",
          activityDate: new Date("2026-02-21"),
        },
      ];

      mockPrisma.crewActivity.findMany.mockResolvedValue(expected);

      const result = await repository.findByCrewId(crewId, { limit });

      expect(result).toEqual(expected);
      expect(mockPrisma.crewActivity.findMany).toHaveBeenCalledWith({
        where: { crewId },
        orderBy: { activityDate: "desc" },
        take: limit + 1,
        include: {
          attendances: {
            select: {
              userId: true,
              status: true,
              checkedAt: true,
              method: true,
              rsvpAt: true,
            },
          },
        },
      });
    });
  });

  describe("findById", () => {
    it("should find an activity by id with attendances", async () => {
      const id = "activity-1";
      const expected = {
        id,
        crewId: "crew-1",
        title: "Morning Run",
        activityDate: new Date("2026-02-20"),
        attendances: [
          { userId: "user-1", checkedAt: new Date(), method: "QR" },
          { userId: "user-2", checkedAt: new Date(), method: "MANUAL" },
        ],
      };

      mockPrisma.crewActivity.findUnique.mockResolvedValue(expected);

      const result = await repository.findById(id);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewActivity.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          attendances: {
            select: {
              id: true,
              userId: true,
              status: true,
              method: true,
              rsvpAt: true,
              checkedAt: true,
              checkedBy: true,
              user: { select: { id: true, name: true, profileImage: true } },
            },
            orderBy: { rsvpAt: "asc" },
          },
        },
      });
    });
  });

  describe("update", () => {
    it("should update a crew activity", async () => {
      const id = "activity-1";
      const data = {
        title: "Updated Run",
        description: "10K tempo run",
      };

      const expected = {
        id,
        crewId: "crew-1",
        ...data,
        activityDate: new Date("2026-02-20"),
        createdBy: "user-1",
        createdAt: new Date(),
      };

      mockPrisma.crewActivity.update.mockResolvedValue(expected);

      const result = await repository.update(id, data);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewActivity.update).toHaveBeenCalledWith({
        where: { id },
        data,
      });
    });
  });

  describe("remove", () => {
    it("should delete a crew activity", async () => {
      const id = "activity-1";
      const expected = {
        id,
        crewId: "crew-1",
        title: "Old Activity",
        activityDate: new Date("2026-01-01"),
      };

      mockPrisma.crewActivity.delete.mockResolvedValue(expected);

      const result = await repository.remove(id);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewActivity.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe("checkIn", () => {
    it("should update attendance to CHECKED_IN for an activity", async () => {
      const activityId = "activity-1";
      const userId = "user-1";
      const method = "QR";

      const expected = {
        id: "attendance-1",
        activityId,
        userId,
        method,
        status: "CHECKED_IN",
        checkedAt: expect.any(Date),
      };

      mockPrisma.crewAttendance.update = jest.fn().mockResolvedValue(expected);

      const result = await repository.checkIn(activityId, userId, method);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewAttendance.update).toHaveBeenCalledWith({
        where: { activityId_userId: { activityId, userId } },
        data: { status: "CHECKED_IN", method, checkedAt: expect.any(Date) },
      });
    });

    it("should use default method MANUAL if not provided", async () => {
      const activityId = "activity-1";
      const userId = "user-1";

      const expected = {
        id: "attendance-2",
        activityId,
        userId,
        method: "MANUAL",
        status: "CHECKED_IN",
        checkedAt: expect.any(Date),
      };

      mockPrisma.crewAttendance.update = jest.fn().mockResolvedValue(expected);

      const result = await repository.checkIn(activityId, userId);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewAttendance.update).toHaveBeenCalledWith({
        where: { activityId_userId: { activityId, userId } },
        data: {
          status: "CHECKED_IN",
          method: "MANUAL",
          checkedAt: expect.any(Date),
        },
      });
    });
  });

  describe("findAttendance", () => {
    it("should find attendance record for a user and activity", async () => {
      const activityId = "activity-1";
      const userId = "user-1";

      const expected = {
        id: "attendance-1",
        activityId,
        userId,
        method: "QR",
        checkedAt: new Date(),
      };

      mockPrisma.crewAttendance.findUnique.mockResolvedValue(expected);

      const result = await repository.findAttendance(activityId, userId);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewAttendance.findUnique).toHaveBeenCalledWith({
        where: {
          activityId_userId: {
            activityId,
            userId,
          },
        },
      });
    });

    it("should return null if attendance not found", async () => {
      const activityId = "activity-1";
      const userId = "user-2";

      mockPrisma.crewAttendance.findUnique.mockResolvedValue(null);

      const result = await repository.findAttendance(activityId, userId);

      expect(result).toBeNull();
    });
  });

  describe("getAttendees", () => {
    it("should get all attendees for an activity", async () => {
      const activityId = "activity-1";

      const expected = [
        {
          id: "attendance-1",
          userId: "user-1",
          method: "QR",
          checkedAt: new Date(),
        },
        {
          id: "attendance-2",
          userId: "user-2",
          method: "MANUAL",
          checkedAt: new Date(),
        },
      ];

      mockPrisma.crewAttendance.findMany.mockResolvedValue(expected);

      const result = await repository.getAttendees(activityId);

      expect(result).toEqual(expected);
      expect(mockPrisma.crewAttendance.findMany).toHaveBeenCalledWith({
        where: { activityId },
        orderBy: { rsvpAt: "asc" },
        include: {
          user: { select: { id: true, name: true, profileImage: true } },
        },
      });
    });
  });

  describe("getCrewAttendanceStats", () => {
    it("should return dashboard stats with summary, activities, and members", async () => {
      mockPrisma.crewActivity.findMany
        .mockResolvedValueOnce([
          {
            id: "activity-1",
            title: "월요일 아침 러닝",
            activityDate: new Date("2026-02-10T09:00:00.000Z"),
            activityType: "OFFICIAL",
            activityIcon: "🏃",
            attendances: [
              { userId: "user-1", status: "CHECKED_IN" },
              { userId: "user-2", status: "NO_SHOW" },
            ],
          },
        ])
        .mockResolvedValueOnce([
          {
            id: "activity-1",
            title: "월요일 아침 러닝",
            activityDate: new Date("2026-02-10T09:00:00.000Z"),
            activityType: "OFFICIAL",
            activityIcon: "🏃",
            attendances: [
              { userId: "user-1", status: "CHECKED_IN" },
              { userId: "user-2", status: "NO_SHOW" },
            ],
          },
        ]);

      mockPrisma.crewMember.findMany.mockResolvedValue([
        {
          userId: "user-1",
          user: {
            id: "user-1",
            name: "김러너",
            profileImage: null,
            crewAttendances: [
              {
                status: "CHECKED_IN",
                checkedAt: new Date("2026-02-10T09:01:00.000Z"),
                activity: { activityDate: new Date("2026-02-10T09:00:00.000Z") },
              },
            ],
          },
        },
        {
          userId: "user-2",
          user: {
            id: "user-2",
            name: "박지구력",
            profileImage: null,
            crewAttendances: [
              {
                status: "NO_SHOW",
                checkedAt: null,
                activity: { activityDate: new Date("2026-02-10T09:00:00.000Z") },
              },
            ],
          },
        },
      ]);

      const result = await repository.getCrewAttendanceStats("crew-1", {
        type: "OFFICIAL",
        sort: "checkedIn",
        order: "desc",
      });

      expect(result.summary).toEqual({
        overallRate: 50,
        activityCount: 1,
        totalEligible: 2,
        totalCheckedIn: 1,
        totalNoShow: 1,
      });
      expect(result.activities).toHaveLength(1);
      expect(result.members[0]).toMatchObject({
        userId: "user-1",
        checkedIn: 1,
        noShow: 0,
      });
      expect(mockPrisma.crewMember.findMany).toHaveBeenCalled();
    });
  });

  describe("getMemberAttendanceHistory", () => {
    it("should return member attendance history items", async () => {
      mockPrisma.crewAttendance.findMany.mockResolvedValue([
        {
          id: "attendance-1",
          user: { id: "user-1", name: "김러너", profileImage: null },
          status: "NO_SHOW",
          checkedAt: null,
          rsvpAt: new Date("2026-02-10T08:00:00.000Z"),
          activity: {
            id: "activity-1",
            title: "월요일 아침 러닝",
            activityDate: new Date("2026-02-10T09:00:00.000Z"),
            activityType: "OFFICIAL",
            activityIcon: "🏃",
          },
        },
        {
          id: "attendance-2",
          user: { id: "user-1", name: "김러너", profileImage: null },
          status: "CHECKED_IN",
          checkedAt: new Date("2026-02-12T09:00:00.000Z"),
          rsvpAt: new Date("2026-02-12T08:00:00.000Z"),
          activity: {
            id: "activity-2",
            title: "번개 러닝",
            activityDate: new Date("2026-02-12T09:00:00.000Z"),
            activityType: "POP_UP",
            activityIcon: "⚡",
          },
        },
      ]);

      const result = await repository.getMemberAttendanceHistory("crew-1", "user-1", {
        range: "all",
        type: "ALL",
      });

      expect(result.member).toMatchObject({
        userId: "user-1",
        checkedIn: 1,
        noShow: 1,
        totalEligible: 2,
        rate: 50,
      });
      expect(result.history).toHaveLength(2);
      expect(result.history[0]).toMatchObject({
        activityId: "activity-1",
        status: "NO_SHOW",
      });
    });
  });
});
