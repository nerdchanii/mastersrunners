import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

interface CreateShoeData {
  userId: string;
  brand: string;
  model: string;
  nickname?: string | null;
  imageUrl?: string | null;
  maxDistance?: number | null;
}

interface UpdateShoeData {
  nickname?: string | null;
  imageUrl?: string | null;
  maxDistance?: number | null;
  isRetired?: boolean;
}

@Injectable()
export class ShoeRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAllByUser(userId: string) {
    return this.db.prisma.shoe.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return this.db.prisma.shoe.findUnique({ where: { id } });
  }

  async create(data: CreateShoeData) {
    return this.db.prisma.shoe.create({ data });
  }

  async update(id: string, data: UpdateShoeData) {
    return this.db.prisma.shoe.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.db.prisma.shoe.delete({ where: { id } });
  }

  async addDistance(id: string, distance: number) {
    return this.db.prisma.shoe.update({
      where: { id },
      data: { totalDistance: { increment: distance } },
    });
  }
}
