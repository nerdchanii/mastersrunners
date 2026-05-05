import { ConflictException, Injectable } from "@nestjs/common";

import { BlockRepository } from "./repositories/block.repository.js";

@Injectable()
export class BlockService {
  constructor(private readonly blockRepo: BlockRepository) {}

  async block(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new ConflictException("자기 자신을 차단할 수 없습니다.");
    }

    return this.blockRepo.blockAndRemoveFollows(blockerId, blockedId);
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
