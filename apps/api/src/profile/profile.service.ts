import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service.js";

@Injectable()
export class ProfileService {
  constructor(private readonly db: DatabaseService) {}

  async getProfile(userId: string) {
    const user = await this.db.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("사용자를 찾을 수 없습니다.");
    }

    const stats = await this.db.prisma.workout.aggregate({
      where: { userId },
      _count: true,
      _sum: { distance: true, duration: true },
    });

    const totalWorkouts = stats._count;
    const totalDistance = stats._sum.distance ?? 0;
    const totalDuration = stats._sum.duration ?? 0;
    const averagePace = totalDistance > 0 ? totalDuration / (totalDistance / 1000) : 0;

    return {
      user,
      stats: { totalWorkouts, totalDistance, totalDuration, averagePace },
    };
  }
}
