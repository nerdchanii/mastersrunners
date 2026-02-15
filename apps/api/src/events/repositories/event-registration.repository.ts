import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

@Injectable()
export class EventRegistrationRepository {
  constructor(private readonly db: DatabaseService) {}

  async register(eventId: string, userId: string) {
    return this.db.prisma.eventParticipant.create({
      data: { eventId, userId, status: "REGISTERED" },
    });
  }

  async cancel(eventId: string, userId: string) {
    return this.db.prisma.eventParticipant.update({
      where: { eventId_userId: { eventId, userId } },
      data: { status: "COMPLETED" }, // Using COMPLETED to mark as cancelled/withdrawn
    });
  }

  async findRegistration(eventId: string, userId: string) {
    return this.db.prisma.eventParticipant.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
  }

  async countRegistered(eventId: string) {
    return this.db.prisma.eventParticipant.count({
      where: { eventId, status: "REGISTERED" },
    });
  }
}
