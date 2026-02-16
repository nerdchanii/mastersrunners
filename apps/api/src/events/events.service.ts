import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { EventRepository } from "./repositories/event.repository.js";
import { EventRegistrationRepository } from "./repositories/event-registration.repository.js";
import type { CreateEventDto } from "./dto/create-event.dto.js";
import type { UpdateEventDto } from "./dto/update-event.dto.js";

@Injectable()
export class EventsService {
  constructor(
    private readonly eventRepo: EventRepository,
    private readonly registrationRepo: EventRegistrationRepository,
  ) {}

  async create(userId: string, dto: CreateEventDto) {
    return this.eventRepo.create({
      title: dto.title,
      description: dto.description,
      eventType: dto.eventType || "OTHER",
      date: new Date(dto.eventDate),
      location: dto.location,
      latitude: dto.latitude,
      longitude: dto.longitude,
      imageUrl: dto.imageUrl,
      maxParticipants: dto.maxParticipants,
      organizerId: userId,
    });
  }

  async findOne(id: string) {
    const event = await this.eventRepo.findById(id);
    if (!event) throw new NotFoundException("이벤트를 찾을 수 없습니다.");
    return event;
  }

  async findAll(options: { upcoming?: boolean; cursor?: string; limit?: number }) {
    return this.eventRepo.findAll(options);
  }

  async findMyEvents(userId: string) {
    return this.eventRepo.findByUser(userId);
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    const event = await this.eventRepo.findById(id);
    if (!event) throw new NotFoundException("이벤트를 찾을 수 없습니다.");
    if (event.organizerId !== userId) throw new ForbiddenException("이벤트 생성자만 수정할 수 있습니다.");

    const updateData: {
      title?: string;
      description?: string;
      eventType?: string;
      date?: Date;
      location?: string;
      latitude?: number;
      longitude?: number;
      imageUrl?: string;
      maxParticipants?: number;
    } = { ...dto };

    if (dto.eventDate) {
      updateData.date = new Date(dto.eventDate);
      delete (updateData as { eventDate?: string }).eventDate;
    }

    if (dto.eventType) {
      updateData.eventType = dto.eventType;
    }

    return this.eventRepo.update(id, updateData);
  }

  async remove(id: string, userId: string) {
    const event = await this.eventRepo.findById(id);
    if (!event) throw new NotFoundException("이벤트를 찾을 수 없습니다.");
    if (event.organizerId !== userId) throw new ForbiddenException("이벤트 생성자만 삭제할 수 있습니다.");

    return this.eventRepo.remove(id);
  }

  async register(eventId: string, userId: string) {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new NotFoundException("이벤트를 찾을 수 없습니다.");

    const existing = await this.registrationRepo.findRegistration(eventId, userId);
    if (existing && existing.status === "REGISTERED") {
      throw new BadRequestException("이미 등록된 이벤트입니다.");
    }

    // Check maxParticipants limit
    if (event.maxParticipants !== null && event.maxParticipants !== undefined) {
      const currentCount = await this.registrationRepo.countRegistered(eventId);
      if (currentCount >= event.maxParticipants) {
        throw new BadRequestException("참가 정원이 마감되었습니다.");
      }
    }

    return this.registrationRepo.register(eventId, userId);
  }

  async cancel(eventId: string, userId: string) {
    const registration = await this.registrationRepo.findRegistration(eventId, userId);
    if (!registration) throw new NotFoundException("등록하지 않은 이벤트입니다.");
    if (registration.status !== "REGISTERED") {
      throw new BadRequestException("이미 취소된 등록입니다.");
    }

    return this.registrationRepo.cancel(eventId, userId);
  }

  // ============ Result Methods ============

  async submitResult(eventId: string, userId: string, data: {
    resultTime: number;
    resultRank?: number;
    bibNumber?: string;
    status: "COMPLETED" | "DNS" | "DNF";
  }) {
    const registration = await this.registrationRepo.findRegistration(eventId, userId);
    if (!registration) throw new NotFoundException("등록하지 않은 이벤트입니다.");

    return this.registrationRepo.updateResult(eventId, userId, {
      resultTime: data.resultTime,
      resultRank: data.resultRank,
      bibNumber: data.bibNumber,
      status: data.status,
    });
  }

  async getResults(eventId: string, sortBy?: "resultTime" | "resultRank") {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new NotFoundException("이벤트를 찾을 수 없습니다.");

    return this.registrationRepo.findByEventWithResults(eventId, sortBy);
  }

  async getMyResult(eventId: string, userId: string) {
    const registration = await this.registrationRepo.findRegistration(eventId, userId);
    if (!registration) throw new NotFoundException("등록하지 않은 이벤트입니다.");

    return registration;
  }
}
