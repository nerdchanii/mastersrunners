import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

@Injectable()
export class WorkoutTypeRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAllActive() {
    return this.db.prisma.workoutType.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });
  }

  async findByCategory(category: string) {
    return this.db.prisma.workoutType.findMany({
      where: { category, isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }
}
