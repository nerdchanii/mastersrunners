import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import type { TransactionClient } from "@masters/database";
import { FitParserService } from "./parsers/fit-parser.service.js";
import { GpxParserService } from "./parsers/gpx-parser.service.js";
import { DatabaseService } from "../database/database.service.js";
import { STORAGE_ADAPTER, type StorageAdapter } from "./storage/storage-adapter.interface.js";

export interface ParseAndCreateResult {
  workout: any | null;
  workoutFile: any;
  error?: string;
}

@Injectable()
export class UploadsService {
  constructor(
    @Inject(STORAGE_ADAPTER) private readonly storage: StorageAdapter,
    private readonly fitParser: FitParserService,
    private readonly gpxParser: GpxParserService,
    private readonly db: DatabaseService,
  ) {}

  async getUploadUrl(key: string, contentType: string, expiresIn = 3600) {
    return this.storage.getUploadUrl(key, contentType, expiresIn);
  }

  async getDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    return this.storage.getDownloadUrl(key, expiresIn);
  }

  async deleteFile(key: string): Promise<void> {
    return this.storage.deleteFile(key);
  }

  generateKey(userId: string, folder: string, filename: string): string {
    const timestamp = Date.now();
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    return `${folder}/${userId}/${timestamp}-${sanitized}`;
  }

  async downloadFile(key: string): Promise<{ buffer: Buffer; size: number }> {
    return this.storage.downloadFile(key);
  }

  async parseAndCreateWorkout(
    userId: string,
    input: { fileKey: string; fileType: "FIT" | "GPX"; originalFileName: string },
  ): Promise<ParseAndCreateResult> {
    if (input.fileType !== "FIT" && input.fileType !== "GPX") {
      throw new BadRequestException(`Unsupported file type: ${input.fileType}. Only FIT and GPX are supported.`);
    }

    // 1. Download file from storage
    const { buffer, size } = await this.storage.downloadFile(input.fileKey);

    // 2. Parse
    let parsedData;
    try {
      if (input.fileType === "FIT") {
        parsedData = await this.fitParser.parse(buffer);
      } else {
        parsedData = await this.gpxParser.parse(buffer.toString("utf-8"));
      }
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : "Unknown parse error";
      return { workout: null, workoutFile: null, error: errorMessage };
    }

    // 3. Create Workout + WorkoutFile + WorkoutRoute in a transaction
    const publicUrl = this.storage.getPublicUrl(input.fileKey);
    return this.db.prisma.$transaction(async (tx: TransactionClient) => {
      const workout = await tx.workout.create({
        data: {
          userId,
          distance: parsedData.distance,
          duration: parsedData.duration,
          pace: parsedData.avgPace,
          date: parsedData.startTime,
          startedAt: parsedData.startTime,
          finishedAt: parsedData.endTime,
          source: input.fileType === "FIT" ? "FIT_FILE" : "GPX_FILE",
          avgHeartRate: parsedData.avgHeartRate,
          maxHeartRate: parsedData.maxHeartRate,
          elevationGain: parsedData.elevationGain,
          avgCadence: parsedData.avgCadence,
          maxCadence: parsedData.maxCadence,
          calories: parsedData.calories,
          hasGps: !!parsedData.gpsTrack && parsedData.gpsTrack.length > 0,
          startLat: parsedData.gpsTrack?.[0]?.lat,
          startLng: parsedData.gpsTrack?.[0]?.lon,
          endLat: parsedData.gpsTrack?.[parsedData.gpsTrack.length - 1]?.lat,
          endLng: parsedData.gpsTrack?.[parsedData.gpsTrack.length - 1]?.lon,
        },
      });

      const workoutFile = await tx.workoutFile.create({
        data: {
          workoutId: workout.id,
          fileType: input.fileType,
          fileUrl: publicUrl,
          originalFileName: input.originalFileName,
          fileSize: size,
          processStatus: "COMPLETED",
          processedAt: new Date(),
        },
      });

      // Create route if GPS data exists
      if (parsedData.gpsTrack && parsedData.gpsTrack.length > 0) {
        const lats = parsedData.gpsTrack.map((p) => p.lat);
        const lons = parsedData.gpsTrack.map((p) => p.lon);

        await tx.workoutRoute.create({
          data: {
            workoutId: workout.id,
            encodedPolyline: "",
            routeData: JSON.stringify(parsedData.gpsTrack),
            boundNorth: Math.max(...lats),
            boundSouth: Math.min(...lats),
            boundEast: Math.max(...lons),
            boundWest: Math.min(...lons),
            totalPoints: parsedData.gpsTrack.length,
          },
        });
      }

      // Create laps if available
      if (parsedData.laps && parsedData.laps.length > 0) {
        await Promise.all(
          parsedData.laps.map((lap) =>
            tx.workoutLap.create({
              data: {
                workoutId: workout.id,
                lapNumber: lap.lapNumber,
                distance: lap.distance,
                duration: lap.duration,
                pace: lap.avgPace,
                avgHeartRate: lap.avgHeartRate,
                maxHeartRate: lap.maxHeartRate,
                avgCadence: lap.avgCadence,
                calories: lap.calories,
                startedAt: lap.startTime,
              },
            }),
          ),
        );
      }

      return { workout, workoutFile };
    });
  }
}
