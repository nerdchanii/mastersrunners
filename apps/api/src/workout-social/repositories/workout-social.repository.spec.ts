import { Test } from "@nestjs/testing";
import { WorkoutSocialRepository } from "./workout-social.repository";
import { DatabaseService } from "../../database/database.service";

const mockPrisma = {
  workoutLike: {
    create: jest.fn(),
    deleteMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
  workoutComment: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
  },
};

describe("WorkoutSocialRepository", () => {
  let repository: WorkoutSocialRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        WorkoutSocialRepository,
        { provide: DatabaseService, useValue: { prisma: mockPrisma } },
      ],
    }).compile();
    repository = module.get(WorkoutSocialRepository);
  });

  describe("likeWorkout", () => {
    it("should create a workout like", async () => {
      const userId = "user-123";
      const workoutId = "workout-456";
      const mockLike = { id: "like-1", userId, workoutId, createdAt: new Date() };
      mockPrisma.workoutLike.create.mockResolvedValue(mockLike);

      const result = await repository.likeWorkout(userId, workoutId);

      expect(mockPrisma.workoutLike.create).toHaveBeenCalledWith({
        data: { userId, workoutId },
      });
      expect(result).toEqual(mockLike);
    });
  });

  describe("unlikeWorkout", () => {
    it("should delete workout likes matching userId and workoutId", async () => {
      const userId = "user-123";
      const workoutId = "workout-456";
      mockPrisma.workoutLike.deleteMany.mockResolvedValue({ count: 1 });

      const result = await repository.unlikeWorkout(userId, workoutId);

      expect(mockPrisma.workoutLike.deleteMany).toHaveBeenCalledWith({
        where: { userId, workoutId },
      });
      expect(result).toEqual({ count: 1 });
    });
  });

  describe("isLiked", () => {
    it("should return true if like exists", async () => {
      const userId = "user-123";
      const workoutId = "workout-456";
      const mockLike = { id: "like-1", userId, workoutId };
      mockPrisma.workoutLike.findUnique.mockResolvedValue(mockLike);

      const result = await repository.isLiked(userId, workoutId);

      expect(mockPrisma.workoutLike.findUnique).toHaveBeenCalledWith({
        where: { userId_workoutId: { userId, workoutId } },
      });
      expect(result).toBe(true);
    });

    it("should return false if like does not exist", async () => {
      mockPrisma.workoutLike.findUnique.mockResolvedValue(null);

      const result = await repository.isLiked("user-123", "workout-456");

      expect(result).toBe(false);
    });
  });

  describe("getLikeCount", () => {
    it("should count workout likes", async () => {
      const workoutId = "workout-456";
      mockPrisma.workoutLike.count.mockResolvedValue(42);

      const result = await repository.getLikeCount(workoutId);

      expect(mockPrisma.workoutLike.count).toHaveBeenCalledWith({
        where: { workoutId },
      });
      expect(result).toBe(42);
    });
  });

  describe("getLikers", () => {
    it("should return users who liked the workout with default limit", async () => {
      const workoutId = "workout-456";
      const mockLikers = [
        { user: { id: "user-1", name: "Alice", profileImage: "pic1.jpg" }, createdAt: new Date() },
        { user: { id: "user-2", name: "Bob", profileImage: null }, createdAt: new Date() },
      ];
      mockPrisma.workoutLike.findMany.mockResolvedValue(mockLikers);

      const result = await repository.getLikers(workoutId);

      expect(mockPrisma.workoutLike.findMany).toHaveBeenCalledWith({
        where: { workoutId },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      expect(result).toEqual(mockLikers);
    });

    it("should accept custom limit", async () => {
      const workoutId = "workout-456";
      mockPrisma.workoutLike.findMany.mockResolvedValue([]);

      await repository.getLikers(workoutId, 5);

      expect(mockPrisma.workoutLike.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    });

    it("should exclude likers from specified users", async () => {
      const workoutId = "workout-456";
      const excludeUserIds = ["blocked-1", "blocked-2"];
      mockPrisma.workoutLike.findMany.mockResolvedValue([]);

      await repository.getLikers(workoutId, 10, excludeUserIds);

      expect(mockPrisma.workoutLike.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { workoutId, userId: { notIn: excludeUserIds } },
        }),
      );
    });

    it("should not add userId filter when excludeUserIds is empty", async () => {
      const workoutId = "workout-456";
      mockPrisma.workoutLike.findMany.mockResolvedValue([]);

      await repository.getLikers(workoutId, 10, []);

      expect(mockPrisma.workoutLike.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { workoutId },
        }),
      );
    });
  });

  describe("addComment", () => {
    it("should create a workout comment", async () => {
      const commentData = {
        userId: "user-123",
        workoutId: "workout-456",
        content: "Great run!",
      };
      const mockComment = { id: "comment-1", ...commentData, createdAt: new Date(), updatedAt: new Date() };
      mockPrisma.workoutComment.create.mockResolvedValue(mockComment);

      const result = await repository.addComment(commentData);

      expect(mockPrisma.workoutComment.create).toHaveBeenCalledWith({
        data: commentData,
      });
      expect(result).toEqual(mockComment);
    });

    it("should create a reply comment with parentId", async () => {
      const commentData = {
        userId: "user-123",
        workoutId: "workout-456",
        content: "Reply!",
        parentId: "comment-parent-1",
      };
      const mockComment = { id: "comment-2", ...commentData, createdAt: new Date(), updatedAt: new Date() };
      mockPrisma.workoutComment.create.mockResolvedValue(mockComment);

      const result = await repository.addComment(commentData);

      expect(mockPrisma.workoutComment.create).toHaveBeenCalledWith({
        data: commentData,
      });
      expect(result).toEqual(mockComment);
    });

    it("should create a comment with mentionedUserIds", async () => {
      const commentData = {
        userId: "user-123",
        workoutId: "workout-456",
        content: "Hey @user-2!",
        mentionedUserIds: ["user-2", "user-3"],
      };
      const mockComment = { id: "comment-3", ...commentData, createdAt: new Date(), updatedAt: new Date() };
      mockPrisma.workoutComment.create.mockResolvedValue(mockComment);

      const result = await repository.addComment(commentData);

      expect(mockPrisma.workoutComment.create).toHaveBeenCalledWith({
        data: commentData,
      });
      expect(result).toEqual(mockComment);
    });
  });

  describe("deleteComment", () => {
    it("should soft delete comment by setting deletedAt", async () => {
      const commentId = "comment-123";
      const mockDeleted = { id: commentId, deletedAt: new Date() };
      mockPrisma.workoutComment.update.mockResolvedValue(mockDeleted);

      const result = await repository.deleteComment(commentId);

      expect(mockPrisma.workoutComment.update).toHaveBeenCalledWith({
        where: { id: commentId },
        data: { deletedAt: expect.any(Date) },
      });
      expect(result).toEqual(mockDeleted);
    });
  });

  describe("getComments", () => {
    const userSelect = { select: { id: true, name: true, profileImage: true } };

    it("should fetch top-level comments with nested replies", async () => {
      const workoutId = "workout-456";
      const mockComments = [
        {
          id: "comment-1",
          content: "Nice!",
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { id: "user-1", name: "Alice", profileImage: null },
          replies: [],
        },
      ];
      mockPrisma.workoutComment.findMany.mockResolvedValue(mockComments);

      const result = await repository.getComments(workoutId);

      expect(mockPrisma.workoutComment.findMany).toHaveBeenCalledWith({
        where: {
          workoutId,
          parentId: null,
          deletedAt: null,
        },
        take: 20,
        include: {
          user: userSelect,
          replies: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
            include: { user: userSelect },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(mockComments);
    });

    it("should fetch comments with cursor for pagination", async () => {
      const workoutId = "workout-456";
      const cursor = "comment-10";
      mockPrisma.workoutComment.findMany.mockResolvedValue([]);

      await repository.getComments(workoutId, cursor, 15);

      expect(mockPrisma.workoutComment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { workoutId, parentId: null, deletedAt: null },
          take: 15,
          skip: 1,
          cursor: { id: cursor },
        }),
      );
    });

    it("should exclude deleted comments", async () => {
      const workoutId = "workout-456";
      mockPrisma.workoutComment.findMany.mockResolvedValue([]);

      await repository.getComments(workoutId);

      expect(mockPrisma.workoutComment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null, parentId: null }),
        }),
      );
    });

    it("should exclude comments from specified users", async () => {
      const workoutId = "workout-456";
      const excludeUserIds = ["blocked-1", "blocked-2"];
      mockPrisma.workoutComment.findMany.mockResolvedValue([]);

      await repository.getComments(workoutId, undefined, 20, excludeUserIds);

      expect(mockPrisma.workoutComment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: { notIn: excludeUserIds },
          }),
        }),
      );
    });

    it("should not add userId filter when excludeUserIds is empty", async () => {
      const workoutId = "workout-456";
      mockPrisma.workoutComment.findMany.mockResolvedValue([]);

      await repository.getComments(workoutId, undefined, 20, []);

      const callArgs = mockPrisma.workoutComment.findMany.mock.calls[0][0];
      expect(callArgs.where.userId).toBeUndefined();
    });
  });

  describe("getCommentCount", () => {
    it("should count non-deleted comments", async () => {
      const workoutId = "workout-456";
      mockPrisma.workoutComment.count.mockResolvedValue(15);

      const result = await repository.getCommentCount(workoutId);

      expect(mockPrisma.workoutComment.count).toHaveBeenCalledWith({
        where: {
          workoutId,
          deletedAt: null,
        },
      });
      expect(result).toBe(15);
    });
  });

  describe("findCommentById", () => {
    it("should find non-deleted comment by id", async () => {
      const commentId = "comment-123";
      const mockComment = { id: commentId, userId: "user-123", content: "Test", deletedAt: null };
      mockPrisma.workoutComment.findFirst.mockResolvedValue(mockComment);

      const result = await repository.findCommentById(commentId);

      expect(mockPrisma.workoutComment.findFirst).toHaveBeenCalledWith({
        where: {
          id: commentId,
          deletedAt: null,
        },
      });
      expect(result).toEqual(mockComment);
    });

    it("should return null for deleted comment", async () => {
      mockPrisma.workoutComment.findFirst.mockResolvedValue(null);

      const result = await repository.findCommentById("deleted-comment");

      expect(result).toBeNull();
    });
  });
});
