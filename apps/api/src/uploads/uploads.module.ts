import { Module } from "@nestjs/common";
import { UploadsController } from "./uploads.controller.js";
import { UploadsService } from "./uploads.service.js";
import { FitParserService } from "./parsers/fit-parser.service.js";
import { GpxParserService } from "./parsers/gpx-parser.service.js";

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, FitParserService, GpxParserService],
  exports: [UploadsService, FitParserService, GpxParserService],
})
export class UploadsModule {}
