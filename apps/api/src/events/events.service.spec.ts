import { Test } from "@nestjs/testing";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { EventsService } from "./events.service.js";
import { EventRepository } from "./repositories/event.repository.js";
import { EventRegistrationRepository } from "./repositories/event-registration.repository.js";
import type { CreateEventDto } from "./dto/create-event.dto.js";
import type { UpdateEventDto } from "./dto/update-event.dto.js";

const mockEventRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByUser: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockEventRegistrationRepository = {
  register: jest.fn(),
  cancel: jest.fn(),
  findRegistration: jest.fn(),
  countRegistered: jest.fn(),
  updateResult: jest.fn(),
  findByEventWithResults: jest.fn(),
};

describe("EventsService", () => {
  let service: EventsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: EventRepository, useValue: mockEventRepository },
        { provide: EventRegistrationRepository, useValue: mockEventRegistrationRepository },
      ],
    }).compile();
    service = module.get(EventsService);
  });

  describe("create", () => {
    it("should create event with all fields", async () => {
      const userId = "user-123";
      const dto: CreateEventDto = {
        title: "Marathon Seoul 2026",
        description: "Full marathon event",
        eventType: "MARATHON",
        eventDate: "2026-10-15",
        location: "Seoul Olympic Park",
        latitude: 37.5219,
        longitude: 127.1230,
        imageUrl: "https://example.com/event.jpg",
        maxParticipants: 1000,
      };
      const mockEvent = { id: "event-new", ...dto, organizerId: userId };
      mockEventRepository.create.mockResolvedValue(mockEvent);

      const result = await service.create(userId, dto);

      expect(mockEventRepository.create).toHaveBeenCalledWith({
        title: dto.title,
        description: dto.description,
        eventType: dto.eventType,
        date: new Date(dto.eventDate),
        location: dto.location,
        latitude: dto.latitude,
        longitude: dto.longitude,
        imageUrl: dto.imageUrl,
        maxParticipants: dto.maxParticipants,
        organizerId: userId,
      });
      expect(result).toEqual(mockEvent);
    });

    it("should create event with minimal fields", async () => {
      const userId = "user-123";
      const dto: CreateEventDto = {
        title: "Local Run",
        eventDate: "2026-05-01",
      };
      const mockEvent = { id: "event-new", ...dto, organizerId: userId };
      mockEventRepository.create.mockResolvedValue(mockEvent);

      const result = await service.create(userId, dto);

      expect(mockEventRepository.create).toHaveBeenCalledWith({
        title: dto.title,
        description: undefined,
        eventType: "OTHER",
        date: new Date(dto.eventDate),
        location: undefined,
        latitude: undefined,
        longitude: undefined,
        imageUrl: undefined,
        maxParticipants: undefined,
        organizerId: userId,
      });
      expect(result).toEqual(mockEvent);
    });
  });

  describe("findOne", () => {
    it("should return event by id", async () => {
      const eventId = "event-123";
      const mockEvent = { id: eventId, title: "Marathon Seoul 2026" };
      mockEventRepository.findById.mockResolvedValue(mockEvent);

      const result = await service.findOne(eventId);

      expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
      expect(result).toEqual(mockEvent);
    });

    it("should throw NotFoundException if event not found", async () => {
      mockEventRepository.findById.mockResolvedValue(null);

      await expect(service.findOne("non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findAll", () => {
    it("should delegate to eventRepo.findAll with options", async () => {
      const options = { upcoming: true, cursor: "event-10", limit: 20 };
      const mockEvents = [{ id: "event-11" }, { id: "event-12" }];
      mockEventRepository.findAll.mockResolvedValue(mockEvents);

      const result = await service.findAll(options);

      expect(mockEventRepository.findAll).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockEvents);
    });
  });

  describe("findMyEvents", () => {
    it("should delegate to eventRepo.findByUser", async () => {
      const userId = "user-123";
      const mockEvents = [{ id: "event-1" }, { id: "event-2" }];
      mockEventRepository.findByUser.mockResolvedValue(mockEvents);

      const result = await service.findMyEvents(userId);

      expect(mockEventRepository.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockEvents);
    });
  });

  describe("update", () => {
    it("should update event if user is creator", async () => {
      const eventId = "event-123";
      const userId = "user-123";
      const dto: UpdateEventDto = { title: "Updated Title", description: "Updated Description" };
      const mockEvent = { id: eventId, organizerId: userId };
      const mockUpdated = { ...mockEvent, ...dto };
      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockEventRepository.update.mockResolvedValue(mockUpdated);

      const result = await service.update(eventId, userId, dto);

      expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
      expect(mockEventRepository.update).toHaveBeenCalledWith(eventId, dto);
      expect(result).toEqual(mockUpdated);
    });

    it("should throw NotFoundException if event not found", async () => {
      mockEventRepository.findById.mockResolvedValue(null);

      await expect(service.update("non-existent", "user-123", {})).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if user is not creator", async () => {
      const mockEvent = { id: "event-123", organizerId: "user-999" };
      mockEventRepository.findById.mockResolvedValue(mockEvent);

      await expect(service.update("event-123", "user-123", {})).rejects.toThrow(ForbiddenException);
    });
  });

  describe("remove", () => {
    it("should remove event if user is creator", async () => {
      const eventId = "event-123";
      const userId = "user-123";
      const mockEvent = { id: eventId, organizerId: userId };
      const mockDeleted = { ...mockEvent };
      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockEventRepository.remove.mockResolvedValue(mockDeleted);

      const result = await service.remove(eventId, userId);

      expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
      expect(mockEventRepository.remove).toHaveBeenCalledWith(eventId);
      expect(result).toEqual(mockDeleted);
    });

    it("should throw NotFoundException if event not found", async () => {
      mockEventRepository.findById.mockResolvedValue(null);

      await expect(service.remove("non-existent", "user-123")).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if user is not creator", async () => {
      const mockEvent = { id: "event-123", organizerId: "user-999" };
      mockEventRepository.findById.mockResolvedValue(mockEvent);

      await expect(service.remove("event-123", "user-123")).rejects.toThrow(ForbiddenException);
    });
  });

  describe("register", () => {
    it("should register user for event", async () => {
      const eventId = "event-123";
      const userId = "user-123";
      const mockEvent = { id: eventId, maxParticipants: 100 };
      const mockRegistration = { id: "reg-new", eventId, userId, status: "REGISTERED" };
      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockEventRegistrationRepository.findRegistration.mockResolvedValue(null);
      mockEventRegistrationRepository.countRegistered.mockResolvedValue(50);
      mockEventRegistrationRepository.register.mockResolvedValue(mockRegistration);

      const result = await service.register(eventId, userId);

      expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
      expect(mockEventRegistrationRepository.findRegistration).toHaveBeenCalledWith(eventId, userId);
      expect(mockEventRegistrationRepository.countRegistered).toHaveBeenCalledWith(eventId);
      expect(mockEventRegistrationRepository.register).toHaveBeenCalledWith(eventId, userId);
      expect(result).toEqual(mockRegistration);
    });

    it("should throw NotFoundException if event not found", async () => {
      mockEventRepository.findById.mockResolvedValue(null);

      await expect(service.register("non-existent", "user-123")).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if already registered with REGISTERED status", async () => {
      const mockEvent = { id: "event-123" };
      const mockExisting = { id: "reg-1", eventId: "event-123", userId: "user-123", status: "REGISTERED" };
      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockEventRegistrationRepository.findRegistration.mockResolvedValue(mockExisting);

      await expect(service.register("event-123", "user-123")).rejects.toThrow(BadRequestException);
    });

    it("should allow re-registration if previously cancelled", async () => {
      const eventId = "event-123";
      const userId = "user-123";
      const mockEvent = { id: eventId, maxParticipants: 100 };
      const mockExisting = { id: "reg-1", eventId, userId, status: "CANCELLED" };
      const mockRegistration = { id: "reg-new", eventId, userId, status: "REGISTERED" };
      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockEventRegistrationRepository.findRegistration.mockResolvedValue(mockExisting);
      mockEventRegistrationRepository.countRegistered.mockResolvedValue(50);
      mockEventRegistrationRepository.register.mockResolvedValue(mockRegistration);

      const result = await service.register(eventId, userId);

      expect(mockEventRegistrationRepository.register).toHaveBeenCalledWith(eventId, userId);
      expect(result).toEqual(mockRegistration);
    });

    it("should throw BadRequestException if event is full", async () => {
      const mockEvent = { id: "event-123", maxParticipants: 100 };
      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockEventRegistrationRepository.findRegistration.mockResolvedValue(null);
      mockEventRegistrationRepository.countRegistered.mockResolvedValue(100);

      await expect(service.register("event-123", "user-123")).rejects.toThrow(BadRequestException);
    });

    it("should allow registration when no maxParticipants limit", async () => {
      const eventId = "event-123";
      const userId = "user-123";
      const mockEvent = { id: eventId, maxParticipants: null };
      const mockRegistration = { id: "reg-new", eventId, userId, status: "REGISTERED" };
      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockEventRegistrationRepository.findRegistration.mockResolvedValue(null);
      mockEventRegistrationRepository.register.mockResolvedValue(mockRegistration);

      const result = await service.register(eventId, userId);

      expect(mockEventRegistrationRepository.countRegistered).not.toHaveBeenCalled();
      expect(mockEventRegistrationRepository.register).toHaveBeenCalledWith(eventId, userId);
      expect(result).toEqual(mockRegistration);
    });
  });

  describe("cancel", () => {
    it("should cancel registration", async () => {
      const eventId = "event-123";
      const userId = "user-123";
      const mockRegistration = { id: "reg-1", eventId, userId, status: "REGISTERED" };
      const mockCancelled = { ...mockRegistration, status: "CANCELLED" };
      mockEventRegistrationRepository.findRegistration.mockResolvedValue(mockRegistration);
      mockEventRegistrationRepository.cancel.mockResolvedValue(mockCancelled);

      const result = await service.cancel(eventId, userId);

      expect(mockEventRegistrationRepository.findRegistration).toHaveBeenCalledWith(eventId, userId);
      expect(mockEventRegistrationRepository.cancel).toHaveBeenCalledWith(eventId, userId);
      expect(result).toEqual(mockCancelled);
    });

    it("should throw NotFoundException if not registered", async () => {
      mockEventRegistrationRepository.findRegistration.mockResolvedValue(null);

      await expect(service.cancel("event-123", "user-123")).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if already cancelled", async () => {
      const mockRegistration = { id: "reg-1", eventId: "event-123", userId: "user-123", status: "CANCELLED" };
      mockEventRegistrationRepository.findRegistration.mockResolvedValue(mockRegistration);

      await expect(service.cancel("event-123", "user-123")).rejects.toThrow(BadRequestException);
    });
  });

  describe("submitResult", () => {
    it("should submit result for registered participant", async () => {
      const eventId = "event-123";
      const userId = "user-123";
      const resultData = { resultTime: 12600, resultRank: 42, status: "COMPLETED" as const };
      const mockRegistration = { id: "reg-1", eventId, userId, status: "REGISTERED" };
      const mockUpdated = { ...mockRegistration, ...resultData };

      mockEventRegistrationRepository.findRegistration.mockResolvedValue(mockRegistration);
      mockEventRegistrationRepository.updateResult.mockResolvedValue(mockUpdated);

      const result = await service.submitResult(eventId, userId, resultData);

      expect(mockEventRegistrationRepository.findRegistration).toHaveBeenCalledWith(eventId, userId);
      expect(mockEventRegistrationRepository.updateResult).toHaveBeenCalledWith(eventId, userId, {
        resultTime: 12600,
        resultRank: 42,
        bibNumber: undefined,
        status: "COMPLETED",
      });
      expect(result).toEqual(mockUpdated);
    });

    it("should throw NotFoundException if not registered", async () => {
      mockEventRegistrationRepository.findRegistration.mockResolvedValue(null);

      await expect(
        service.submitResult("event-123", "user-123", { resultTime: 12600, status: "COMPLETED" })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getResults", () => {
    it("should return results sorted by time", async () => {
      const eventId = "event-123";
      const mockEvent = { id: eventId };
      const mockResults = [
        { id: "reg-1", resultTime: 10800, resultRank: 1 },
        { id: "reg-2", resultTime: 12600, resultRank: 2 },
      ];

      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockEventRegistrationRepository.findByEventWithResults.mockResolvedValue(mockResults);

      const result = await service.getResults(eventId, "resultTime");

      expect(mockEventRegistrationRepository.findByEventWithResults).toHaveBeenCalledWith(eventId, "resultTime");
      expect(result).toEqual(mockResults);
    });

    it("should throw NotFoundException if event not found", async () => {
      mockEventRepository.findById.mockResolvedValue(null);

      await expect(service.getResults("non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("getMyResult", () => {
    it("should return my registration with result", async () => {
      const eventId = "event-123";
      const userId = "user-123";
      const mockRegistration = { id: "reg-1", eventId, userId, resultTime: 12600, status: "COMPLETED" };

      mockEventRegistrationRepository.findRegistration.mockResolvedValue(mockRegistration);

      const result = await service.getMyResult(eventId, userId);

      expect(result).toEqual(mockRegistration);
    });

    it("should throw NotFoundException if not registered", async () => {
      mockEventRegistrationRepository.findRegistration.mockResolvedValue(null);

      await expect(service.getMyResult("event-123", "user-123")).rejects.toThrow(NotFoundException);
    });
  });
});
