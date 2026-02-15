import { Test } from "@nestjs/testing";
import { ConflictException } from "@nestjs/common";
import { BlockService } from "./block.service.js";
import { BlockRepository } from "./repositories/block.repository.js";
import { DatabaseService } from "../database/database.service.js";

const mockBlockRepository = {
  block: jest.fn(),
  unblock: jest.fn(),
  isBlocked: jest.fn(),
  findBlockedByUser: jest.fn(),
  isBlockedBy: jest.fn(),
};

const mockDatabaseService = {
  prisma: {
    $transaction: jest.fn(),
  },
};

describe("BlockService", () => {
  let service: BlockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        BlockService,
        { provide: BlockRepository, useValue: mockBlockRepository },
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();
    service = module.get(BlockService);
  });

  describe("block", () => {
    it("should throw ConflictException when trying to block oneself", async () => {
      const userId = "user-123";

      await expect(service.block(userId, userId)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.block(userId, userId)).rejects.toThrow(
        "자기 자신을 차단할 수 없습니다.",
      );
    });

    it("should create block and remove follows in both directions", async () => {
      const blockerId = "user-blocker";
      const blockedId = "user-blocked";
      const mockBlock = { id: "block-1", blockerId, blockedId, createdAt: new Date() };

      mockDatabaseService.prisma.$transaction.mockImplementation(async (cb) => {
        const mockTx = {
          block: {
            create: jest.fn().mockResolvedValue(mockBlock),
          },
          follow: {
            deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
        };
        return cb(mockTx);
      });

      const result = await service.block(blockerId, blockedId);

      expect(mockDatabaseService.prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBlock);
    });
  });

  describe("unblock", () => {
    it("should delegate to blockRepo.unblock", async () => {
      const blockerId = "user-blocker";
      const blockedId = "user-blocked";
      const mockDeleted = { id: "block-1", blockerId, blockedId };
      mockBlockRepository.unblock.mockResolvedValue(mockDeleted);

      const result = await service.unblock(blockerId, blockedId);

      expect(mockBlockRepository.unblock).toHaveBeenCalledWith(blockerId, blockedId);
      expect(result).toEqual(mockDeleted);
    });
  });

  describe("getBlockedUsers", () => {
    it("should delegate to blockRepo.findBlockedByUser", async () => {
      const userId = "user-123";
      const mockBlocks = [
        {
          id: "block-1",
          blockerId: userId,
          blockedId: "user-2",
          blocked: { id: "user-2", email: "user2@example.com" },
        },
      ];
      mockBlockRepository.findBlockedByUser.mockResolvedValue(mockBlocks);

      const result = await service.getBlockedUsers(userId);

      expect(mockBlockRepository.findBlockedByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockBlocks);
    });
  });

  describe("isBlocked", () => {
    it("should return true when either user has blocked the other", async () => {
      const userId1 = "user-1";
      const userId2 = "user-2";
      mockBlockRepository.isBlocked.mockResolvedValue(true);

      const result = await service.isBlocked(userId1, userId2);

      expect(mockBlockRepository.isBlocked).toHaveBeenCalledWith(userId1, userId2);
      expect(result).toBe(true);
    });

    it("should return false when there is no block relationship", async () => {
      const userId1 = "user-1";
      const userId2 = "user-2";
      mockBlockRepository.isBlocked.mockResolvedValue(false);

      const result = await service.isBlocked(userId1, userId2);

      expect(mockBlockRepository.isBlocked).toHaveBeenCalledWith(userId1, userId2);
      expect(result).toBe(false);
    });
  });
});
