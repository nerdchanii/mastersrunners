import { Controller, Post, Delete, Body, Param, Req, BadRequestException } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { UploadsService } from "./uploads.service.js";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, "application/octet-stream"]; // octet-stream for FIT/GPX

@ApiTags("Uploads")
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

  @Post("parse")
  async parseFile(
    @Req() req: Request,
    @Body() body: { fileKey: string; fileType: string; originalFileName: string }
  ) {
    const { userId } = req.user as { userId: string };
    const { fileKey, fileType, originalFileName } = body;

    if (!fileKey || !fileType || !originalFileName) {
      throw new BadRequestException("fileKey, fileType, and originalFileName are required");
    }

    if (fileType !== "FIT" && fileType !== "GPX") {
      throw new BadRequestException("fileType must be FIT or GPX");
    }

    return this.uploadsService.parseAndCreateWorkout(userId, {
      fileKey,
      fileType: fileType as "FIT" | "GPX",
      originalFileName,
    });
  }

  @Delete("*key")
  async deleteFile(@Req() req: Request, @Param("key") key: string) {
    const { userId } = req.user as { userId: string };
    const parts = key.split("/");
    if (parts.length < 2 || parts[1] !== userId) {
      throw new BadRequestException("Cannot delete files owned by other users");
    }
    await this.uploadsService.deleteFile(key);
    return { success: true };
  }
}
