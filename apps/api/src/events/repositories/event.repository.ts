import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

interface CreateEventData {
  title: string;
  description?: string;
  eventType: string;
  date: Date;
  location?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  maxParticipants?: number;
  organizerId: string;
}

interface UpdateEventData {
  title?: string;
  description?: string;
  eventType?: string;
  date?: Date;
  location?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  maxParticipants?: number;
}

interface FindAllOptions {
  upcoming?: boolean;
  cursor?: string;
  limit?: number;
}

@Injectable()
export class EventRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateEventData) {
    return this.db.prisma.event.create({ data });
  }

  async findById(id: string) {
    return this.db.prisma.event.findUnique({
      where: { id },
      include: { participants: { include: { user: true } } },
    });
  }

  async findAll(options: FindAllOptions) {
    const where: { date?: { gte: Date } } = {};
    if (options.upcoming) where.date = { gte: new Date() };

    return this.db.prisma.event.findMany({
      where,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      ...(options.limit ? { take: options.limit } : {}),
      orderBy: { date: "asc" },
    });
  }

  async findByUser(userId: string) {
    return this.db.prisma.event.findMany({
      where: { participants: { some: { userId, status: "REGISTERED" } } },
      orderBy: { date: "asc" },
    });
  }

  async update(id: string, data: UpdateEventData) {
    return this.db.prisma.event.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.db.prisma.event.delete({ where: { id } });
  }
}
