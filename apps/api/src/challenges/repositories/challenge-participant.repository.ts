import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

@Injectable()
export class ChallengeParticipantRepository {
  constructor(private readonly db: DatabaseService) {}

  async join(challengeId: string, userId: string, teamId?: string) {
    return this.db.prisma.challengeParticipant.create({
      data: { challengeId, userId, challengeTeamId: teamId },
    });
  }

  async leave(challengeId: string, userId: string) {
    return this.db.prisma.challengeParticipant.delete({
      where: { challengeId_userId: { challengeId, userId } },
    });
  }

  async updateProgress(challengeId: string, userId: string, currentValue: number, completed?: boolean) {
    const data: {
      currentValue: number;
      isCompleted?: boolean;
      completedAt?: Date | null;
    } = { currentValue };

    if (completed !== undefined) {
      data.isCompleted = completed;
      data.completedAt = completed ? new Date() : null;
    }

    return this.db.prisma.challengeParticipant.update({
      where: { challengeId_userId: { challengeId, userId } },
      data,
    });
  }

  async findParticipant(challengeId: string, userId: string) {
    return this.db.prisma.challengeParticipant.findUnique({
      where: { challengeId_userId: { challengeId, userId } },
    });
  }

  async findLeaderboard(challengeId: string, limit?: number) {
    return this.db.prisma.challengeParticipant.findMany({
      where: { challengeId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: { currentValue: "desc" },
      take: limit,
    });
  }
}
