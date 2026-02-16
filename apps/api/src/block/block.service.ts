import { Injectable, ConflictException } from "@nestjs/common";
import type { TransactionClient } from "@masters/database";
import { BlockRepository } from "./repositories/block.repository.js";
import { DatabaseService } from "../database/database.service.js";

@Injectable()
export class BlockService {
  constructor(
    private readonly blockRepo: BlockRepository,
    private readonly db: DatabaseService,
  ) {}

  async block(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new ConflictException("자기 자신을 차단할 수 없습니다.");
    }

    return this.db.prisma.$transaction(async (tx: TransactionClient) => {
      // Create block
      const block = await tx.block.create({
        data: { blockerId, blockedId },
      });

      // Remove follows in both directions
      await tx.follow.deleteMany({
        where: {
          OR: [
            { followerId: blockerId, followingId: blockedId },
            { followerId: blockedId, followingId: blockerId },
          ],
        },
      });

      return block;
    });
  }

  async unblock(blockerId: string, blockedId: string) {
    return this.blockRepo.unblock(blockerId, blockedId);
  }

  async getBlockedUsers(userId: string) {
    return this.blockRepo.findBlockedByUser(userId);
  }

  async isBlocked(userId1: string, userId2: string): Promise<boolean> {
    return this.blockRepo.isBlocked(userId1, userId2);
  }
}
