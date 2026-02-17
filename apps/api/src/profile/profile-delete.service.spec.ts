import { Test } from "@nestjs/testing";
import { ProfileService } from "./profile.service";
import { UserRepository } from "../auth/repositories/user.repository";
import { WorkoutRepository } from "../workouts/repositories/workout.repository";
import { BlockRepository } from "../block/repositories/block.repository";
import { FollowRepository } from "../follow/repositories/follow.repository";
import { DatabaseService } from "../database/database.service";

const mockUserRepo = {
  findById: jest.fn(),
  findByIdBasicSelect: jest.fn(),
  update: jest.fn(),
  searchByName: jest.fn(),
  softDelete: jest.fn(),
};

const mockWorkoutRepo = {
  aggregateByUser: jest.fn(),
};

const mockBlockRepository = {
  isBlocked: jest.fn(),
  getBlockedUserIds: jest.fn(),
};

const mockFollowRepo = {
  countFollowers: jest.fn(),
  countFollowing: jest.fn(),
  findFollow: jest.fn(),
  removeAllFollowsByUser: jest.fn(),
};

const mockDb = {
  prisma: {
    post: {
      count: jest.fn(),
    },
    follow: {
      deleteMany: jest.fn(),
    },
    crewMember: {
      deleteMany: jest.fn(),
    },
  },
};

describe("ProfileService - deleteAccount", () => {
  let service: ProfileService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockBlockRepository.isBlocked.mockResolvedValue(false);
    mockBlockRepository.getBlockedUserIds.mockResolvedValue([]);
    mockFollowRepo.countFollowers.mockResolvedValue(0);
    mockFollowRepo.countFollowing.mockResolvedValue(0);
    mockFollowRepo.findFollow.mockResolvedValue(null);
    mockFollowRepo.removeAllFollowsByUser.mockResolvedValue(undefined);
    mockDb.prisma.post.count.mockResolvedValue(0);
    mockDb.prisma.follow.deleteMany.mockResolvedValue({ count: 0 });
    mockDb.prisma.crewMember.deleteMany.mockResolvedValue({ count: 0 });
    mockUserRepo.softDelete.mockResolvedValue(undefined);

    const module = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: WorkoutRepository, useValue: mockWorkoutRepo },
        { provide: BlockRepository, useValue: mockBlockRepository },
        { provide: FollowRepository, useValue: mockFollowRepo },
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile();

    service = module.get(ProfileService);
  });

  describe("deleteAccount", () => {
    it("should soft delete user and anonymize personal info", async () => {
      const userId = "user-1";
      mockUserRepo.findById.mockResolvedValue({ id: userId, name: "TestUser", email: "test@example.com" });

      await service.deleteAccount(userId);

      expect(mockUserRepo.softDelete).toHaveBeenCalledWith(userId);
    });

    it("should delete all follow relationships (both follower and following)", async () => {
      const userId = "user-1";
      mockUserRepo.findById.mockResolvedValue({ id: userId });

      await service.deleteAccount(userId);

      expect(mockDb.prisma.follow.deleteMany).toHaveBeenCalledWith({
        where: {
          OR: [{ followerId: userId }, { followingId: userId }],
        },
      });
    });

    it("should delete all crew memberships", async () => {
      const userId = "user-1";
      mockUserRepo.findById.mockResolvedValue({ id: userId });

      await service.deleteAccount(userId);

      expect(mockDb.prisma.crewMember.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it("should return success message", async () => {
      const userId = "user-1";
      mockUserRepo.findById.mockResolvedValue({ id: userId });

      const result = await service.deleteAccount(userId);

      expect(result).toEqual({ message: "계정이 삭제되었습니다." });
    });
  });
});
