import { BadRequestException } from "@nestjs/common";

import { UploadsController } from "./uploads.controller.js";

const mockUploadsService = {
  createPublicAssetUploadTarget: jest.fn(),
  createWorkoutSourceUploadTarget: jest.fn(),
  parseAndCreateWorkout: jest.fn(),
  deleteFile: jest.fn(),
};

describe("UploadsController", () => {
  let controller: UploadsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UploadsController(mockUploadsService as never);
  });

  describe("getPresignedUrl", () => {
    it("returns publicUrl for public post image uploads", async () => {
      mockUploadsService.createPublicAssetUploadTarget.mockResolvedValue({
        uploadUrl: "https://upload.example.com/post-image",
        key: "posts/user-1/1710000000000-photo.jpg",
        publicUrl: "https://cdn.example.com/posts/user-1/1710000000000-photo.jpg",
      });

      const result = await controller.getPresignedUrl({ user: { userId: "user-1" } } as never, {
        filename: "photo.jpg",
        contentType: "image/jpeg",
        folder: "posts",
      });

      expect(mockUploadsService.createPublicAssetUploadTarget).toHaveBeenCalledWith(
        "user-1",
        "posts",
        "photo.jpg",
        "image/jpeg",
      );
      expect(result).toEqual({
        uploadUrl: "https://upload.example.com/post-image",
        key: "posts/user-1/1710000000000-photo.jpg",
        publicUrl: "https://cdn.example.com/posts/user-1/1710000000000-photo.jpg",
      });
    });

    it("keeps temporary workout upload compatibility without returning publicUrl", async () => {
      mockUploadsService.createWorkoutSourceUploadTarget.mockResolvedValue({
        uploadUrl: "https://upload.example.com/workout-file",
        key: "workouts/user-1/1710000000000-run.fit",
      });

      const result = await controller.getPresignedUrl({ user: { userId: "user-1" } } as never, {
        filename: "run.fit",
        contentType: "application/octet-stream",
        folder: "workouts",
      });

      expect(mockUploadsService.createWorkoutSourceUploadTarget).toHaveBeenCalledWith(
        "user-1",
        "run.fit",
        "application/octet-stream",
      );
      expect(result).toEqual({
        uploadUrl: "https://upload.example.com/workout-file",
        key: "workouts/user-1/1710000000000-run.fit",
      });
      expect(result).not.toHaveProperty("publicUrl");
    });

    it("rejects unsupported file types for public assets", async () => {
      await expect(
        controller.getPresignedUrl({ user: { userId: "user-1" } } as never, {
          filename: "run.fit",
          contentType: "application/octet-stream",
          folder: "posts",
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockUploadsService.createPublicAssetUploadTarget).not.toHaveBeenCalled();
    });

    it("rejects unsupported upload folders outside public assets and workout compatibility", async () => {
      await expect(
        controller.getPresignedUrl({ user: { userId: "user-1" } } as never, {
          filename: "notes.txt",
          contentType: "text/plain",
          folder: "documents",
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockUploadsService.createPublicAssetUploadTarget).not.toHaveBeenCalled();
      expect(mockUploadsService.createWorkoutSourceUploadTarget).not.toHaveBeenCalled();
    });
  });
});
