import { Test } from "@nestjs/testing";
import { FeedService } from "./feed.service";
import { FeedRepository } from "./repositories/feed.repository";
import { BlockRepository } from "../block/repositories/block.repository";

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
  });

  describe("getWorkoutFeed", () => {
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
