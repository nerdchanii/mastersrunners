import { Test } from "@nestjs/testing";
import { EventRegistrationRepository } from "./event-registration.repository.js";
import { DatabaseService } from "../../database/database.service.js";

const mockPrisma = {
  eventParticipant: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
};

describe("EventRegistrationRepository", () => {
  let repository: EventRegistrationRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        EventRegistrationRepository,
        { provide: DatabaseService, useValue: { prisma: mockPrisma } },
      ],
    }).compile();
    repository = module.get(EventRegistrationRepository);
  });

  describe("register", () => {
    it("should create registration", async () => {
      const eventId = "event-123";
      const userId = "user-123";
      const mockRegistration = {
        id: "registration-new",
        eventId,
        userId,
        status: "REGISTERED",
        createdAt: new Date(),
      };
      mockPrisma.eventParticipant.create.mockResolvedValue(mockRegistration);

      const result = await repository.register(eventId, userId);

      expect(mockPrisma.eventParticipant.create).toHaveBeenCalledWith({
        data: { eventId, userId, status: "REGISTERED" },
      });
      expect(result).toEqual(mockRegistration);
    });
  });

  describe("cancel", () => {
    it("should update registration status to COMPLETED", async () => {
      const eventId = "event-123";
      const userId = "user-123";
      const mockUpdated = {
        id: "registration-1",
        eventId,
        userId,
        status: "COMPLETED",
      };
      mockPrisma.eventParticipant.update.mockResolvedValue(mockUpdated);

      const result = await repository.cancel(eventId, userId);

      expect(mockPrisma.eventParticipant.update).toHaveBeenCalledWith({
        where: { eventId_userId: { eventId, userId } },
        data: { status: "COMPLETED" },
      });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe("findRegistration", () => {
    it("should find registration by eventId and userId", async () => {
      const eventId = "event-123";
      const userId = "user-123";
      const mockRegistration = {
        id: "registration-1",
        eventId,
        userId,
        status: "REGISTERED",
      };
      mockPrisma.eventParticipant.findUnique.mockResolvedValue(mockRegistration);

      const result = await repository.findRegistration(eventId, userId);

      expect(mockPrisma.eventParticipant.findUnique).toHaveBeenCalledWith({
        where: { eventId_userId: { eventId, userId } },
      });
      expect(result).toEqual(mockRegistration);
    });

    it("should return null if registration not found", async () => {
      mockPrisma.eventParticipant.findUnique.mockResolvedValue(null);

      const result = await repository.findRegistration("event-123", "user-123");

      expect(result).toBeNull();
    });
  });

  describe("countRegistered", () => {
    it("should count only REGISTERED status registrations", async () => {
      const eventId = "event-123";
      const count = 42;
      mockPrisma.eventParticipant.count.mockResolvedValue(count);

      const result = await repository.countRegistered(eventId);

      expect(mockPrisma.eventParticipant.count).toHaveBeenCalledWith({
        where: { eventId, status: "REGISTERED" },
      });
      expect(result).toBe(count);
    });

    it("should return zero when no registrations", async () => {
      mockPrisma.eventParticipant.count.mockResolvedValue(0);

      const result = await repository.countRegistered("event-123");

      expect(result).toBe(0);
    });
  });
});
