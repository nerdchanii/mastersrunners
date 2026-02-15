import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

interface CreateWorkoutData {
  userId: string;
  distance: number;
  duration: number;
  pace: number;
  date: Date;
  title?: string | null;
  workoutTypeId?: string | null;
  memo?: string | null;
  isPublic: boolean;
  shoeId?: string | null;
}

interface UpdateWorkoutData {
  distance?: number;
  duration?: number;
  pace?: number;
  date?: Date;
  title?: string | null;
  workoutTypeId?: string | null;
  memo?: string | null;
  isPublic?: boolean;
  shoeId?: string | null;
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
      where: { userId, deletedAt: null },
      orderBy: { date: "desc" },
    });
  }

  async findByIdWithUser(id: string) {
    return this.db.prisma.workout.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
        workoutType: { select: { id: true, category: true, name: true } },
      },
    });
  }

  async create(data: CreateWorkoutData) {
    return this.db.prisma.workout.create({ data });
  }

  async update(id: string, data: UpdateWorkoutData) {
    return this.db.prisma.workout.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return this.db.prisma.workout.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findPublicFeed({ cursor, limit }: FindPublicFeedOptions) {
    return this.db.prisma.workout.findMany({
      where: { isPublic: true, deletedAt: null },
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
      where: { userId, deletedAt: null },
      _count: true,
      _sum: { distance: true, duration: true },
    });
  }
}
