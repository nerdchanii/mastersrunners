import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { IS_PUBLIC_KEY } from "../common/decorators/public.decorator.js";
import { FollowRepository } from "../follow/repositories/follow.repository.js";
import { UploadsService } from "../uploads/uploads.service.js";

import { WorkoutsController } from "./workouts.controller.js";
import { WorkoutsService } from "./workouts.service.js";

const mockWorkoutsService = {
  findAll: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockFollowRepo = {
  findFollow: jest.fn(),
};

const mockUploadsService = {
  createWorkoutSourceUploadTarget: jest.fn(),
};

describe("WorkoutsController", () => {
  let controller: WorkoutsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [WorkoutsController],
      providers: [
        { provide: WorkoutsService, useValue: mockWorkoutsService },
        { provide: FollowRepository, useValue: mockFollowRepo },
        { provide: UploadsService, useValue: mockUploadsService },
      ],
    }).compile();

    controller = module.get(WorkoutsController);
  });

  describe("public read metadata", () => {
    it("does not mark workout detail as public", () => {
      expect(Reflect.getMetadata(IS_PUBLIC_KEY, WorkoutsController.prototype.findOne)).toBe(
        undefined,
      );
    });
  });

  describe("findOne", () => {
    it("keeps follower visibility checks for authenticated viewers", async () => {
      const workout = { id: "workout-1", userId: "owner-1", visibility: "FOLLOWERS" };
      mockWorkoutsService.findOne.mockResolvedValue(workout);
      mockFollowRepo.findFollow.mockResolvedValue({ status: "ACCEPTED" });

      const result = await controller.findOne("workout-1", {
        user: { userId: "viewer-1" },
      } as never);

      expect(mockWorkoutsService.findOne).toHaveBeenCalledWith("workout-1", "viewer-1");
      expect(mockFollowRepo.findFollow).toHaveBeenCalledWith("viewer-1", "owner-1");
      expect(result).toBe(workout);
    });

    it("forbids follower-only detail when follow is not accepted", async () => {
      mockWorkoutsService.findOne.mockResolvedValue({
        id: "workout-1",
        userId: "owner-1",
        visibility: "FOLLOWERS",
      });
      mockFollowRepo.findFollow.mockResolvedValue(null);

      await expect(
        controller.findOne("workout-1", { user: { userId: "viewer-1" } } as never),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("presignSource", () => {
    it("returns only uploadUrl and key for FIT uploads", async () => {
      mockUploadsService.createWorkoutSourceUploadTarget.mockResolvedValue({
        uploadUrl: "https://upload.example.com/fit",
        key: "workouts/user-1/1710000000000-run.fit",
      });

      const result = await controller.presignSource({ user: { userId: "user-1" } } as never, {
        filename: "run.fit",
        contentType: "application/octet-stream",
      });

      expect(mockUploadsService.createWorkoutSourceUploadTarget).toHaveBeenCalledWith(
        "user-1",
        "run.fit",
        "application/octet-stream",
      );
      expect(result).toEqual({
        uploadUrl: "https://upload.example.com/fit",
        key: "workouts/user-1/1710000000000-run.fit",
      });
      expect(result).not.toHaveProperty("publicUrl");
    });

    it("rejects unsupported workout source extensions", async () => {
      await expect(
        controller.presignSource({ user: { userId: "user-1" } } as never, {
          filename: "run.tcx",
          contentType: "application/octet-stream",
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockUploadsService.createWorkoutSourceUploadTarget).not.toHaveBeenCalled();
    });
  });
});
