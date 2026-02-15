import { Test } from "@nestjs/testing";
import { PostsService } from "./posts.service";
import { PostRepository } from "./repositories/post.repository";
import type { CreatePostDto } from "./dto/create-post.dto";
import type { UpdatePostDto } from "./dto/update-post.dto";

const mockPostRepository = {
  createWithRelations: jest.fn(),
  findById: jest.fn(),
  findByUser: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

describe("PostsService", () => {
  let service: PostsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PostRepository, useValue: mockPostRepository },
      ],
    }).compile();
    service = module.get(PostsService);
  });

  describe("create", () => {
    it("should create post with content only", async () => {
      const userId = "user-123";
      const dto: CreatePostDto = {
        content: "안녕하세요, 오늘 10km 뛰었어요!",
      };
      const mockCreated = {
        id: "post-1",
        userId,
        content: dto.content,
        visibility: "FOLLOWERS",
        hashtags: [],
      };
      mockPostRepository.createWithRelations.mockResolvedValue(mockCreated);

      const result = await service.create(userId, dto);

      expect(mockPostRepository.createWithRelations).toHaveBeenCalledWith(
        {
          userId,
          content: dto.content,
          visibility: "FOLLOWERS",
          hashtags: [],
        },
        undefined,
        undefined,
      );
      expect(result).toEqual(mockCreated);
    });

    it("should create post with workouts attached", async () => {
      const userId = "user-123";
      const dto: CreatePostDto = {
        content: "오늘의 러닝",
        workoutIds: ["workout-1", "workout-2"],
      };
      const mockCreated = {
        id: "post-1",
        userId,
        content: dto.content,
        visibility: "FOLLOWERS",
        hashtags: [],
      };
      mockPostRepository.createWithRelations.mockResolvedValue(mockCreated);

      const result = await service.create(userId, dto);

      expect(mockPostRepository.createWithRelations).toHaveBeenCalledWith(
        {
          userId,
          content: dto.content,
          visibility: "FOLLOWERS",
          hashtags: [],
        },
        ["workout-1", "workout-2"],
        undefined,
      );
      expect(result).toEqual(mockCreated);
    });

    it("should create post with images and hashtags", async () => {
      const userId = "user-123";
      const dto: CreatePostDto = {
        content: "멋진 경치",
        imageUrls: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
        hashtags: ["러닝", "건강"],
        visibility: "PUBLIC",
      };
      const mockCreated = {
        id: "post-1",
        userId,
        content: dto.content,
        visibility: "PUBLIC",
        hashtags: ["러닝", "건강"],
      };
      mockPostRepository.createWithRelations.mockResolvedValue(mockCreated);

      const result = await service.create(userId, dto);

      expect(mockPostRepository.createWithRelations).toHaveBeenCalledWith(
        {
          userId,
          content: dto.content,
          visibility: "PUBLIC",
          hashtags: ["러닝", "건강"],
        },
        undefined,
        ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
      );
      expect(result).toEqual(mockCreated);
    });

    it("should create post with all relations", async () => {
      const userId = "user-123";
      const dto: CreatePostDto = {
        content: "완벽한 러닝 기록",
        workoutIds: ["workout-1"],
        imageUrls: ["https://example.com/img.jpg"],
        hashtags: ["러닝"],
        visibility: "FOLLOWERS",
      };
      const mockCreated = {
        id: "post-1",
        userId,
        content: dto.content,
        visibility: "FOLLOWERS",
        hashtags: ["러닝"],
      };
      mockPostRepository.createWithRelations.mockResolvedValue(mockCreated);

      const result = await service.create(userId, dto);

      expect(mockPostRepository.createWithRelations).toHaveBeenCalledWith(
        {
          userId,
          content: dto.content,
          visibility: "FOLLOWERS",
          hashtags: ["러닝"],
        },
        ["workout-1"],
        ["https://example.com/img.jpg"],
      );
      expect(result).toEqual(mockCreated);
    });
  });

  describe("findById", () => {
    it("should delegate to postRepo.findById", async () => {
      const postId = "post-123";
      const mockPost = {
        id: postId,
        userId: "user-123",
        content: "테스트 포스트",
        user: { id: "user-123", name: "홍길동", profileImage: null },
        images: [],
        workouts: [],
        _count: { likes: 5, comments: 2 },
      };
      mockPostRepository.findById.mockResolvedValue(mockPost);

      const result = await service.findById(postId);

      expect(mockPostRepository.findById).toHaveBeenCalledWith(postId);
      expect(result).toEqual(mockPost);
    });
  });

  describe("findByUser", () => {
    it("should delegate to postRepo.findByUser", async () => {
      const userId = "user-123";
      const mockPosts = [
        { id: "post-1", userId, content: "포스트 1" },
        { id: "post-2", userId, content: "포스트 2" },
      ];
      mockPostRepository.findByUser.mockResolvedValue(mockPosts);

      const result = await service.findByUser(userId);

      expect(mockPostRepository.findByUser).toHaveBeenCalledWith(userId, {
        cursor: undefined,
        limit: undefined,
      });
      expect(result).toEqual(mockPosts);
    });

    it("should pass cursor and limit to repository", async () => {
      const userId = "user-123";
      const cursor = "post-10";
      const limit = 15;
      mockPostRepository.findByUser.mockResolvedValue([]);

      await service.findByUser(userId, cursor, limit);

      expect(mockPostRepository.findByUser).toHaveBeenCalledWith(userId, {
        cursor,
        limit,
      });
    });
  });

  describe("update", () => {
    it("should delegate to postRepo.update", async () => {
      const postId = "post-123";
      const dto: UpdatePostDto = {
        content: "수정된 내용",
        visibility: "PUBLIC",
      };
      const mockUpdated = { id: postId, ...dto };
      mockPostRepository.update.mockResolvedValue(mockUpdated);

      const result = await service.update(postId, dto);

      expect(mockPostRepository.update).toHaveBeenCalledWith(postId, dto);
      expect(result).toEqual(mockUpdated);
    });
  });

  describe("softDelete", () => {
    it("should soft delete post when owner matches", async () => {
      const postId = "post-123";
      const userId = "user-123";
      const mockPost = { id: postId, userId, content: "테스트" };
      mockPostRepository.findById.mockResolvedValue(mockPost);
      mockPostRepository.softDelete.mockResolvedValue({ ...mockPost, deletedAt: new Date() });

      const result = await service.softDelete(postId, userId);

      expect(mockPostRepository.findById).toHaveBeenCalledWith(postId);
      expect(mockPostRepository.softDelete).toHaveBeenCalledWith(postId);
      expect(result.deletedAt).toBeTruthy();
    });

    it("should throw error when post not found", async () => {
      const postId = "post-123";
      const userId = "user-123";
      mockPostRepository.findById.mockResolvedValue(null);

      await expect(service.softDelete(postId, userId)).rejects.toThrow(
        "게시글을 찾을 수 없습니다.",
      );
    });

    it("should throw error when owner does not match", async () => {
      const postId = "post-123";
      const userId = "user-123";
      const mockPost = { id: postId, userId: "other-user", content: "테스트" };
      mockPostRepository.findById.mockResolvedValue(mockPost);

      await expect(service.softDelete(postId, userId)).rejects.toThrow(
        "본인의 게시글만 삭제할 수 있습니다.",
      );
    });
  });
});
