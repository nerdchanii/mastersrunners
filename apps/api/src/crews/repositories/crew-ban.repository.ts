import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

@Injectable()
export class CrewBanRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: { crewId: string; userId: string; bannedBy: string; reason?: string }) {
    return this.db.prisma.crewBan.create({ data });
  }

  async findByCrewAndUser(crewId: string, userId: string) {
    return this.db.prisma.crewBan.findUnique({
      where: { crewId_userId: { crewId, userId } },
    });
  }

  async findByCrewId(crewId: string) {
    return this.db.prisma.crewBan.findMany({
      where: { crewId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });
  }

  async remove(crewId: string, userId: string) {
    return this.db.prisma.crewBan.delete({
      where: { crewId_userId: { crewId, userId } },
    });
  }

  async isBanned(crewId: string, userId: string): Promise<boolean> {
    const ban = await this.findByCrewAndUser(crewId, userId);
    return ban !== null;
  }
}
