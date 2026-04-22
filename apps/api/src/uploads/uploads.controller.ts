import { BadRequestException, Body, Controller, Delete, Param, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { ParseUploadDto } from "./dto/parse-upload.dto.js";
import { PresignUploadDto } from "./dto/presign-upload.dto.js";
import { UploadsService } from "./uploads.service.js";
import {
  isSupportedWorkoutSourceContentType,
  isSupportedWorkoutSourceFilename,
} from "./workout-source-upload.js";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_PUBLIC_ASSET_FOLDERS = new Set(["images", "posts", "profiles"]);

@ApiTags("Uploads")
@Controller("uploads")
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post("presign")
  async getPresignedUrl(@Req() req: Request, @Body() dto: PresignUploadDto) {
    const { userId } = req.user as { userId: string };
    const folder = dto.folder ?? "images";

    if (folder === "workouts") {
      if (!isSupportedWorkoutSourceFilename(dto.filename)) {
        throw new BadRequestException("FIT 또는 GPX 파일만 업로드 가능합니다.");
      }
      if (!isSupportedWorkoutSourceContentType(dto.contentType)) {
        throw new BadRequestException("Unsupported workout source type");
      }
      return this.uploadsService.createWorkoutSourceUploadTarget(
        userId,
        dto.filename,
        dto.contentType,
      );
    }

    if (!ALLOWED_PUBLIC_ASSET_FOLDERS.has(folder)) {
      throw new BadRequestException("Unsupported upload folder");
    }

    if (!ALLOWED_IMAGE_TYPES.includes(dto.contentType)) {
      throw new BadRequestException("Unsupported image type");
    }

    return this.uploadsService.createPublicAssetUploadTarget(
      userId,
      folder,
      dto.filename,
      dto.contentType,
    );
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
