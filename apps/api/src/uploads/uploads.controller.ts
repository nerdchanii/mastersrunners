import { Controller, Post, Delete, Body, Param, Req, BadRequestException } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";
import { UploadsService } from "./uploads.service.js";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, "application/octet-stream"]; // octet-stream for FIT/GPX
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

@SkipThrottle()
@Controller("uploads")
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post("presign")
  async getPresignedUrl(
    @Req() req: Request,
    @Body() body: { filename: string; contentType: string; folder?: string }
  ) {
    const { userId } = req.user as { userId: string };
    const { filename, contentType, folder = "images" } = body;

    if (!filename || !contentType) {
      throw new BadRequestException("filename and contentType are required");
    }

    if (folder === "images" && !ALLOWED_IMAGE_TYPES.includes(contentType)) {
      throw new BadRequestException("Unsupported image type");
    }

    if (!ALLOWED_FILE_TYPES.includes(contentType)) {
      throw new BadRequestException("Unsupported file type");
    }

    const key = this.uploadsService.generateKey(userId, folder, filename);
    return this.uploadsService.getUploadUrl(key, contentType);
  }

  @Delete(":key(*)")
  async deleteFile(@Req() req: Request, @Param("key") key: string) {
    const { userId } = req.user as { userId: string };
    // Verify the key belongs to the user (key format: folder/userId/timestamp-filename)
    const parts = key.split("/");
    if (parts.length < 2 || parts[1] !== userId) {
      throw new BadRequestException("Cannot delete files owned by other users");
    }
    await this.uploadsService.deleteFile(key);
    return { success: true };
  }
}
