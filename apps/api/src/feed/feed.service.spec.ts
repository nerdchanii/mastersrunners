import { Test } from "@nestjs/testing";

import { BlockRepository } from "../block/repositories/block.repository";

import { FeedRepository } from "./repositories/feed.repository";
import { FeedService } from "./feed.service";

const mockFeedRepo = {
  getFollowingIds: jest.fn(),
  getPostFeed: jest.fn(),
  getWorkoutFeed: jest.fn(),
};

const mockBlockRepo = {
  getBlockedUserIds: jest.fn(),
};

describe("FeedService", () => {
  let service: FeedService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockBlockRepo.getBlockedUserIds.mockResolvedValue([]);

    const module = await Test.createTestingModule({
      providers: [
        FeedService,
        { provide: FeedRepository, useValue: mockFeedRepo },
        { provide: BlockRepository, useValue: mockBlockRepo },
      ],
    }).compile();

    service = module.get(FeedService);
  });

  describe("getPostFeed", () => {
    it("should skip following and block lookups for anonymous post feed reads", async () => {
      mockFeedRepo.getPostFeed.mockResolvedValue([]);

      await service.getPostFeed(undefined, undefined, 10);

      expect(mockFeedRepo.getFollowingIds).not.toHaveBeenCalled();
      expect(mockBlockRepo.getBlockedUserIds).not.toHaveBeenCalled();
      expect(mockFeedRepo.getPostFeed).toHaveBeenCalledWith({
        userId: undefined,
        followingIds: [],
        cursor: undefined,
        limit: 10,
      });
    });

    it("should fetch following IDs and return post feed with pagination", async () => {
      mockFeedRepo.getFollowingIds.mockResolvedValue(["user1", "user2"]);
      const posts = Array.from({ length: 11 }, (_, i) => ({ id: `p${i}` }));
      mockFeedRepo.getPostFeed.mockResolvedValue(posts);

      const result = await service.getPostFeed("me", undefined, 10);

      expect(mockFeedRepo.getFollowingIds).toHaveBeenCalledWith("me");
      expect(mockFeedRepo.getPostFeed).toHaveBeenCalledWith({
        userId: "me",
        followingIds: ["user1", "user2"],
        cursor: undefined,
        limit: 10,
      });
      expect(result.hasMore).toBe(true);
      expect(result.items).toHaveLength(10);
      expect(result.nextCursor).toBe("p9");
    });

    it("should set hasMore=false when no more posts", async () => {
      mockFeedRepo.getFollowingIds.mockResolvedValue([]);
      const posts = [{ id: "p1" }, { id: "p2" }];
      mockFeedRepo.getPostFeed.mockResolvedValue(posts);

      const result = await service.getPostFeed("me", undefined, 10);

      expect(result.hasMore).toBe(false);
      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBeNull();
    });

    it("should return empty result when no posts", async () => {
      mockFeedRepo.getFollowingIds.mockResolvedValue([]);
      mockFeedRepo.getPostFeed.mockResolvedValue([]);

      const result = await service.getPostFeed("me", undefined, 10);

      expect(result.items).toEqual([]);
      expect(result.nextCursor).toBeNull();
      expect(result.hasMore).toBe(false);
    });

    it("should pass cursor to repository", async () => {
      mockFeedRepo.getFollowingIds.mockResolvedValue([]);
      mockFeedRepo.getPostFeed.mockResolvedValue([]);

      await service.getPostFeed("me", "cursor-abc", 20);

      expect(mockFeedRepo.getPostFeed).toHaveBeenCalledWith({
        userId: "me",
        followingIds: [],
        cursor: "cursor-abc",
        limit: 20,
      });
    });

    it("should exclude blocked user IDs from followingIds", async () => {
      mockFeedRepo.getFollowingIds.mockResolvedValue(["user1", "user2", "user3"]);
      mockBlockRepo.getBlockedUserIds.mockResolvedValue(["user2"]);
      mockFeedRepo.getPostFeed.mockResolvedValue([]);

      await service.getPostFeed("me", undefined, 10);

      expect(mockBlockRepo.getBlockedUserIds).toHaveBeenCalledWith("me");
      expect(mockFeedRepo.getPostFeed).toHaveBeenCalledWith({
        userId: "me",
        followingIds: ["user1", "user3"],
        cursor: undefined,
        limit: 10,
      });
    });

    it("should normalize post image fields for the web read contract", async () => {
      mockFeedRepo.getFollowingIds.mockResolvedValue([]);
      mockFeedRepo.getPostFeed.mockResolvedValue([
        {
          id: "post-1",
          images: [{ id: "image-1", imageUrl: "https://example.com/feed.png", sortOrder: 3 }],
          likes: [{ id: "like-1" }],
        },
      ]);

      const result = await service.getPostFeed("me", undefined, 10);

      expect(result.items[0].images).toEqual([
        {
          id: "image-1",
          url: "https://example.com/feed.png",
          order: 3,
        },
      ]);
      expect(result.items[0].isLiked).toBe(true);
    });
  });

  describe("getWorkoutFeed", () => {
    it("should skip following and block lookups for anonymous workout feed reads", async () => {
      mockFeedRepo.getWorkoutFeed.mockResolvedValue([]);

      await service.getWorkoutFeed(undefined, undefined, 10);

      expect(mockFeedRepo.getFollowingIds).not.toHaveBeenCalled();
      expect(mockBlockRepo.getBlockedUserIds).not.toHaveBeenCalled();
      expect(mockFeedRepo.getWorkoutFeed).toHaveBeenCalledWith({
        userId: undefined,
        followingIds: [],
        cursor: undefined,
        limit: 10,
        excludeLinkedToPost: undefined,
      });
    });

    it("should fetch following IDs and return workout feed with pagination", async () => {
      mockFeedRepo.getFollowingIds.mockResolvedValue(["user1", "user2"]);
      const workouts = Array.from({ length: 11 }, (_, i) => ({
        id: `w${i}`,
        _count: { workoutLikes: 5, workoutComments: 3 },
      }));
      mockFeedRepo.getWorkoutFeed.mockResolvedValue(workouts);

      const result = await service.getWorkoutFeed("me", undefined, 10);

      expect(mockFeedRepo.getFollowingIds).toHaveBeenCalledWith("me");
      expect(mockFeedRepo.getWorkoutFeed).toHaveBeenCalledWith({
        userId: "me",
        followingIds: ["user1", "user2"],
        cursor: undefined,
        limit: 10,
        excludeLinkedToPost: undefined,
      });
      expect(result.hasMore).toBe(true);
      expect(result.items).toHaveLength(10);
      expect(result.nextCursor).toBe("w9");
      expect(result.items[0]._count).toEqual({ likes: 5, comments: 3 });
    });

    it("should set hasMore=false when no more workouts", async () => {
      mockFeedRepo.getFollowingIds.mockResolvedValue([]);
      const workouts = [{ id: "w1", _count: { workoutLikes: 1, workoutComments: 2 } }];
      mockFeedRepo.getWorkoutFeed.mockResolvedValue(workouts);

      const result = await service.getWorkoutFeed("me", undefined, 10);

      expect(result.hasMore).toBe(false);
      expect(result.items).toHaveLength(1);
      expect(result.nextCursor).toBeNull();
      expect(result.items[0]._count).toEqual({ likes: 1, comments: 2 });
    });

    it("should omit internal detail blob fields from workout feed items", async () => {
      mockFeedRepo.getFollowingIds.mockResolvedValue([]);
      mockFeedRepo.getWorkoutFeed.mockResolvedValue([
        {
          id: "w1",
          detailPath: "workout-details/user-1/run.detail.v1.json",
          detailFormatVersion: 1,
          encodedPolyline: "summary-polyline",
          _count: { workoutLikes: 2, workoutComments: 1 },
          workoutLikes: [],
        },
      ]);

      const result = await service.getWorkoutFeed("me", undefined, 10);

      expect(result.items[0]).toMatchObject({
        id: "w1",
        encodedPolyline: "summary-polyline",
        _count: { likes: 2, comments: 1 },
      });
      expect(result.items[0]).not.toHaveProperty("detailPath");
      expect(result.items[0]).not.toHaveProperty("detailFormatVersion");
    });

    it("should return empty result when no workouts", async () => {
      mockFeedRepo.getFollowingIds.mockResolvedValue([]);
      mockFeedRepo.getWorkoutFeed.mockResolvedValue([]);

      const result = await service.getWorkoutFeed("me", undefined, 10);

      expect(result.items).toEqual([]);
      expect(result.nextCursor).toBeNull();
      expect(result.hasMore).toBe(false);
    });

    it("should pass cursor and excludeLinkedToPost to repository", async () => {
      mockFeedRepo.getFollowingIds.mockResolvedValue([]);
      mockFeedRepo.getWorkoutFeed.mockResolvedValue([]);

      await service.getWorkoutFeed("me", "cursor-xyz", 15, true);

      expect(mockFeedRepo.getWorkoutFeed).toHaveBeenCalledWith({
        userId: "me",
        followingIds: [],
        cursor: "cursor-xyz",
        limit: 15,
        excludeLinkedToPost: true,
      });
    });

    it("should exclude blocked user IDs from followingIds", async () => {
      mockFeedRepo.getFollowingIds.mockResolvedValue(["user1", "user2", "user3"]);
      mockBlockRepo.getBlockedUserIds.mockResolvedValue(["user1", "user3"]);
      mockFeedRepo.getWorkoutFeed.mockResolvedValue([]);

      await service.getWorkoutFeed("me", undefined, 10);

      expect(mockBlockRepo.getBlockedUserIds).toHaveBeenCalledWith("me");
      expect(mockFeedRepo.getWorkoutFeed).toHaveBeenCalledWith({
        userId: "me",
        followingIds: ["user2"],
        cursor: undefined,
        limit: 10,
        excludeLinkedToPost: undefined,
      });
    });
  });
});
