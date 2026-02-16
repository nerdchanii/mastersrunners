import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

@Injectable()
export class WorkoutFileRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: {
    workoutId: string;
    fileType: string;
    fileUrl: string;
    originalFileName: string;
    fileSize: number;
    checksum?: string;
    deviceName?: string;
    deviceManufacturer?: string;
  }) {
    return this.db.prisma.workoutFile.create({ data });
  }

  async updateStatus(id: string, status: string, error?: string) {
    return this.db.prisma.workoutFile.update({
      where: { id },
      data: {
        processStatus: status,
        processError: error,
        processedAt: status === "COMPLETED" ? new Date() : undefined,
      },
    });
  }

  async findByWorkoutId(workoutId: string) {
    return this.db.prisma.workoutFile.findUnique({
      where: { workoutId },
    });
  }
}
