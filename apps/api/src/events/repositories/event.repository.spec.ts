import { Test } from "@nestjs/testing";
import { EventRepository } from "./event.repository.js";
import { DatabaseService } from "../../database/database.service.js";

const mockPrisma = {
  event: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe("EventRepository", () => {
  let repository: EventRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        EventRepository,
        { provide: DatabaseService, useValue: { prisma: mockPrisma } },
      ],
    }).compile();
    repository = module.get(EventRepository);
  });

  describe("create", () => {
    it("should create event with all fields", async () => {
      const createData = {
        title: "Marathon Seoul 2026",
        description: "Full marathon event",
        eventType: "MARATHON",
        date: new Date("2026-10-15"),
        location: "Seoul Olympic Park",
        latitude: 37.5219,
        longitude: 127.1230,
        imageUrl: "https://example.com/event.jpg",
        maxParticipants: 1000,
        organizerId: "user-123",
      };
      const mockCreated = { id: "event-new", ...createData, createdAt: new Date(), updatedAt: new Date() };
      mockPrisma.event.create.mockResolvedValue(mockCreated);

      const result = await repository.create(createData);

      expect(mockPrisma.event.create).toHaveBeenCalledWith({ data: createData });
      expect(result).toEqual(mockCreated);
    });

    it("should create event with minimal fields", async () => {
      const createData = {
        title: "Local Run",
        eventType: "OTHER",
        date: new Date("2026-05-01"),
        organizerId: "user-123",
      };
      const mockCreated = { id: "event-new", ...createData, createdAt: new Date(), updatedAt: new Date() };
      mockPrisma.event.create.mockResolvedValue(mockCreated);

      const result = await repository.create(createData);

      expect(mockPrisma.event.create).toHaveBeenCalledWith({ data: createData });
      expect(result).toEqual(mockCreated);
    });
  });

  describe("findById", () => {
    it("should find event by id with participants", async () => {
      const eventId = "event-123";
      const mockEvent = {
        id: eventId,
        title: "Marathon Seoul 2026",
        participants: [
          { id: "r1", userId: "user-1", user: { id: "user-1", name: "runner1" }, status: "REGISTERED" },
        ],
      };
      mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

      const result = await repository.findById(eventId);

      expect(mockPrisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: eventId },
        include: { participants: { include: { user: true } } },
      });
      expect(result).toEqual(mockEvent);
    });

    it("should return null if event not found", async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);

      const result = await repository.findById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should find upcoming events", async () => {
      const options = { upcoming: true, cursor: "event-10", limit: 20 };
      const mockEvents = [
        { id: "event-11", title: "Event 11", date: new Date("2026-12-01") },
        { id: "event-12", title: "Event 12", date: new Date("2026-12-15") },
      ];
      mockPrisma.event.findMany.mockResolvedValue(mockEvents);

      const result = await repository.findAll(options);

      expect(mockPrisma.event.findMany).toHaveBeenCalledWith({
        where: { date: { gte: expect.any(Date) } },
        cursor: { id: "event-10" },
        skip: 1,
        take: 20,
        orderBy: { date: "asc" },
      });
      expect(result).toEqual(mockEvents);
    });

    it("should find all events without filters", async () => {
      const options = {};
      const mockEvents = [
        { id: "event-1", title: "Event 1" },
        { id: "event-2", title: "Event 2" },
      ];
      mockPrisma.event.findMany.mockResolvedValue(mockEvents);

      const result = await repository.findAll(options);

      expect(mockPrisma.event.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { date: "asc" },
      });
      expect(result).toEqual(mockEvents);
    });
  });

  describe("findByUser", () => {
    it("should find events user registered for", async () => {
      const userId = "user-123";
      const mockEvents = [
        { id: "event-1", title: "Event 1" },
        { id: "event-2", title: "Event 2" },
      ];
      mockPrisma.event.findMany.mockResolvedValue(mockEvents);

      const result = await repository.findByUser(userId);

      expect(mockPrisma.event.findMany).toHaveBeenCalledWith({
        where: { participants: { some: { userId, status: "REGISTERED" } } },
        orderBy: { date: "asc" },
      });
      expect(result).toEqual(mockEvents);
    });
  });

  describe("update", () => {
    it("should update event with provided fields", async () => {
      const eventId = "event-123";
      const updateData = {
        title: "Updated Title",
        description: "Updated Description",
        location: "New Location",
      };
      const mockUpdated = { id: eventId, ...updateData, updatedAt: new Date() };
      mockPrisma.event.update.mockResolvedValue(mockUpdated);

      const result = await repository.update(eventId, updateData);

      expect(mockPrisma.event.update).toHaveBeenCalledWith({
        where: { id: eventId },
        data: updateData,
      });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe("remove", () => {
    it("should hard delete event by id", async () => {
      const eventId = "event-123";
      const mockDeleted = { id: eventId, title: "Deleted Event" };
      mockPrisma.event.delete.mockResolvedValue(mockDeleted);

      const result = await repository.remove(eventId);

      expect(mockPrisma.event.delete).toHaveBeenCalledWith({ where: { id: eventId } });
      expect(result).toEqual(mockDeleted);
    });
  });
});
