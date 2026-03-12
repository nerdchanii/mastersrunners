import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module.js";

import { FitParserService } from "./parsers/fit-parser.service.js";
import { GpxParserService } from "./parsers/gpx-parser.service.js";
import { WorkoutFileRepository } from "./repositories/workout-file.repository.js";
import { DiskStorageAdapter } from "./storage/disk-storage.adapter.js";
import { R2StorageAdapter } from "./storage/r2-storage.adapter.js";
import { STORAGE_ADAPTER } from "./storage/storage-adapter.interface.js";
import { DiskFilesController } from "./disk-files.controller.js";
import { DiskUploadController } from "./disk-upload.controller.js";
import { ImageOptimizationService } from "./image-optimization.service.js";
import { UploadsController } from "./uploads.controller.js";
import { UploadsService } from "./uploads.service.js";

function isDisk(): boolean {
  const type = process.env.STORAGE_TYPE;
  if (type) return type === "disk";
  const hasR2Config = Boolean(
    process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_ENDPOINT,
  );
  return process.env.NODE_ENV !== "production" || !hasR2Config;
}

const controllers = isDisk()
  ? [UploadsController, DiskUploadController, DiskFilesController]
  : [UploadsController];

@Module({
  imports: [DatabaseModule],
  controllers,
  providers: [
    {
      provide: STORAGE_ADAPTER,
      useClass: isDisk() ? DiskStorageAdapter : R2StorageAdapter,
    },
    UploadsService,
    FitParserService,
    GpxParserService,
    WorkoutFileRepository,
    ImageOptimizationService,
  ],
  exports: [
    UploadsService,
    FitParserService,
    GpxParserService,
    WorkoutFileRepository,
    ImageOptimizationService,
  ],
})
export class UploadsModule {}
