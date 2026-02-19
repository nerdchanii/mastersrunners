import { Test } from "@nestjs/testing";
import { ConflictException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { WorkoutSocialService } from "./workout-social.service";
import { WorkoutSocialRepository } from "./repositories/workout-social.repository";
import { BlockRepository } from "../block/repositories/block.repository";
import { WorkoutRepository } from "../workouts/repositories/workout.repository";
import type { CreateWorkoutCommentDto } from "./dto/create-workout-comment.dto";

const mockRepository = {
  likeWorkout: jest.fn(),
  unlikeWorkout: jest.fn(),
  isLiked: jest.fn(),
  getLikeCount: jest.fn(),
  addComment: jest.fn(),
  deleteComment: jest.fn(),
  getComments: jest.fn(),
  findCommentById: jest.fn(),
};

const mockBlockRepository = {
  getBlockedUserIds: jest.fn(),
};

const mockWorkoutRepository = {
  findByIdWithUser: jest.fn(),
};

describe("WorkoutSocialService", () => {
  let service: WorkoutSocialService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockBlockRepository.getBlockedUserIds.mockResolvedValue([]);
    mockWorkoutRepository.findByIdWithUser.mockResolvedValue({ id: "workout-456", deletedAt: null });
    const module = await Test.createTestingModule({
      providers: [
        WorkoutSocialService,
        { provide: WorkoutSocialRepository, useValue: mockRepository },
        { provide: BlockRepository, useValue: mockBlockRepository },
        { provide: WorkoutRepository, useValue: mockWorkoutRepository },
      ],
    }).compile();
    service = module.get(WorkoutSocialService);
  });

  describe("likeWorkout", () => {
    it("should delegate to repo.likeWorkout", async () => {
      const userId = "user-123";
      const workoutId = "workout-456";
      const mockLike = { id: "like-1", userId, workoutId, createdAt: new Date() };
      mockRepository.likeWorkout.mockResolvedValue(mockLike);

      const result = await service.likeWorkout(userId, workoutId);

      expect(mockRepository.likeWorkout).toHaveBeenCalledWith(userId, workoutId);
      expect(result).toEqual(mockLike);
    });

    it("should throw ConflictException on duplicate like (P2002)", async () => {
      const userId = "user-123";
      const workoutId = "workout-456";
      const prismaError = { code: "P2002", meta: {} };
      mockRepository.likeWorkout.mockRejectedValue(prismaError);

      await expect(service.likeWorkout(userId, workoutId)).rejects.toThrow(ConflictException);
      await expect(service.likeWorkout(userId, workoutId)).rejects.toThrow("이미 좋아요를 누른 운동입니다.");
    });

    it("should rethrow other errors", async () => {
      const userId = "user-123";
      const workoutId = "workout-456";
      const otherError = new Error("Database error");
      mockRepository.likeWorkout.mockRejectedValue(otherError);

      await expect(service.likeWorkout(userId, workoutId)).rejects.toThrow("Database error");
    });
  });

  describe("unlikeWorkout", () => {
    it("should delegate to repo.unlikeWorkout", async () => {
      const userId = "user-123";
      const workoutId = "workout-456";
      mockRepository.unlikeWorkout.mockResolvedValue({ count: 1 });

      const result = await service.unlikeWorkout(userId, workoutId);

      expect(mockRepository.unlikeWorkout).toHaveBeenCalledWith(userId, workoutId);
      expect(result).toEqual({ count: 1 });
    });
  });

  describe("isLiked", () => {
    it("should delegate to repo.isLiked", async () => {
      const userId = "user-123";
      const workoutId = "workout-456";
      mockRepository.isLiked.mockResolvedValue(true);

      const result = await service.isLiked(userId, workoutId);

      expect(mockRepository.isLiked).toHaveBeenCalledWith(userId, workoutId);
      expect(result).toBe(true);
    });
  });

  describe("getLikeCount", () => {
    it("should delegate to repo.getLikeCount", async () => {
      const workoutId = "workout-456";
      mockRepository.getLikeCount.mockResolvedValue(10);

      const result = await service.getLikeCount(workoutId);

      expect(mockRepository.getLikeCount).toHaveBeenCalledWith(workoutId);
      expect(result).toBe(10);
    });
  });

  describe("addComment", () => {
    it("should delegate to repo.addComment with userId, workoutId, and content", async () => {
      const userId = "user-123";
      const workoutId = "workout-456";
      const dto: CreateWorkoutCommentDto = { content: "Great run!" };
      const mockComment = { id: "comment-1", userId, workoutId, content: dto.content, createdAt: new Date() };
      mockRepository.addComment.mockResolvedValue(mockComment);

      const result = await service.addComment(userId, workoutId, dto);

      expect(mockRepository.addComment).toHaveBeenCalledWith({
        userId,
        workoutId,
        content: dto.content,
      });
      expect(result).toEqual(mockComment);
    });

    it("should pass parentId when creating a reply comment", async () => {
      const userId = "user-123";
      const workoutId = "workout-456";
      const dto: CreateWorkoutCommentDto = { content: "Reply!", parentId: "comment-parent-1" };
      const mockComment = { id: "comment-2", userId, workoutId, content: dto.content, parentId: dto.parentId, createdAt: new Date() };
      mockRepository.addComment.mockResolvedValue(mockComment);

      const result = await service.addComment(userId, workoutId, dto);

      expect(mockRepository.addComment).toHaveBeenCalledWith({
        userId,
        workoutId,
        content: dto.content,
        parentId: dto.parentId,
      });
      expect(result).toEqual(mockComment);
    });

    it("should pass mentionedUserIds when creating a comment with mentions", async () => {
      const userId = "user-123";
      const workoutId = "workout-456";
      const dto: CreateWorkoutCommentDto = { content: "Hey @user-2!", mentionedUserIds: ["user-2", "user-3"] };
      const mockComment = { id: "comment-3", userId, workoutId, content: dto.content, mentionedUserIds: dto.mentionedUserIds, createdAt: new Date() };
      mockRepository.addComment.mockResolvedValue(mockComment);

      const result = await service.addComment(userId, workoutId, dto);

      expect(mockRepository.addComment).toHaveBeenCalledWith({
        userId,
        workoutId,
        content: dto.content,
        mentionedUserIds: dto.mentionedUserIds,
      });
      expect(result).toEqual(mockComment);
    });

    it("should omit parentId from repo call when not provided", async () => {
      const userId = "user-123";
      const workoutId = "workout-456";
      const dto: CreateWorkoutCommentDto = { content: "Top-level comment" };
      mockRepository.addComment.mockResolvedValue({ id: "comment-4" });

      await service.addComment(userId, workoutId, dto);

      const callArg = mockRepository.addComment.mock.calls[0][0];
      expect(callArg.parentId).toBeUndefined();
    });

    it("should omit mentionedUserIds from repo call when not provided", async () => {
      const userId = "user-123";
      const workoutId = "workout-456";
      const dto: CreateWorkoutCommentDto = { content: "No mentions" };
      mockRepository.addComment.mockResolvedValue({ id: "comment-5" });

      await service.addComment(userId, workoutId, dto);

      const callArg = mockRepository.addComment.mock.calls[0][0];
      expect(callArg.mentionedUserIds).toBeUndefined();
    });
  });

  describe("deleteComment", () => {
    it("should soft delete comment if user is owner", async () => {
      const commentId = "comment-123";
      const userId = "user-123";
      const mockComment = { id: commentId, userId, content: "Test", deletedAt: null };
      const mockDeleted = { ...mockComment, deletedAt: new Date() };
      mockRepository.findCommentById.mockResolvedValue(mockComment);
      mockRepository.deleteComment.mockResolvedValue(mockDeleted);

      const result = await service.deleteComment(commentId, userId);

      expect(mockRepository.findCommentById).toHaveBeenCalledWith(commentId);
      expect(mockRepository.deleteComment).toHaveBeenCalledWith(commentId);
      expect(result).toEqual(mockDeleted);
    });

    it("should throw NotFoundException if comment does not exist", async () => {
      const commentId = "non-existent";
      const userId = "user-123";
      mockRepository.findCommentById.mockResolvedValue(null);

      await expect(service.deleteComment(commentId, userId)).rejects.toThrow(NotFoundException);
      await expect(service.deleteComment(commentId, userId)).rejects.toThrow("댓글을 찾을 수 없습니다.");
      expect(mockRepository.deleteComment).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenException if user is not owner", async () => {
      const commentId = "comment-123";
      const ownerId = "user-456";
      const requestingUserId = "user-789";
      const mockComment = { id: commentId, userId: ownerId, content: "Test", deletedAt: null };
      mockRepository.findCommentById.mockResolvedValue(mockComment);

      await expect(service.deleteComment(commentId, requestingUserId)).rejects.toThrow(ForbiddenException);
      await expect(service.deleteComment(commentId, requestingUserId)).rejects.toThrow("본인의 댓글만 삭제할 수 있습니다.");
      expect(mockRepository.deleteComment).not.toHaveBeenCalled();
    });
  });

  describe("getComments", () => {
    it("should delegate to repo.getComments with default limit", async () => {
      const workoutId = "workout-456";
      const mockComments = [
        { id: "comment-1", content: "Nice!", user: { id: "user-1", name: "Alice" } },
      ];
      mockRepository.getComments.mockResolvedValue(mockComments);

      const result = await service.getComments(workoutId);

      expect(mockRepository.getComments).toHaveBeenCalledWith(workoutId, undefined, 20, []);
      expect(result).toEqual(mockComments);
    });

    it("should delegate to repo.getComments with cursor and custom limit", async () => {
      const workoutId = "workout-456";
      const cursor = "comment-10";
      const limit = 10;
      mockRepository.getComments.mockResolvedValue([]);

      await service.getComments(workoutId, undefined, cursor, limit);

      expect(mockRepository.getComments).toHaveBeenCalledWith(workoutId, cursor, limit, []);
    });

    it("should pass blocked user IDs to repo as excludeUserIds", async () => {
      const workoutId = "workout-456";
      const currentUserId = "me";
      const blockedIds = ["blocked-1", "blocked-2"];
      mockBlockRepository.getBlockedUserIds.mockResolvedValue(blockedIds);
      mockRepository.getComments.mockResolvedValue([]);

      await service.getComments(workoutId, currentUserId);

      expect(mockBlockRepository.getBlockedUserIds).toHaveBeenCalledWith(currentUserId);
      expect(mockRepository.getComments).toHaveBeenCalledWith(
        workoutId, undefined, 20, blockedIds,
      );
    });

    it("should not call blockRepo when currentUserId is not provided", async () => {
      const workoutId = "workout-456";
      mockRepository.getComments.mockResolvedValue([]);

      await service.getComments(workoutId);

      expect(mockBlockRepository.getBlockedUserIds).not.toHaveBeenCalled();
      expect(mockRepository.getComments).toHaveBeenCalledWith(workoutId, undefined, 20, []);
    });
  });
});
