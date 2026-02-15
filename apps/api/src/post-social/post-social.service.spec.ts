import { Test } from "@nestjs/testing";
import { PostSocialService } from "./post-social.service";
import { PostSocialRepository } from "./repositories/post-social.repository";
import { NotFoundException, ForbiddenException, ConflictException } from "@nestjs/common";

const mockPostSocialRepository = {
  likePost: jest.fn(),
  unlikePost: jest.fn(),
  isLiked: jest.fn(),
  getLikeCount: jest.fn(),
  addComment: jest.fn(),
  deleteComment: jest.fn(),
  getComments: jest.fn(),
  findCommentById: jest.fn(),
};

describe("PostSocialService", () => {
  let service: PostSocialService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        PostSocialService,
        { provide: PostSocialRepository, useValue: mockPostSocialRepository },
      ],
    }).compile();
    service = module.get(PostSocialService);
  });

  describe("likePost", () => {
    it("should delegate to postSocialRepo.likePost", async () => {
      const userId = "user-123";
      const postId = "post-456";
      const mockLike = { id: "like-1", userId, postId, createdAt: new Date() };
      mockPostSocialRepository.likePost.mockResolvedValue(mockLike);

      const result = await service.likePost(userId, postId);

      expect(mockPostSocialRepository.likePost).toHaveBeenCalledWith(userId, postId);
      expect(result).toEqual(mockLike);
    });

    it("should throw ConflictException on duplicate like (P2002)", async () => {
      const error = { code: "P2002", message: "Unique constraint failed" };
      mockPostSocialRepository.likePost.mockRejectedValue(error);

      await expect(service.likePost("user-123", "post-456")).rejects.toThrow(
        new ConflictException("이미 좋아요한 게시글입니다.")
      );
    });

    it("should rethrow other errors", async () => {
      const error = new Error("Unexpected error");
      mockPostSocialRepository.likePost.mockRejectedValue(error);

      await expect(service.likePost("user-123", "post-456")).rejects.toThrow(error);
    });
  });

  describe("unlikePost", () => {
    it("should delegate to postSocialRepo.unlikePost", async () => {
      const userId = "user-123";
      const postId = "post-456";
      const mockDeleted = { id: "like-1", userId, postId };
      mockPostSocialRepository.unlikePost.mockResolvedValue(mockDeleted);

      const result = await service.unlikePost(userId, postId);

      expect(mockPostSocialRepository.unlikePost).toHaveBeenCalledWith(userId, postId);
      expect(result).toEqual(mockDeleted);
    });

    it("should throw NotFoundException if like does not exist (P2025)", async () => {
      const error = { code: "P2025", message: "Record to delete does not exist" };
      mockPostSocialRepository.unlikePost.mockRejectedValue(error);

      await expect(service.unlikePost("user-123", "post-456")).rejects.toThrow(
        new NotFoundException("좋아요 기록을 찾을 수 없습니다.")
      );
    });
  });

  describe("isLiked", () => {
    it("should delegate to postSocialRepo.isLiked", async () => {
      const userId = "user-123";
      const postId = "post-456";
      mockPostSocialRepository.isLiked.mockResolvedValue(true);

      const result = await service.isLiked(userId, postId);

      expect(mockPostSocialRepository.isLiked).toHaveBeenCalledWith(userId, postId);
      expect(result).toBe(true);
    });
  });

  describe("getLikeCount", () => {
    it("should delegate to postSocialRepo.getLikeCount", async () => {
      const postId = "post-456";
      mockPostSocialRepository.getLikeCount.mockResolvedValue(42);

      const result = await service.getLikeCount(postId);

      expect(mockPostSocialRepository.getLikeCount).toHaveBeenCalledWith(postId);
      expect(result).toBe(42);
    });
  });

  describe("addComment", () => {
    it("should delegate to postSocialRepo.addComment with all fields", async () => {
      const userId = "user-123";
      const postId = "post-456";
      const content = "@Alice Great post!";
      const parentId = "comment-1";
      const mentionedUserId = "user-789";
      const mockComment = {
        id: "comment-2",
        userId,
        postId,
        content,
        parentId,
        mentionedUserId,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: userId, name: "Bob", profileImage: null },
      };
      mockPostSocialRepository.addComment.mockResolvedValue(mockComment);

      const result = await service.addComment(userId, postId, content, parentId, mentionedUserId);

      expect(mockPostSocialRepository.addComment).toHaveBeenCalledWith({
        userId,
        postId,
        content,
        parentId,
        mentionedUserId,
      });
      expect(result).toEqual(mockComment);
    });

    it("should convert undefined parentId and mentionedUserId to null", async () => {
      const userId = "user-123";
      const postId = "post-456";
      const content = "Top-level comment";
      const mockComment = {
        id: "comment-1",
        userId,
        postId,
        content,
        parentId: null,
        mentionedUserId: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: userId, name: "Alice", profileImage: "alice.jpg" },
      };
      mockPostSocialRepository.addComment.mockResolvedValue(mockComment);

      const result = await service.addComment(userId, postId, content);

      expect(mockPostSocialRepository.addComment).toHaveBeenCalledWith({
        userId,
        postId,
        content,
        parentId: null,
        mentionedUserId: null,
      });
      expect(result).toEqual(mockComment);
    });
  });

  describe("deleteComment", () => {
    it("should delete comment if user is owner", async () => {
      const commentId = "comment-123";
      const userId = "user-123";
      const mockComment = {
        id: commentId,
        userId,
        postId: "post-456",
        content: "Test",
        parentId: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockDeleted = { ...mockComment, deletedAt: new Date() };
      mockPostSocialRepository.findCommentById.mockResolvedValue(mockComment);
      mockPostSocialRepository.deleteComment.mockResolvedValue(mockDeleted);

      const result = await service.deleteComment(commentId, userId);

      expect(mockPostSocialRepository.findCommentById).toHaveBeenCalledWith(commentId);
      expect(mockPostSocialRepository.deleteComment).toHaveBeenCalledWith(commentId);
      expect(result).toEqual(mockDeleted);
    });

    it("should throw NotFoundException if comment does not exist", async () => {
      mockPostSocialRepository.findCommentById.mockResolvedValue(null);

      await expect(service.deleteComment("comment-123", "user-123")).rejects.toThrow(
        new NotFoundException("댓글을 찾을 수 없습니다.")
      );
      expect(mockPostSocialRepository.deleteComment).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenException if user is not owner", async () => {
      const commentId = "comment-123";
      const mockComment = {
        id: commentId,
        userId: "user-999",
        postId: "post-456",
        content: "Test",
        deletedAt: null,
      };
      mockPostSocialRepository.findCommentById.mockResolvedValue(mockComment);

      await expect(service.deleteComment(commentId, "user-123")).rejects.toThrow(
        new ForbiddenException("본인의 댓글만 삭제할 수 있습니다.")
      );
      expect(mockPostSocialRepository.deleteComment).not.toHaveBeenCalled();
    });

    it("should throw ConflictException if comment is already deleted", async () => {
      const commentId = "comment-123";
      const userId = "user-123";
      const mockComment = {
        id: commentId,
        userId,
        postId: "post-456",
        content: "Test",
        deletedAt: new Date(),
      };
      mockPostSocialRepository.findCommentById.mockResolvedValue(mockComment);

      await expect(service.deleteComment(commentId, userId)).rejects.toThrow(
        new ConflictException("이미 삭제된 댓글입니다.")
      );
      expect(mockPostSocialRepository.deleteComment).not.toHaveBeenCalled();
    });
  });

  describe("getComments", () => {
    it("should delegate to postSocialRepo.getComments with all parameters", async () => {
      const postId = "post-456";
      const cursor = "comment-10";
      const limit = 15;
      const mockComments = [
        {
          id: "comment-1",
          userId: "user-1",
          postId,
          content: "Top comment",
          parentId: null,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { id: "user-1", name: "Alice", profileImage: "alice.jpg" },
          replies: [],
        },
      ];
      mockPostSocialRepository.getComments.mockResolvedValue(mockComments);

      const result = await service.getComments(postId, cursor, limit);

      expect(mockPostSocialRepository.getComments).toHaveBeenCalledWith(postId, cursor, limit);
      expect(result).toEqual(mockComments);
    });

    it("should delegate with default parameters when cursor and limit are undefined", async () => {
      const postId = "post-456";
      mockPostSocialRepository.getComments.mockResolvedValue([]);

      await service.getComments(postId);

      expect(mockPostSocialRepository.getComments).toHaveBeenCalledWith(postId, undefined, undefined);
    });
  });
});
