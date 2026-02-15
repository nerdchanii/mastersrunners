import { Test } from "@nestjs/testing";
import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { FollowService } from "./follow.service";
import { FollowRepository } from "./repositories/follow.repository";
import { BlockRepository } from "../block/repositories/block.repository";

const mockFollowRepository = {
  findFollow: jest.fn(),
  follow: jest.fn(),
  unfollow: jest.fn(),
  accept: jest.fn(),
  reject: jest.fn(),
  findFollowers: jest.fn(),
  findFollowing: jest.fn(),
  findUserIsPrivate: jest.fn(),
};

const mockBlockRepository = {
  isBlocked: jest.fn(),
  getBlockedUserIds: jest.fn(),
};

describe("FollowService", () => {
  let service: FollowService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockBlockRepository.isBlocked.mockResolvedValue(false);
    mockBlockRepository.getBlockedUserIds.mockResolvedValue([]);
    const module = await Test.createTestingModule({
      providers: [
        FollowService,
        { provide: FollowRepository, useValue: mockFollowRepository },
        { provide: BlockRepository, useValue: mockBlockRepository },
      ],
    }).compile();
    service = module.get(FollowService);
  });

  describe("follow", () => {
    it("should throw ConflictException if trying to follow self", async () => {
      await expect(service.follow("user-1", "user-1")).rejects.toThrow(
        new ConflictException("자기 자신을 팔로우할 수 없습니다.")
      );
    });

    it("should throw ConflictException if already following", async () => {
      const followerId = "user-1";
      const followingId = "user-2";
      mockFollowRepository.findFollow.mockResolvedValue({
        id: "follow-1",
        followerId,
        followingId,
        status: "ACCEPTED",
      });

      await expect(service.follow(followerId, followingId)).rejects.toThrow(
        new ConflictException("이미 팔로우하고 있습니다.")
      );
      expect(mockFollowRepository.findFollow).toHaveBeenCalledWith(followerId, followingId);
    });

    it("should throw ForbiddenException when block relationship exists", async () => {
      const followerId = "user-1";
      const followingId = "user-2";
      mockFollowRepository.findFollow.mockResolvedValue(null);
      mockBlockRepository.isBlocked.mockResolvedValue(true);

      await expect(service.follow(followerId, followingId)).rejects.toThrow(ForbiddenException);
      expect(mockBlockRepository.isBlocked).toHaveBeenCalledWith(followerId, followingId);
      expect(mockFollowRepository.follow).not.toHaveBeenCalled();
    });

    it("should create follow with PENDING status for private user", async () => {
      const followerId = "user-1";
      const followingId = "user-2";
      mockFollowRepository.findFollow.mockResolvedValue(null);
      mockFollowRepository.findUserIsPrivate.mockResolvedValue(true);
      mockFollowRepository.follow.mockResolvedValue({
        id: "follow-1",
        followerId,
        followingId,
        status: "PENDING",
      });

      const result = await service.follow(followerId, followingId);

      expect(mockFollowRepository.findFollow).toHaveBeenCalledWith(followerId, followingId);
      expect(mockFollowRepository.findUserIsPrivate).toHaveBeenCalledWith(followingId);
      expect(mockFollowRepository.follow).toHaveBeenCalledWith(followerId, followingId, "PENDING");
      expect(result.status).toBe("PENDING");
    });

    it("should create follow with ACCEPTED status for public user", async () => {
      const followerId = "user-1";
      const followingId = "user-2";
      mockFollowRepository.findFollow.mockResolvedValue(null);
      mockFollowRepository.findUserIsPrivate.mockResolvedValue(false);
      mockFollowRepository.follow.mockResolvedValue({
        id: "follow-1",
        followerId,
        followingId,
        status: "ACCEPTED",
      });

      const result = await service.follow(followerId, followingId);

      expect(mockFollowRepository.findUserIsPrivate).toHaveBeenCalledWith(followingId);
      expect(mockFollowRepository.follow).toHaveBeenCalledWith(followerId, followingId, "ACCEPTED");
      expect(result.status).toBe("ACCEPTED");
    });
  });

  describe("unfollow", () => {
    it("should throw NotFoundException if follow relationship does not exist", async () => {
      const followerId = "user-1";
      const followingId = "user-2";
      mockFollowRepository.findFollow.mockResolvedValue(null);

      await expect(service.unfollow(followerId, followingId)).rejects.toThrow(
        new NotFoundException("팔로우 관계를 찾을 수 없습니다.")
      );
    });

    it("should delegate to followRepo.unfollow", async () => {
      const followerId = "user-1";
      const followingId = "user-2";
      mockFollowRepository.findFollow.mockResolvedValue({
        id: "follow-1",
        followerId,
        followingId,
        status: "ACCEPTED",
      });
      mockFollowRepository.unfollow.mockResolvedValue({
        id: "follow-1",
        followerId,
        followingId,
      });

      const result = await service.unfollow(followerId, followingId);

      expect(mockFollowRepository.findFollow).toHaveBeenCalledWith(followerId, followingId);
      expect(mockFollowRepository.unfollow).toHaveBeenCalledWith(followerId, followingId);
      expect(result).toBeDefined();
    });
  });

  describe("acceptRequest", () => {
    it("should throw NotFoundException if follow request does not exist", async () => {
      const userId = "user-1";
      const followerId = "user-2";
      mockFollowRepository.findFollow.mockResolvedValue(null);

      await expect(service.acceptRequest(userId, followerId)).rejects.toThrow(
        new NotFoundException("팔로우 요청을 찾을 수 없습니다.")
      );
    });

    it("should throw ConflictException if request is already accepted", async () => {
      const userId = "user-1";
      const followerId = "user-2";
      mockFollowRepository.findFollow.mockResolvedValue({
        id: "follow-1",
        followerId,
        followingId: userId,
        status: "ACCEPTED",
      });

      await expect(service.acceptRequest(userId, followerId)).rejects.toThrow(
        new ConflictException("이미 수락된 요청입니다.")
      );
    });

    it("should accept pending follow request", async () => {
      const userId = "user-1";
      const followerId = "user-2";
      mockFollowRepository.findFollow.mockResolvedValue({
        id: "follow-1",
        followerId,
        followingId: userId,
        status: "PENDING",
      });
      mockFollowRepository.accept.mockResolvedValue({
        id: "follow-1",
        followerId,
        followingId: userId,
        status: "ACCEPTED",
      });

      const result = await service.acceptRequest(userId, followerId);

      expect(mockFollowRepository.findFollow).toHaveBeenCalledWith(followerId, userId);
      expect(mockFollowRepository.accept).toHaveBeenCalledWith(followerId, userId);
      expect(result.status).toBe("ACCEPTED");
    });
  });

  describe("rejectRequest", () => {
    it("should throw NotFoundException if follow request does not exist", async () => {
      const userId = "user-1";
      const followerId = "user-2";
      mockFollowRepository.findFollow.mockResolvedValue(null);

      await expect(service.rejectRequest(userId, followerId)).rejects.toThrow(
        new NotFoundException("팔로우 요청을 찾을 수 없습니다.")
      );
    });

    it("should reject follow request", async () => {
      const userId = "user-1";
      const followerId = "user-2";
      mockFollowRepository.findFollow.mockResolvedValue({
        id: "follow-1",
        followerId,
        followingId: userId,
        status: "PENDING",
      });
      mockFollowRepository.reject.mockResolvedValue({
        id: "follow-1",
        followerId,
        followingId: userId,
      });

      const result = await service.rejectRequest(userId, followerId);

      expect(mockFollowRepository.findFollow).toHaveBeenCalledWith(followerId, userId);
      expect(mockFollowRepository.reject).toHaveBeenCalledWith(followerId, userId);
      expect(result).toBeDefined();
    });
  });

  describe("getFollowers", () => {
    it("should delegate to followRepo.findFollowers with ACCEPTED status", async () => {
      const userId = "user-1";
      const mockFollowers = [
        {
          id: "follow-1",
          followerId: "user-2",
          followingId: userId,
          status: "ACCEPTED",
          follower: { id: "user-2", email: "user2@test.com", name: "User 2" },
        },
      ];
      mockFollowRepository.findFollowers.mockResolvedValue(mockFollowers);

      const result = await service.getFollowers(userId);

      expect(mockFollowRepository.findFollowers).toHaveBeenCalledWith(userId, "ACCEPTED", []);
      expect(result).toEqual(mockFollowers);
    });

    it("should pass blocked user IDs to exclude from followers list", async () => {
      const userId = "user-1";
      const blockedIds = ["blocked-1", "blocked-2"];
      mockBlockRepository.getBlockedUserIds.mockResolvedValue(blockedIds);
      mockFollowRepository.findFollowers.mockResolvedValue([]);

      await service.getFollowers(userId);

      expect(mockBlockRepository.getBlockedUserIds).toHaveBeenCalledWith(userId);
      expect(mockFollowRepository.findFollowers).toHaveBeenCalledWith(userId, "ACCEPTED", blockedIds);
    });
  });

  describe("getFollowing", () => {
    it("should delegate to followRepo.findFollowing with ACCEPTED status", async () => {
      const userId = "user-1";
      const mockFollowing = [
        {
          id: "follow-1",
          followerId: userId,
          followingId: "user-2",
          status: "ACCEPTED",
          following: { id: "user-2", email: "user2@test.com", name: "User 2" },
        },
      ];
      mockFollowRepository.findFollowing.mockResolvedValue(mockFollowing);

      const result = await service.getFollowing(userId);

      expect(mockFollowRepository.findFollowing).toHaveBeenCalledWith(userId, "ACCEPTED", []);
      expect(result).toEqual(mockFollowing);
    });

    it("should pass blocked user IDs to exclude from following list", async () => {
      const userId = "user-1";
      const blockedIds = ["blocked-1"];
      mockBlockRepository.getBlockedUserIds.mockResolvedValue(blockedIds);
      mockFollowRepository.findFollowing.mockResolvedValue([]);

      await service.getFollowing(userId);

      expect(mockBlockRepository.getBlockedUserIds).toHaveBeenCalledWith(userId);
      expect(mockFollowRepository.findFollowing).toHaveBeenCalledWith(userId, "ACCEPTED", blockedIds);
    });
  });

  describe("getPendingRequests", () => {
    it("should delegate to followRepo.findFollowers with PENDING status", async () => {
      const userId = "user-1";
      const mockPending = [
        {
          id: "follow-1",
          followerId: "user-2",
          followingId: userId,
          status: "PENDING",
          follower: { id: "user-2", email: "user2@test.com", name: "User 2" },
        },
      ];
      mockFollowRepository.findFollowers.mockResolvedValue(mockPending);

      const result = await service.getPendingRequests(userId);

      expect(mockFollowRepository.findFollowers).toHaveBeenCalledWith(userId, "PENDING");
      expect(result).toEqual(mockPending);
    });
  });
});
