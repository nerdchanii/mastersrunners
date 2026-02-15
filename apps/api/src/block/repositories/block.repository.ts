import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";

@Injectable()
export class BlockRepository {
  constructor(private readonly db: DatabaseService) {}

  async block(blockerId: string, blockedId: string) {
    return this.db.prisma.block.create({
      data: { blockerId, blockedId },
    });
  }

  async unblock(blockerId: string, blockedId: string) {
    return this.db.prisma.block.delete({
      where: {
        blockerId_blockedId: { blockerId, blockedId },
      },
    });
  }

  async isBlocked(userId1: string, userId2: string): Promise<boolean> {
    const block = await this.db.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userId1, blockedId: userId2 },
          { blockerId: userId2, blockedId: userId1 },
        ],
      },
    });
    return !!block;
  }

  async findBlockedByUser(blockerId: string) {
    return this.db.prisma.block.findMany({
      where: { blockerId },
      include: { blocked: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async isBlockedBy(blockerId: string, blockedId: string): Promise<boolean> {
    const block = await this.db.prisma.block.findUnique({
      where: {
        blockerId_blockedId: { blockerId, blockedId },
      },
    });
    return !!block;
  }
}
