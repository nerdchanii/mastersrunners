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

  async getBlockedUserIds(userId: string): Promise<string[]> {
    const blocks = await this.db.prisma.block.findMany({
      where: {
        OR: [{ blockerId: userId }, { blockedId: userId }],
      },
      select: { blockerId: true, blockedId: true },
    });

    const ids = new Set<string>();
    for (const block of blocks) {
      if (block.blockerId === userId) {
        ids.add(block.blockedId);
      } else {
        ids.add(block.blockerId);
      }
    }
    return Array.from(ids);
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
