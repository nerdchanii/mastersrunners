import { Test } from "@nestjs/testing";
import { PostSocialRepository } from "./post-social.repository";
import { DatabaseService } from "../../database/database.service";

const mockPrisma = {
  postLike: {
    create: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
  postComment: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe("PostSocialRepository", () => {
  let repository: PostSocialRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        PostSocialRepository,
        { provide: DatabaseService, useValue: { prisma: mockPrisma } },
      ],
    }).compile();
    repository = module.get(PostSocialRepository);
  });

  describe("likePost", () => {
    it("should create a PostLike record", async () => {
      const userId = "user-123";
      const postId = "post-456";
      const mockLike = { id: "like-1", userId, postId, createdAt: new Date() };
      mockPrisma.postLike.create.mockResolvedValue(mockLike);

      const result = await repository.likePost(userId, postId);

      expect(mockPrisma.postLike.create).toHaveBeenCalledWith({
        data: { userId, postId },
      });
      expect(result).toEqual(mockLike);
    });
  });

  describe("unlikePost", () => {
    it("should delete the PostLike record", async () => {
      const userId = "user-123";
      const postId = "post-456";
      const mockDeleted = { id: "like-1", userId, postId };
      mockPrisma.postLike.delete.mockResolvedValue(mockDeleted);

      const result = await repository.unlikePost(userId, postId);

      expect(mockPrisma.postLike.delete).toHaveBeenCalledWith({
        where: {
          userId_postId: { userId, postId },
        },
      });
      expect(result).toEqual(mockDeleted);
    });
  });

  describe("isLiked", () => {
    it("should return true if user liked the post", async () => {
      const userId = "user-123";
      const postId = "post-456";
      mockPrisma.postLike.findUnique.mockResolvedValue({ id: "like-1", userId, postId });

      const result = await repository.isLiked(userId, postId);

      expect(mockPrisma.postLike.findUnique).toHaveBeenCalledWith({
        where: {
          userId_postId: { userId, postId },
        },
      });
      expect(result).toBe(true);
    });

    it("should return false if user has not liked the post", async () => {
      mockPrisma.postLike.findUnique.mockResolvedValue(null);

      const result = await repository.isLiked("user-123", "post-456");

      expect(result).toBe(false);
    });
  });

  describe("getLikeCount", () => {
    it("should return the total count of likes for a post", async () => {
      const postId = "post-456";
      mockPrisma.postLike.count.mockResolvedValue(42);

      const result = await repository.getLikeCount(postId);

      expect(mockPrisma.postLike.count).toHaveBeenCalledWith({
        where: { postId },
      });
      expect(result).toBe(42);
    });
  });

  describe("getLikers", () => {
    it("should return users who liked the post with default limit", async () => {
      const postId = "post-456";
      const mockLikes = [
        { user: { id: "user-1", name: "Alice", profileImage: "alice.jpg" } },
        { user: { id: "user-2", name: "Bob", profileImage: null } },
      ];
      mockPrisma.postLike.findMany.mockResolvedValue(mockLikes);

      const result = await repository.getLikers(postId);

      expect(mockPrisma.postLike.findMany).toHaveBeenCalledWith({
        where: { postId },
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      });
      expect(result).toEqual([
        { id: "user-1", name: "Alice", profileImage: "alice.jpg" },
        { id: "user-2", name: "Bob", profileImage: null },
      ]);
    });

    it("should accept custom limit", async () => {
      const postId = "post-456";
      mockPrisma.postLike.findMany.mockResolvedValue([]);

      await repository.getLikers(postId, 5);

      expect(mockPrisma.postLike.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 })
      );
    });

    it("should exclude likers from specified users", async () => {
      const postId = "post-456";
      const excludeUserIds = ["blocked-1", "blocked-2"];
      mockPrisma.postLike.findMany.mockResolvedValue([]);

      await repository.getLikers(postId, 10, excludeUserIds);

      expect(mockPrisma.postLike.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { postId, userId: { notIn: excludeUserIds } },
        })
      );
    });

    it("should not add userId filter when excludeUserIds is empty", async () => {
      const postId = "post-456";
      mockPrisma.postLike.findMany.mockResolvedValue([]);

      await repository.getLikers(postId, 10, []);

      expect(mockPrisma.postLike.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { postId },
        })
      );
    });
  });

  describe("addComment", () => {
    it("should create a top-level comment", async () => {
      const data = {
        userId: "user-123",
        postId: "post-456",
        content: "Great post!",
      };
      const mockComment = {
        id: "comment-1",
        ...data,
        parentId: null,
        mentionedUserId: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: "user-123", name: "Alice", profileImage: "alice.jpg" },
      };
      mockPrisma.postComment.create.mockResolvedValue(mockComment);

      const result = await repository.addComment(data);

      expect(mockPrisma.postComment.create).toHaveBeenCalledWith({
        data: {
          userId: data.userId,
          postId: data.postId,
          content: data.content,
          parentId: null,
          mentionedUserId: null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      });
      expect(result).toEqual(mockComment);
    });

    it("should create a reply with parentId and mentionedUserId", async () => {
      const data = {
        userId: "user-456",
        postId: "post-789",
        content: "@Alice I agree!",
        parentId: "comment-1",
        mentionedUserId: "user-123",
      };
      const mockComment = {
        id: "comment-2",
        ...data,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: "user-456", name: "Bob", profileImage: null },
      };
      mockPrisma.postComment.create.mockResolvedValue(mockComment);

      const result = await repository.addComment(data);

      expect(mockPrisma.postComment.create).toHaveBeenCalledWith({
        data: {
          userId: data.userId,
          postId: data.postId,
          content: data.content,
          parentId: data.parentId,
          mentionedUserId: data.mentionedUserId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      });
      expect(result).toEqual(mockComment);
    });
  });

  describe("deleteComment", () => {
    it("should soft delete a comment by setting deletedAt", async () => {
      const commentId = "comment-123";
      const now = new Date();
      const mockDeleted = { id: commentId, deletedAt: now };
      mockPrisma.postComment.update.mockResolvedValue(mockDeleted);

      const result = await repository.deleteComment(commentId);

      expect(mockPrisma.postComment.update).toHaveBeenCalledWith({
        where: { id: commentId },
        data: { deletedAt: expect.any(Date) },
      });
      expect(result).toEqual(mockDeleted);
    });
  });

  describe("getComments", () => {
    it("should fetch top-level comments with nested replies", async () => {
      const postId = "post-456";
      const mockComments = [
        {
          id: "comment-1",
          userId: "user-1",
          postId,
          content: "Top comment",
          parentId: null,
          deletedAt: null,
          createdAt: new Date("2026-02-15"),
          updatedAt: new Date("2026-02-15"),
          user: { id: "user-1", name: "Alice", profileImage: "alice.jpg" },
          replies: [
            {
              id: "comment-2",
              userId: "user-2",
              postId,
              content: "Reply to Alice",
              parentId: "comment-1",
              mentionedUserId: "user-1",
              deletedAt: null,
              createdAt: new Date("2026-02-15"),
              updatedAt: new Date("2026-02-15"),
              user: { id: "user-2", name: "Bob", profileImage: null },
            },
          ],
        },
      ];
      mockPrisma.postComment.findMany.mockResolvedValue(mockComments);

      const result = await repository.getComments(postId);

      expect(mockPrisma.postComment.findMany).toHaveBeenCalledWith({
        where: {
          postId,
          parentId: null,
          deletedAt: null,
        },
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          replies: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockComments);
    });

    it("should handle cursor-based pagination", async () => {
      const postId = "post-456";
      const cursor = "comment-10";
      mockPrisma.postComment.findMany.mockResolvedValue([]);

      await repository.getComments(postId, cursor, 10);

      expect(mockPrisma.postComment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 1,
          cursor: { id: cursor },
          take: 10,
        })
      );
    });

    it("should exclude comments from specified users", async () => {
      const postId = "post-456";
      const excludeUserIds = ["blocked-1", "blocked-2"];
      mockPrisma.postComment.findMany.mockResolvedValue([]);

      await repository.getComments(postId, undefined, 20, excludeUserIds);

      expect(mockPrisma.postComment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: { notIn: excludeUserIds },
          }),
        })
      );
    });

    it("should exclude replies from specified users", async () => {
      const postId = "post-456";
      const excludeUserIds = ["blocked-1"];
      mockPrisma.postComment.findMany.mockResolvedValue([]);

      await repository.getComments(postId, undefined, 20, excludeUserIds);

      expect(mockPrisma.postComment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            replies: expect.objectContaining({
              where: expect.objectContaining({
                userId: { notIn: excludeUserIds },
              }),
            }),
          }),
        })
      );
    });

    it("should not add userId filter when excludeUserIds is empty", async () => {
      const postId = "post-456";
      mockPrisma.postComment.findMany.mockResolvedValue([]);

      await repository.getComments(postId, undefined, 20, []);

      const callArgs = mockPrisma.postComment.findMany.mock.calls[0][0];
      expect(callArgs.where.userId).toBeUndefined();
    });
  });

  describe("getCommentCount", () => {
    it("should return count of non-deleted comments", async () => {
      const postId = "post-456";
      mockPrisma.postComment.count.mockResolvedValue(15);

      const result = await repository.getCommentCount(postId);

      expect(mockPrisma.postComment.count).toHaveBeenCalledWith({
        where: {
          postId,
          deletedAt: null,
        },
      });
      expect(result).toBe(15);
    });
  });

  describe("findCommentById", () => {
    it("should find comment by id", async () => {
      const commentId = "comment-123";
      const mockComment = {
        id: commentId,
        userId: "user-123",
        postId: "post-456",
        content: "Test",
        deletedAt: null,
      };
      mockPrisma.postComment.findUnique.mockResolvedValue(mockComment);

      const result = await repository.findCommentById(commentId);

      expect(mockPrisma.postComment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId },
      });
      expect(result).toEqual(mockComment);
    });

    it("should return null if comment not found", async () => {
      mockPrisma.postComment.findUnique.mockResolvedValue(null);

      const result = await repository.findCommentById("non-existent");

      expect(result).toBeNull();
    });
  });
});
