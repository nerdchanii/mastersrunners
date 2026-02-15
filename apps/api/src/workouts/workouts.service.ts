import { Injectable } from "@nestjs/common";
import { WorkoutRepository } from "./repositories/workout.repository.js";
import type { CreateWorkoutDto } from "./dto/create-workout.dto.js";
import type { UpdateWorkoutDto } from "./dto/update-workout.dto.js";

@Injectable()
export class WorkoutsService {
  constructor(private readonly workoutRepo: WorkoutRepository) {}

  async findAll(userId: string) {
    return this.workoutRepo.findAllByUser(userId);
  }

  async create(userId: string, dto: CreateWorkoutDto) {
    const pace = dto.duration / (dto.distance / 1000);
    return this.workoutRepo.create({
      userId,
      distance: dto.distance,
      duration: dto.duration,
      pace,
      date: new Date(dto.date),
      memo: dto.memo || null,
      isPublic: dto.isPublic ?? false,
    });
  }

  async findOne(id: string) {
    return this.workoutRepo.findByIdWithUser(id);
  }

  async update(id: string, dto: UpdateWorkoutDto) {
    return this.workoutRepo.updateVisibility(id, dto.isPublic);
  }
}
