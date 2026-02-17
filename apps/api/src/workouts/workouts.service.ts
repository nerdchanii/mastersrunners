import { Injectable } from "@nestjs/common";
import { WorkoutRepository } from "./repositories/workout.repository.js";
import { ChallengeAggregationService } from "../challenges/challenge-aggregation.service.js";
import type { CreateWorkoutDto } from "./dto/create-workout.dto.js";
import type { UpdateWorkoutDto } from "./dto/update-workout.dto.js";

@Injectable()
export class WorkoutsService {
  constructor(
    private readonly workoutRepo: WorkoutRepository,
    private readonly challengeAggregation: ChallengeAggregationService
  ) {}

  async findAll(userId: string) {
    return this.workoutRepo.findAllByUser(userId);
  }

  async create(userId: string, dto: CreateWorkoutDto) {
    const pace = dto.duration / (dto.distance / 1000);
    const workout = await this.workoutRepo.create({
      userId,
      distance: dto.distance,
      duration: dto.duration,
      pace,
      date: new Date(dto.date),
      title: dto.title || null,
      workoutTypeId: dto.workoutTypeId || null,
      memo: dto.memo || null,
      visibility: dto.visibility || "FOLLOWERS",
      shoeId: dto.shoeId || null,
    });

    // Aggregate challenge progress (non-blocking)
    try {
      await this.challengeAggregation.onWorkoutCreated(userId, {
        distance: dto.distance,
        duration: dto.duration,
        pace,
        date: new Date(dto.date),
      });
    } catch (error) {
      // Log error but don't fail workout creation
      console.error("Failed to aggregate challenge progress:", error);
    }

    return workout;
  }

  async findOne(id: string) {
    const workout = await this.workoutRepo.findByIdWithUser(id);
    if (!workout) return null;
    const { file, route, laps, ...rest } = workout;
    return {
      ...rest,
      workoutFiles: file ? [file] : [],
      workoutRoutes: route ? [route] : [],
      workoutLaps: laps,
    };
  }

  async update(id: string, dto: UpdateWorkoutDto) {
    const data: Record<string, unknown> = {};
    if (dto.distance !== undefined) data.distance = dto.distance;
    if (dto.duration !== undefined) data.duration = dto.duration;
    if (dto.date !== undefined) data.date = new Date(dto.date);
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.workoutTypeId !== undefined) data.workoutTypeId = dto.workoutTypeId;
    if (dto.memo !== undefined) data.memo = dto.memo;
    if (dto.visibility !== undefined) data.visibility = dto.visibility;
    if (dto.shoeId !== undefined) data.shoeId = dto.shoeId;

    // Recalculate pace if distance or duration changed
    if (dto.distance !== undefined || dto.duration !== undefined) {
      let distance = dto.distance;
      let duration = dto.duration;

      // Fetch current values for the missing field
      if (distance === undefined || duration === undefined) {
        const current = await this.workoutRepo.findByIdWithUser(id);
        if (current) {
          distance = distance ?? current.distance;
          duration = duration ?? current.duration;
        }
      }

      if (distance !== undefined && duration !== undefined && distance > 0) {
        data.pace = duration / (distance / 1000);
      }
    }

    return this.workoutRepo.update(id, data);
  }

  async remove(id: string) {
    return this.workoutRepo.softDelete(id);
  }
}
