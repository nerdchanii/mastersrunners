import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

interface CreateWorkoutData {
  userId: string;
  distance: number;
  duration: number;
  pace: number;
  date: Date;
  memo: string | null;
  isPublic: boolean;
}

interface FindPublicFeedOptions {
  cursor?: string;
  limit: number;
}

@Injectable()
export class WorkoutRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAllByUser(userId: string) {
    return this.db.prisma.workout.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
  }

  async findByIdWithUser(id: string) {
    return this.db.prisma.workout.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
      },
    });
  }

  async create(data: CreateWorkoutData) {
    return this.db.prisma.workout.create({ data });
  }

  async updateVisibility(id: string, isPublic: boolean) {
    return this.db.prisma.workout.update({
      where: { id },
      data: { isPublic },
    });
  }

  async findPublicFeed({ cursor, limit }: FindPublicFeedOptions) {
    return this.db.prisma.workout.findMany({
      where: { isPublic: true },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
  }

  async aggregateByUser(userId: string) {
    return this.db.prisma.workout.aggregate({
      where: { userId },
      _count: true,
      _sum: { distance: true, duration: true },
    });
  }
}
