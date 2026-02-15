import { Injectable } from "@nestjs/common";
import { WorkoutTypeRepository } from "./repositories/workout-type.repository.js";

@Injectable()
export class WorkoutTypesService {
  constructor(private readonly workoutTypeRepo: WorkoutTypeRepository) {}

  async findAll() {
    const types = await this.workoutTypeRepo.findAllActive();
    const grouped: Record<string, typeof types> = {};
    for (const type of types) {
      if (!grouped[type.category]) grouped[type.category] = [];
      grouped[type.category].push(type);
    }
    return grouped;
  }

  async findByCategory(category: string) {
    return this.workoutTypeRepo.findByCategory(category);
  }
}
