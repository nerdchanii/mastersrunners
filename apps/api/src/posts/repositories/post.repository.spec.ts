import { Test } from "@nestjs/testing";
import { PostRepository } from "./post.repository";
import { DatabaseService } from "../../database/database.service";

const mockDatabaseService = {
  prisma: {
    post: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    postWorkout: {
      createMany: jest.fn(),
      delete: jest.fn(),
    },
    postImage: {
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
};

describe("PostRepository", () => {
  let repository: PostRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        PostRepository,
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();
    repository = module.get(PostRepository);
  });

  describe("create", () => {
    it("should create a post", async () => {
      const data = {
        userId: "user-123",
        content: "테스트 포스트",
        visibility: "FOLLOWERS",
        hashtags: ["러닝"],
      };
      const mockCreated = { id: "post-1", ...data };
      mockDatabaseService.prisma.post.create.mockResolvedValue(mockCreated);

      const result = await repository.create(data);

      expect(mockDatabaseService.prisma.post.create).toHaveBeenCalledWith({ data });
      expect(result).toEqual(mockCreated);
    });
  });

  describe("findById", () => {
    it("should find post by id with all relations", async () => {
      const postId = "post-123";
      const mockPost = {
        id: postId,
        userId: "user-123",
        content: "테스트",
        user: { id: "user-123", name: "홍길동", profileImage: null },
        images: [{ id: "img-1", imageUrl: "https://example.com/img.jpg", sortOrder: 0 }],
        workouts: [],
        _count: { likes: 5, comments: 2 },
      };
      mockDatabaseService.prisma.post.findUnique.mockResolvedValue(mockPost);

      const result = await repository.findById(postId);

      expect(mockDatabaseService.prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          images: {
            orderBy: { sortOrder: "asc" },
          },
          workouts: {
            include: {
              workout: {
                include: {
                  workoutType: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });
      expect(result).toEqual(mockPost);
    });
  });

  describe("findByUser", () => {
    it("should find user posts with default options", async () => {
      const userId = "user-123";
      const mockPosts = [
        { id: "post-1", userId, content: "포스트 1" },
        { id: "post-2", userId, content: "포스트 2" },
      ];
      mockDatabaseService.prisma.post.findMany.mockResolvedValue(mockPosts);

      const result = await repository.findByUser(userId);

      expect(mockDatabaseService.prisma.post.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          deletedAt: null,
        },
        include: expect.any(Object),
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      expect(result).toEqual(mockPosts);
    });

    it("should find user posts with cursor and limit", async () => {
      const userId = "user-123";
      const cursor = "post-10";
      const limit = 15;
      mockDatabaseService.prisma.post.findMany.mockResolvedValue([]);

      await repository.findByUser(userId, { cursor, limit });

      expect(mockDatabaseService.prisma.post.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          deletedAt: null,
        },
        include: expect.any(Object),
        orderBy: { createdAt: "desc" },
        take: 15,
        skip: 1,
        cursor: { id: cursor },
      });
    });
  });

  describe("findForFeed", () => {
    it("should find posts for feed", async () => {
      const followingIds = ["user-1", "user-2", "user-3"];
      const cursor = "post-5";
      const limit = 20;
      const mockPosts = [
        { id: "post-1", userId: "user-1", content: "포스트 1" },
        { id: "post-2", userId: "user-2", content: "포스트 2" },
      ];
      mockDatabaseService.prisma.post.findMany.mockResolvedValue(mockPosts);

      const result = await repository.findForFeed({ followingIds, cursor, limit });

      expect(mockDatabaseService.prisma.post.findMany).toHaveBeenCalledWith({
        where: {
          userId: { in: followingIds },
          deletedAt: null,
        },
        include: expect.any(Object),
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: 1,
        cursor: { id: cursor },
      });
      expect(result).toEqual(mockPosts);
    });
  });

  describe("update", () => {
    it("should update post", async () => {
      const postId = "post-123";
      const data = { content: "수정된 내용", visibility: "PUBLIC" };
      const mockUpdated = { id: postId, ...data };
      mockDatabaseService.prisma.post.update.mockResolvedValue(mockUpdated);

      const result = await repository.update(postId, data);

      expect(mockDatabaseService.prisma.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data,
      });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe("softDelete", () => {
    it("should soft delete post", async () => {
      const postId = "post-123";
      const mockDeleted = { id: postId, deletedAt: new Date() };
      mockDatabaseService.prisma.post.update.mockResolvedValue(mockDeleted);

      const result = await repository.softDelete(postId);

      expect(mockDatabaseService.prisma.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: { deletedAt: expect.any(Date) },
      });
      expect(result).toEqual(mockDeleted);
    });
  });

  describe("addWorkouts", () => {
    it("should add workouts to post", async () => {
      const postId = "post-123";
      const workoutIds = ["workout-1", "workout-2"];
      mockDatabaseService.prisma.postWorkout.createMany.mockResolvedValue({ count: 2 });

      const result = await repository.addWorkouts(postId, workoutIds);

      expect(mockDatabaseService.prisma.postWorkout.createMany).toHaveBeenCalledWith({
        data: [
          { postId, workoutId: "workout-1" },
          { postId, workoutId: "workout-2" },
        ],
      });
      expect(result).toEqual({ count: 2 });
    });
  });

  describe("removeWorkout", () => {
    it("should remove workout from post", async () => {
      const postId = "post-123";
      const workoutId = "workout-1";
      const mockDeleted = { postId, workoutId };
      mockDatabaseService.prisma.postWorkout.delete.mockResolvedValue(mockDeleted);

      const result = await repository.removeWorkout(postId, workoutId);

      expect(mockDatabaseService.prisma.postWorkout.delete).toHaveBeenCalledWith({
        where: {
          postId_workoutId: {
            postId,
            workoutId,
          },
        },
      });
      expect(result).toEqual(mockDeleted);
    });
  });

  describe("addImages", () => {
    it("should add images to post", async () => {
      const postId = "post-123";
      const imageUrls = ["https://example.com/img1.jpg", "https://example.com/img2.jpg"];
      mockDatabaseService.prisma.postImage.createMany.mockResolvedValue({ count: 2 });

      const result = await repository.addImages(postId, imageUrls);

      expect(mockDatabaseService.prisma.postImage.createMany).toHaveBeenCalledWith({
        data: [
          { postId, imageUrl: "https://example.com/img1.jpg", sortOrder: 0 },
          { postId, imageUrl: "https://example.com/img2.jpg", sortOrder: 1 },
        ],
      });
      expect(result).toEqual({ count: 2 });
    });
  });

  describe("createWithRelations", () => {
    it("should create post with workouts and images in transaction", async () => {
      const postData = {
        userId: "user-123",
        content: "테스트",
        visibility: "FOLLOWERS",
        hashtags: ["러닝"],
      };
      const workoutIds = ["workout-1"];
      const imageUrls = ["https://example.com/img.jpg"];
      const mockPost = { id: "post-1", ...postData };

      const mockTx = {
        post: {
          create: jest.fn().mockResolvedValue(mockPost),
        },
        postWorkout: {
          createMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        postImage: {
          createMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
      };

      mockDatabaseService.prisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const result = await repository.createWithRelations(postData, workoutIds, imageUrls);

      expect(mockDatabaseService.prisma.$transaction).toHaveBeenCalled();
      expect(mockTx.post.create).toHaveBeenCalledWith({ data: postData });
      expect(mockTx.postWorkout.createMany).toHaveBeenCalledWith({
        data: [{ postId: "post-1", workoutId: "workout-1" }],
      });
      expect(mockTx.postImage.createMany).toHaveBeenCalledWith({
        data: [{ postId: "post-1", imageUrl: "https://example.com/img.jpg", sortOrder: 0 }],
      });
      expect(result).toEqual(mockPost);
    });

    it("should create post without relations when none provided", async () => {
      const postData = {
        userId: "user-123",
        content: "테스트",
        visibility: "FOLLOWERS",
        hashtags: [],
      };
      const mockPost = { id: "post-1", ...postData };

      const mockTx = {
        post: {
          create: jest.fn().mockResolvedValue(mockPost),
        },
        postWorkout: {
          createMany: jest.fn(),
        },
        postImage: {
          createMany: jest.fn(),
        },
      };

      mockDatabaseService.prisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const result = await repository.createWithRelations(postData);

      expect(mockTx.post.create).toHaveBeenCalledWith({ data: postData });
      expect(mockTx.postWorkout.createMany).not.toHaveBeenCalled();
      expect(mockTx.postImage.createMany).not.toHaveBeenCalled();
      expect(result).toEqual(mockPost);
    });
  });
});
