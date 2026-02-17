import { Module } from "@nestjs/common";
import { UploadsController } from "./uploads.controller.js";
import { UploadsService } from "./uploads.service.js";
import { FitParserService } from "./parsers/fit-parser.service.js";
import { GpxParserService } from "./parsers/gpx-parser.service.js";
import { WorkoutFileRepository } from "./repositories/workout-file.repository.js";
import { DatabaseModule } from "../database/database.module.js";
import { STORAGE_ADAPTER } from "./storage/storage-adapter.interface.js";
import { R2StorageAdapter } from "./storage/r2-storage.adapter.js";
import { DiskStorageAdapter } from "./storage/disk-storage.adapter.js";
import { DiskUploadController } from "./disk-upload.controller.js";
import { DiskFilesController } from "./disk-files.controller.js";
import { ImageOptimizationService } from "./image-optimization.service.js";

function isDisk(): boolean {
  const type = process.env.STORAGE_TYPE;
  if (type) return type === "disk";
  return process.env.NODE_ENV !== "production";
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
  exports: [UploadsService, FitParserService, GpxParserService, WorkoutFileRepository, ImageOptimizationService],
})
export class UploadsModule {}
