import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

interface TeamLeaderboardEntry {
  teamId: string;
  teamName: string;
  totalValue: number;
  memberCount: number;
}

@Injectable()
export class ChallengeTeamRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(challengeId: string, name: string) {
    return this.db.prisma.challengeTeam.create({
      data: { challengeId, name },
    });
  }

  async findById(id: string) {
    return this.db.prisma.challengeTeam.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });
  }

  async findByChallengeId(challengeId: string) {
    return this.db.prisma.challengeTeam.findMany({
      where: { challengeId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    return this.db.prisma.challengeTeam.delete({
      where: { id },
    });
  }

  async getTeamLeaderboard(challengeId: string): Promise<TeamLeaderboardEntry[]> {
    // Aggregate participant scores by team
    const aggregated = await this.db.prisma.challengeParticipant.groupBy({
      where: {
        challengeId,
        challengeTeamId: { not: null },
      },
      by: ["challengeTeamId"],
      _sum: { currentValue: true },
      _count: { userId: true },
    });

    if (aggregated.length === 0) return [];

    // Get team names
    const teamIds = aggregated
      .map((a: { challengeTeamId: string | null }) => a.challengeTeamId)
      .filter((id: string | null): id is string => id !== null);

    const teams = await this.db.prisma.challengeTeam.findMany({
      where: { id: { in: teamIds } },
      select: { id: true, name: true },
    });

    const teamMap = new Map(teams.map((t: { id: string; name: string }) => [t.id, t.name]));

    // Combine and sort
    return aggregated
      .map((a: { challengeTeamId: string | null; _sum: { currentValue: number | null }; _count: { userId: number } }) => ({
        teamId: a.challengeTeamId!,
        teamName: teamMap.get(a.challengeTeamId!) || "Unknown Team",
        totalValue: a._sum.currentValue || 0,
        memberCount: a._count.userId,
      }))
      .sort((a: TeamLeaderboardEntry, b: TeamLeaderboardEntry) => b.totalValue - a.totalValue);
  }
}
