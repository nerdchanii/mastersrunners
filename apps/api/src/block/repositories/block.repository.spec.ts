import { Test } from "@nestjs/testing";
import { BlockRepository } from "./block.repository.js";
import { DatabaseService } from "../../database/database.service.js";

const mockDatabaseService = {
  prisma: {
    block: {
      create: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
};

describe("BlockRepository", () => {
  let repository: BlockRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        BlockRepository,
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();
    repository = module.get(BlockRepository);
  });

  describe("block", () => {
    it("should create a block record", async () => {
      const blockerId = "user-blocker";
      const blockedId = "user-blocked";
      const mockBlock = { id: "block-1", blockerId, blockedId, createdAt: new Date() };
      mockDatabaseService.prisma.block.create.mockResolvedValue(mockBlock);

      const result = await repository.block(blockerId, blockedId);

      expect(mockDatabaseService.prisma.block.create).toHaveBeenCalledWith({
        data: { blockerId, blockedId },
      });
      expect(result).toEqual(mockBlock);
    });
  });

  describe("unblock", () => {
    it("should delete a block record", async () => {
      const blockerId = "user-blocker";
      const blockedId = "user-blocked";
      const mockDeleted = { id: "block-1", blockerId, blockedId };
      mockDatabaseService.prisma.block.delete.mockResolvedValue(mockDeleted);

      const result = await repository.unblock(blockerId, blockedId);

      expect(mockDatabaseService.prisma.block.delete).toHaveBeenCalledWith({
        where: {
          blockerId_blockedId: { blockerId, blockedId },
        },
      });
      expect(result).toEqual(mockDeleted);
    });
  });

  describe("isBlocked", () => {
    it("should return true when userId1 has blocked userId2", async () => {
      const userId1 = "user-1";
      const userId2 = "user-2";
      const mockBlock = { id: "block-1", blockerId: userId1, blockedId: userId2 };
      mockDatabaseService.prisma.block.findFirst.mockResolvedValue(mockBlock);

      const result = await repository.isBlocked(userId1, userId2);

      expect(mockDatabaseService.prisma.block.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { blockerId: userId1, blockedId: userId2 },
            { blockerId: userId2, blockedId: userId1 },
          ],
        },
      });
      expect(result).toBe(true);
    });

    it("should return true when userId2 has blocked userId1", async () => {
      const userId1 = "user-1";
      const userId2 = "user-2";
      const mockBlock = { id: "block-1", blockerId: userId2, blockedId: userId1 };
      mockDatabaseService.prisma.block.findFirst.mockResolvedValue(mockBlock);

      const result = await repository.isBlocked(userId1, userId2);

      expect(result).toBe(true);
    });

    it("should return false when there is no block relationship", async () => {
      const userId1 = "user-1";
      const userId2 = "user-2";
      mockDatabaseService.prisma.block.findFirst.mockResolvedValue(null);

      const result = await repository.isBlocked(userId1, userId2);

      expect(result).toBe(false);
    });
  });

  describe("findBlockedByUser", () => {
    it("should return all users blocked by the given user", async () => {
      const blockerId = "user-blocker";
      const mockBlocks = [
        {
          id: "block-1",
          blockerId,
          blockedId: "user-1",
          createdAt: new Date("2025-01-01"),
          blocked: { id: "user-1", email: "user1@example.com" },
        },
        {
          id: "block-2",
          blockerId,
          blockedId: "user-2",
          createdAt: new Date("2025-01-02"),
          blocked: { id: "user-2", email: "user2@example.com" },
        },
      ];
      mockDatabaseService.prisma.block.findMany.mockResolvedValue(mockBlocks);

      const result = await repository.findBlockedByUser(blockerId);

      expect(mockDatabaseService.prisma.block.findMany).toHaveBeenCalledWith({
        where: { blockerId },
        include: { blocked: true },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(mockBlocks);
    });
  });

  describe("isBlockedBy", () => {
    it("should return true when blockerId has blocked blockedId", async () => {
      const blockerId = "user-blocker";
      const blockedId = "user-blocked";
      const mockBlock = { id: "block-1", blockerId, blockedId };
      mockDatabaseService.prisma.block.findUnique.mockResolvedValue(mockBlock);

      const result = await repository.isBlockedBy(blockerId, blockedId);

      expect(mockDatabaseService.prisma.block.findUnique).toHaveBeenCalledWith({
        where: {
          blockerId_blockedId: { blockerId, blockedId },
        },
      });
      expect(result).toBe(true);
    });

    it("should return false when blockerId has not blocked blockedId", async () => {
      const blockerId = "user-blocker";
      const blockedId = "user-blocked";
      mockDatabaseService.prisma.block.findUnique.mockResolvedValue(null);

      const result = await repository.isBlockedBy(blockerId, blockedId);

      expect(result).toBe(false);
    });
  });
});
