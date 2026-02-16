import { Module } from "@nestjs/common";
import { UploadsController } from "./uploads.controller.js";
import { UploadsService } from "./uploads.service.js";
import { FitParserService } from "./parsers/fit-parser.service.js";
import { GpxParserService } from "./parsers/gpx-parser.service.js";
import { WorkoutFileRepository } from "./repositories/workout-file.repository.js";
import { DatabaseModule } from "../database/database.module.js";

@Module({
  imports: [DatabaseModule],
  controllers: [UploadsController],
  providers: [UploadsService, FitParserService, GpxParserService, WorkoutFileRepository],
  exports: [UploadsService, FitParserService, GpxParserService, WorkoutFileRepository],
})
export class UploadsModule {}
