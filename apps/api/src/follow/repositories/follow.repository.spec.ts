import { Test } from "@nestjs/testing";
import { FollowRepository } from "./follow.repository";
import { DatabaseService } from "../../database/database.service";

const mockPrisma = {
  follow: {
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockDatabaseService = {
  prisma: mockPrisma,
};

describe("FollowRepository", () => {
  let repository: FollowRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        FollowRepository,
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();
    repository = module.get(FollowRepository);
  });

  describe("follow", () => {
    it("should create a follow record", async () => {
      const followerId = "user-1";
      const followingId = "user-2";
      const status = "ACCEPTED";
      const mockResult = { id: "follow-1", followerId, followingId, status };
      mockPrisma.follow.create.mockResolvedValue(mockResult);

      const result = await repository.follow(followerId, followingId, status);

      expect(mockPrisma.follow.create).toHaveBeenCalledWith({
        data: { followerId, followingId, status },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe("unfollow", () => {
    it("should delete a follow record", async () => {
      const followerId = "user-1";
      const followingId = "user-2";
      const mockResult = { id: "follow-1", followerId, followingId };
      mockPrisma.follow.delete.mockResolvedValue(mockResult);

      const result = await repository.unfollow(followerId, followingId);

      expect(mockPrisma.follow.delete).toHaveBeenCalledWith({
        where: {
          followerId_followingId: { followerId, followingId },
        },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe("accept", () => {
    it("should update status to ACCEPTED", async () => {
      const followerId = "user-1";
      const followingId = "user-2";
      const mockResult = { id: "follow-1", followerId, followingId, status: "ACCEPTED" };
      mockPrisma.follow.update.mockResolvedValue(mockResult);

      const result = await repository.accept(followerId, followingId);

      expect(mockPrisma.follow.update).toHaveBeenCalledWith({
        where: {
          followerId_followingId: { followerId, followingId },
        },
        data: { status: "ACCEPTED" },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe("reject", () => {
    it("should delete the pending follow record", async () => {
      const followerId = "user-1";
      const followingId = "user-2";
      const mockResult = { id: "follow-1", followerId, followingId };
      mockPrisma.follow.delete.mockResolvedValue(mockResult);

      const result = await repository.reject(followerId, followingId);

      expect(mockPrisma.follow.delete).toHaveBeenCalledWith({
        where: {
          followerId_followingId: { followerId, followingId },
        },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe("findFollow", () => {
    it("should find a specific follow record", async () => {
      const followerId = "user-1";
      const followingId = "user-2";
      const mockResult = { id: "follow-1", followerId, followingId, status: "ACCEPTED" };
      mockPrisma.follow.findUnique.mockResolvedValue(mockResult);

      const result = await repository.findFollow(followerId, followingId);

      expect(mockPrisma.follow.findUnique).toHaveBeenCalledWith({
        where: {
          followerId_followingId: { followerId, followingId },
        },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe("findFollowers", () => {
    it("should find all followers without status filter", async () => {
      const userId = "user-1";
      const mockResult = [
        {
          id: "follow-1",
          followerId: "user-2",
          followingId: userId,
          status: "ACCEPTED",
          follower: { id: "user-2", email: "user2@test.com", name: "User 2" },
        },
      ];
      mockPrisma.follow.findMany.mockResolvedValue(mockResult);

      const result = await repository.findFollowers(userId);

      expect(mockPrisma.follow.findMany).toHaveBeenCalledWith({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              email: true,
              name: true,
              profileImage: true,
              isPrivate: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(mockResult);
    });

    it("should find followers with status filter", async () => {
      const userId = "user-1";
      const status = "PENDING";
      const mockResult = [];
      mockPrisma.follow.findMany.mockResolvedValue(mockResult);

      await repository.findFollowers(userId, status);

      expect(mockPrisma.follow.findMany).toHaveBeenCalledWith({
        where: { followingId: userId, status },
        include: {
          follower: {
            select: {
              id: true,
              email: true,
              name: true,
              profileImage: true,
              isPrivate: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("findFollowing", () => {
    it("should find all following without status filter", async () => {
      const userId = "user-1";
      const mockResult = [
        {
          id: "follow-1",
          followerId: userId,
          followingId: "user-2",
          status: "ACCEPTED",
          following: { id: "user-2", email: "user2@test.com", name: "User 2" },
        },
      ];
      mockPrisma.follow.findMany.mockResolvedValue(mockResult);

      const result = await repository.findFollowing(userId);

      expect(mockPrisma.follow.findMany).toHaveBeenCalledWith({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              email: true,
              name: true,
              profileImage: true,
              isPrivate: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe("countFollowers", () => {
    it("should count ACCEPTED followers", async () => {
      const userId = "user-1";
      mockPrisma.follow.count.mockResolvedValue(10);

      const result = await repository.countFollowers(userId);

      expect(mockPrisma.follow.count).toHaveBeenCalledWith({
        where: {
          followingId: userId,
          status: "ACCEPTED",
        },
      });
      expect(result).toBe(10);
    });
  });

  describe("countFollowing", () => {
    it("should count ACCEPTED following", async () => {
      const userId = "user-1";
      mockPrisma.follow.count.mockResolvedValue(5);

      const result = await repository.countFollowing(userId);

      expect(mockPrisma.follow.count).toHaveBeenCalledWith({
        where: {
          followerId: userId,
          status: "ACCEPTED",
        },
      });
      expect(result).toBe(5);
    });
  });

  describe("removeAllBetween", () => {
    it("should remove all follows in both directions", async () => {
      const userId1 = "user-1";
      const userId2 = "user-2";
      const mockResult = [{ count: 2 }];
      mockPrisma.$transaction.mockResolvedValue(mockResult);

      const result = await repository.removeAllBetween(userId1, userId2);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe("findUserIsPrivate", () => {
    it("should return true if user is private", async () => {
      const userId = "user-1";
      mockPrisma.user.findUnique.mockResolvedValue({ isPrivate: true });

      const result = await repository.findUserIsPrivate(userId);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { isPrivate: true },
      });
      expect(result).toBe(true);
    });

    it("should return false if user is public", async () => {
      const userId = "user-1";
      mockPrisma.user.findUnique.mockResolvedValue({ isPrivate: false });

      const result = await repository.findUserIsPrivate(userId);

      expect(result).toBe(false);
    });

    it("should return false if user not found", async () => {
      const userId = "user-1";
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await repository.findUserIsPrivate(userId);

      expect(result).toBe(false);
    });
  });
});
