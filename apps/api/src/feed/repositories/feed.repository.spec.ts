import { Test } from "@nestjs/testing";
import { FeedRepository } from "./feed.repository";
import { DatabaseService } from "../../database/database.service";

const mockDb = {
  prisma: {
    follow: {
      findMany: jest.fn(),
    },
    post: {
      findMany: jest.fn(),
    },
    workout: {
      findMany: jest.fn(),
    },
  },
};

describe("FeedRepository", () => {
  let repo: FeedRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        FeedRepository,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile();

    repo = module.get(FeedRepository);
  });

  describe("getFollowingIds", () => {
    it("should return array of following user IDs with ACCEPTED status", async () => {
      const follows = [
        { followingId: "user1" },
        { followingId: "user2" },
        { followingId: "user3" },
      ];
      mockDb.prisma.follow.findMany.mockResolvedValue(follows);

      const result = await repo.getFollowingIds("me");

      expect(result).toEqual(["user1", "user2", "user3"]);
      expect(mockDb.prisma.follow.findMany).toHaveBeenCalledWith({
        where: {
          followerId: "me",
          status: "ACCEPTED",
        },
        select: {
          followingId: true,
        },
      });
    });

    it("should return empty array when user follows no one", async () => {
      mockDb.prisma.follow.findMany.mockResolvedValue([]);

      const result = await repo.getFollowingIds("me");

      expect(result).toEqual([]);
    });
  });

  describe("getPostFeed", () => {
    it("should fetch posts with correct visibility filters", async () => {
      const posts = [{ id: "p1" }, { id: "p2" }];
      mockDb.prisma.post.findMany.mockResolvedValue(posts);

      const result = await repo.getPostFeed({
        userId: "me",
        followingIds: ["user1", "user2"],
        limit: 10,
      });

      expect(result).toEqual(posts);
      expect(mockDb.prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            deletedAt: null,
            OR: [
              { userId: "me" },
              {
                userId: { in: ["user1", "user2"] },
                visibility: "PUBLIC",
              },
              {
                userId: { in: ["user1", "user2"] },
                visibility: "FOLLOWERS",
              },
            ],
          },
        }),
      );
    });

    it("should include user, images, workouts, and counts", async () => {
      mockDb.prisma.post.findMany.mockResolvedValue([]);

      await repo.getPostFeed({
        userId: "me",
        followingIds: [],
        limit: 10,
      });

      expect(mockDb.prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            user: expect.any(Object),
            images: expect.any(Object),
            workouts: expect.any(Object),
            _count: expect.any(Object),
          }),
        }),
      );
    });

    it("should handle cursor pagination", async () => {
      mockDb.prisma.post.findMany.mockResolvedValue([]);

      await repo.getPostFeed({
        userId: "me",
        followingIds: [],
        cursor: "cursor-abc",
        limit: 10,
      });

      expect(mockDb.prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: { id: "cursor-abc" },
          skip: 1,
          take: 11,
        }),
      );
    });

    it("should fetch limit+1 items for hasMore detection", async () => {
      mockDb.prisma.post.findMany.mockResolvedValue([]);

      await repo.getPostFeed({
        userId: "me",
        followingIds: [],
        limit: 20,
      });

      expect(mockDb.prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 21,
        }),
      );
    });
  });

  describe("getWorkoutFeed", () => {
    it("should fetch workouts with correct visibility filters", async () => {
      const workouts = [{ id: "w1" }, { id: "w2" }];
      mockDb.prisma.workout.findMany.mockResolvedValue(workouts);

      const result = await repo.getWorkoutFeed({
        userId: "me",
        followingIds: ["user1", "user2"],
        limit: 10,
      });

      expect(result).toEqual(workouts);
      expect(mockDb.prisma.workout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            OR: [
              { userId: "me" },
              {
                userId: { in: ["user1", "user2"] },
                visibility: "PUBLIC",
              },
              {
                userId: { in: ["user1", "user2"] },
                visibility: "FOLLOWERS",
              },
            ],
          }),
        }),
      );
    });

    it("should exclude workouts linked to posts when excludeLinkedToPost=true", async () => {
      mockDb.prisma.workout.findMany.mockResolvedValue([]);

      await repo.getWorkoutFeed({
        userId: "me",
        followingIds: [],
        limit: 10,
        excludeLinkedToPost: true,
      });

      expect(mockDb.prisma.workout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            postWorkouts: { none: {} },
          }),
        }),
      );
    });

    it("should not exclude linked workouts when excludeLinkedToPost=false", async () => {
      mockDb.prisma.workout.findMany.mockResolvedValue([]);

      await repo.getWorkoutFeed({
        userId: "me",
        followingIds: [],
        limit: 10,
        excludeLinkedToPost: false,
      });

      const call = mockDb.prisma.workout.findMany.mock.calls[0][0];
      expect(call.where).not.toHaveProperty("postWorkouts");
    });

    it("should include user, workoutType, and counts", async () => {
      mockDb.prisma.workout.findMany.mockResolvedValue([]);

      await repo.getWorkoutFeed({
        userId: "me",
        followingIds: [],
        limit: 10,
      });

      expect(mockDb.prisma.workout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            user: expect.any(Object),
            workoutType: expect.any(Object),
            _count: expect.any(Object),
          }),
        }),
      );
    });

    it("should handle cursor pagination", async () => {
      mockDb.prisma.workout.findMany.mockResolvedValue([]);

      await repo.getWorkoutFeed({
        userId: "me",
        followingIds: [],
        cursor: "cursor-xyz",
        limit: 15,
      });

      expect(mockDb.prisma.workout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: { id: "cursor-xyz" },
          skip: 1,
          take: 16,
        }),
      );
    });
  });
});
