import { Test } from "@nestjs/testing";

import { UserRepository } from "../auth/repositories/user.repository";
import { BlockRepository } from "../block/repositories/block.repository";
import { CrewMemberRepository } from "../crews/repositories/crew-member.repository";
import { FollowRepository } from "../follow/repositories/follow.repository";
import { WorkoutRepository } from "../workouts/repositories/workout.repository";

import { ProfileService } from "./profile.service";

const mockUserRepo = {
  findById: jest.fn(),
  findByIdBasicSelect: jest.fn(),
  update: jest.fn(),
  searchByName: jest.fn(),
  countPostsByUser: jest.fn(),
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
  deleteAllForUser: jest.fn(),
};

const mockCrewMemberRepo = {
  deleteAllForUser: jest.fn(),
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
    mockFollowRepo.deleteAllForUser.mockResolvedValue(undefined);
    mockUserRepo.countPostsByUser.mockResolvedValue(0);
    mockCrewMemberRepo.deleteAllForUser.mockResolvedValue(undefined);
    mockUserRepo.softDelete.mockResolvedValue(undefined);

    const module = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: WorkoutRepository, useValue: mockWorkoutRepo },
        { provide: BlockRepository, useValue: mockBlockRepository },
        { provide: FollowRepository, useValue: mockFollowRepo },
        { provide: CrewMemberRepository, useValue: mockCrewMemberRepo },
      ],
    }).compile();

    service = module.get(ProfileService);
  });

  describe("deleteAccount", () => {
    it("should soft delete user and anonymize personal info", async () => {
      const userId = "user-1";
      mockUserRepo.findById.mockResolvedValue({
        id: userId,
        name: "TestUser",
        email: "test@example.com",
      });

      await service.deleteAccount(userId);

      expect(mockUserRepo.softDelete).toHaveBeenCalledWith(userId);
    });

    it("should delete all follow relationships (both follower and following)", async () => {
      const userId = "user-1";
      mockUserRepo.findById.mockResolvedValue({ id: userId });

      await service.deleteAccount(userId);

      expect(mockFollowRepo.deleteAllForUser).toHaveBeenCalledWith(userId);
    });

    it("should delete all crew memberships", async () => {
      const userId = "user-1";
      mockUserRepo.findById.mockResolvedValue({ id: userId });

      await service.deleteAccount(userId);

      expect(mockCrewMemberRepo.deleteAllForUser).toHaveBeenCalledWith(userId);
    });

    it("should return success message", async () => {
      const userId = "user-1";
      mockUserRepo.findById.mockResolvedValue({ id: userId });

      const result = await service.deleteAccount(userId);

      expect(result).toEqual({ message: "계정이 삭제되었습니다." });
    });
  });
});
