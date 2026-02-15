import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

interface CreateChallengeData {
  title: string;
  description?: string;
  type: string;
  targetValue: number;
  targetUnit: string;
  startDate: Date;
  endDate: Date;
  creatorId: string;
  crewId?: string;
  isPublic: boolean;
  imageUrl?: string;
}

interface UpdateChallengeData {
  title?: string;
  description?: string;
  type?: string;
  targetValue?: number;
  targetUnit?: string;
  startDate?: Date;
  endDate?: Date;
  isPublic?: boolean;
  imageUrl?: string;
}

interface FindAllOptions {
  isPublic?: boolean;
  crewId?: string;
  cursor?: string;
  limit?: number;
}

@Injectable()
export class ChallengeRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateChallengeData) {
    return this.db.prisma.challenge.create({ data });
  }

  async findById(id: string) {
    return this.db.prisma.challenge.findUnique({
      where: { id },
      include: {
        participants: { include: { user: true } },
        teams: true,
      },
    });
  }

  async findAll(options: FindAllOptions) {
    const where: { isPublic?: boolean; crewId?: string } = {};
    if (options.isPublic !== undefined) where.isPublic = options.isPublic;
    if (options.crewId !== undefined) where.crewId = options.crewId;

    return this.db.prisma.challenge.findMany({
      where,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      ...(options.limit ? { take: options.limit } : {}),
      orderBy: { createdAt: "desc" },
    });
  }

  async findByUser(userId: string) {
    return this.db.prisma.challenge.findMany({
      where: { participants: { some: { userId } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, data: UpdateChallengeData) {
    return this.db.prisma.challenge.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.db.prisma.challenge.delete({ where: { id } });
  }
}
