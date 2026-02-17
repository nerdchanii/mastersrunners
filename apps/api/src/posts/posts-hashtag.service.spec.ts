import { Test } from "@nestjs/testing";
import { PostsService } from "./posts.service";
import { PostRepository } from "./repositories/post.repository";
import { BlockRepository } from "../block/repositories/block.repository";

const mockPostRepo = {
  findById: jest.fn(),
  findByUser: jest.fn(),
  findByHashtag: jest.fn(),
  getPopularHashtags: jest.fn(),
  createWithRelations: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

const mockBlockRepo = {
  isBlocked: jest.fn(),
  getBlockedUserIds: jest.fn(),
};

describe("PostsService - hashtag", () => {
  let service: PostsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockBlockRepo.isBlocked.mockResolvedValue(false);
    mockBlockRepo.getBlockedUserIds.mockResolvedValue([]);

    const module = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PostRepository, useValue: mockPostRepo },
        { provide: BlockRepository, useValue: mockBlockRepo },
      ],
    }).compile();

    service = module.get(PostsService);
  });

  describe("extractHashtags", () => {
    it("should extract hashtags from content", () => {
      const content = "오늘도 달렸다 #마라톤 #러닝 #10km";
      const result = service.extractHashtags(content);
      expect(result).toEqual(["마라톤", "러닝", "10km"]);
    });

    it("should extract English hashtags", () => {
      const content = "Great run today #running #marathon2024";
      const result = service.extractHashtags(content);
      expect(result).toEqual(["running", "marathon2024"]);
    });

    it("should return empty array when no hashtags", () => {
      const content = "오늘 달리기 완료!";
      const result = service.extractHashtags(content);
      expect(result).toEqual([]);
    });

    it("should handle null/undefined content", () => {
      expect(service.extractHashtags(null)).toEqual([]);
      expect(service.extractHashtags(undefined)).toEqual([]);
    });

    it("should deduplicate hashtags", () => {
      const content = "#달리기 오늘도 #달리기 완주!";
      const result = service.extractHashtags(content);
      expect(result).toEqual(["달리기"]);
    });
  });

  describe("findByHashtag", () => {
    it("should find posts by hashtag with block filtering", async () => {
      const currentUserId = "me";
      const tag = "마라톤";
      const blockedIds = ["blocked-1"];
      const mockPosts = [
        { id: "p1", content: "#마라톤 완주!", userId: "user1", hashtags: ["마라톤"] },
        { id: "p2", content: "오늘 #마라톤", userId: "user2", hashtags: ["마라톤"] },
      ];
      mockBlockRepo.getBlockedUserIds.mockResolvedValue(blockedIds);
      mockPostRepo.findByHashtag.mockResolvedValue(mockPosts);

      const result = await service.findByHashtag(tag, currentUserId);

      expect(mockBlockRepo.getBlockedUserIds).toHaveBeenCalledWith(currentUserId);
      expect(mockPostRepo.findByHashtag).toHaveBeenCalledWith(tag, {
        blockedUserIds: blockedIds,
        cursor: undefined,
        limit: undefined,
      });
      expect(result).toEqual(mockPosts);
    });

    it("should pass cursor and limit options", async () => {
      const currentUserId = "me";
      const tag = "러닝";
      mockBlockRepo.getBlockedUserIds.mockResolvedValue([]);
      mockPostRepo.findByHashtag.mockResolvedValue([]);

      await service.findByHashtag(tag, currentUserId, "cursor-id", 10);

      expect(mockPostRepo.findByHashtag).toHaveBeenCalledWith(tag, {
        blockedUserIds: [],
        cursor: "cursor-id",
        limit: 10,
      });
    });
  });

  describe("getPopularHashtags", () => {
    it("should return popular hashtags", async () => {
      const mockHashtags = [
        { tag: "마라톤", count: 50 },
        { tag: "러닝", count: 40 },
        { tag: "10km", count: 30 },
      ];
      mockPostRepo.getPopularHashtags.mockResolvedValue(mockHashtags);

      const result = await service.getPopularHashtags();

      expect(mockPostRepo.getPopularHashtags).toHaveBeenCalledWith(20);
      expect(result).toEqual(mockHashtags);
    });

    it("should pass custom limit", async () => {
      mockPostRepo.getPopularHashtags.mockResolvedValue([]);

      await service.getPopularHashtags(10);

      expect(mockPostRepo.getPopularHashtags).toHaveBeenCalledWith(10);
    });
  });

  describe("create - auto hashtag extraction", () => {
    it("should auto-extract hashtags from content when dto.hashtags not provided", async () => {
      const userId = "user-1";
      const dto = {
        content: "#마라톤 오늘 완주! #러닝",
      };
      const mockPost = { id: "p1", ...dto, userId, hashtags: ["마라톤", "러닝"] };
      mockPostRepo.createWithRelations.mockResolvedValue(mockPost);

      await service.create(userId, dto);

      expect(mockPostRepo.createWithRelations).toHaveBeenCalledWith(
        expect.objectContaining({
          hashtags: ["마라톤", "러닝"],
        }),
        undefined,
        undefined,
      );
    });

    it("should use dto.hashtags when provided (override)", async () => {
      const userId = "user-1";
      const dto = {
        content: "#content에서추출될태그",
        hashtags: ["수동태그"],
      };
      const mockPost = { id: "p1", ...dto, userId };
      mockPostRepo.createWithRelations.mockResolvedValue(mockPost);

      await service.create(userId, dto);

      expect(mockPostRepo.createWithRelations).toHaveBeenCalledWith(
        expect.objectContaining({
          hashtags: ["수동태그"],
        }),
        undefined,
        undefined,
      );
    });
  });
});
