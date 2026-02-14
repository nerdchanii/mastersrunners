import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service.js";
import type { CreateWorkoutDto } from "./dto/create-workout.dto.js";
import type { UpdateWorkoutDto } from "./dto/update-workout.dto.js";

@Injectable()
export class WorkoutsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(userId: string) {
    return this.db.prisma.workout.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
  }

  async create(userId: string, dto: CreateWorkoutDto) {
    const pace = dto.duration / (dto.distance / 1000);
    return this.db.prisma.workout.create({
      data: {
        userId,
        distance: dto.distance,
        duration: dto.duration,
        pace,
        date: new Date(dto.date),
        memo: dto.memo || null,
        isPublic: dto.isPublic ?? false,
      },
    });
  }

  async findOne(id: string) {
    return this.db.prisma.workout.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
      },
    });
  }

  async update(id: string, dto: UpdateWorkoutDto) {
    return this.db.prisma.workout.update({
      where: { id },
      data: { isPublic: dto.isPublic },
    });
  }
}
