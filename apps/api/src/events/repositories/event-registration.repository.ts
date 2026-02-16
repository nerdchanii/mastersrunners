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

  async updateResult(eventId: string, userId: string, data: {
    resultTime?: number;
    resultRank?: number;
    bibNumber?: string;
    status?: string;
  }) {
    return this.db.prisma.eventParticipant.update({
      where: { eventId_userId: { eventId, userId } },
      data,
    });
  }

  async linkWorkout(eventId: string, userId: string, workoutId: string, resultTime: number) {
    return this.db.prisma.eventParticipant.update({
      where: { eventId_userId: { eventId, userId } },
      data: { workoutId, resultTime, status: "COMPLETED" },
    });
  }

  async unlinkWorkout(eventId: string, userId: string) {
    return this.db.prisma.eventParticipant.update({
      where: { eventId_userId: { eventId, userId } },
      data: { workoutId: null },
    });
  }

  async findByEventWithResults(eventId: string, sortBy: "resultTime" | "resultRank" = "resultTime") {
    return this.db.prisma.eventParticipant.findMany({
      where: {
        eventId,
        status: { in: ["COMPLETED", "DNS", "DNF"] },
      },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
      },
      orderBy: sortBy === "resultRank"
        ? { resultRank: "asc" }
        : { resultTime: "asc" },
    });
  }
}
