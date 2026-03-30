import { BadRequestException, Body, Controller, Delete, Param, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { ParseUploadDto } from "./dto/parse-upload.dto.js";
import { PresignUploadDto } from "./dto/presign-upload.dto.js";
import { UploadsService } from "./uploads.service.js";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, "application/octet-stream"];

@ApiTags("Uploads")
@Controller("uploads")
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post("presign")
  async getPresignedUrl(@Req() req: Request, @Body() dto: PresignUploadDto) {
    const { userId } = req.user as { userId: string };
    const folder = dto.folder ?? "images";

    if (folder === "images" && !ALLOWED_IMAGE_TYPES.includes(dto.contentType)) {
      throw new BadRequestException("Unsupported image type");
    }

    if (!ALLOWED_FILE_TYPES.includes(dto.contentType)) {
      throw new BadRequestException("Unsupported file type");
    }

    const key = this.uploadsService.generateKey(userId, folder, dto.filename);
    return this.uploadsService.getUploadUrl(key, dto.contentType);
  }

  @Post("parse")
  async parseFile(@Req() req: Request, @Body() dto: ParseUploadDto) {
    const { userId } = req.user as { userId: string };
    return this.uploadsService.parseAndCreateWorkout(userId, {
      fileKey: dto.fileKey,
      fileType: dto.fileType,
      originalFileName: dto.originalFileName,
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
