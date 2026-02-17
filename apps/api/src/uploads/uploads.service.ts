import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import type { TransactionClient } from "@masters/database";
import { FitParserService } from "./parsers/fit-parser.service.js";
import { GpxParserService } from "./parsers/gpx-parser.service.js";
import { DatabaseService } from "../database/database.service.js";
import { STORAGE_ADAPTER, type StorageAdapter } from "./storage/storage-adapter.interface.js";
import { encodePolyline } from "./utils/encoded-polyline.js";
import { douglasPeucker as douglasPeuckerUtil } from "./utils/douglas-peucker.js";

const DOWNSAMPLE_THRESHOLD = 1000;
const DOWNSAMPLE_TARGET = 500;

type GpsPoint = {
  lat: number;
  lon: number;
  timestamp: Date;
  elevation?: number;
  heartRate?: number;
  cadence?: number;
};

function perpendicularDistance(point: GpsPoint, lineStart: GpsPoint, lineEnd: GpsPoint): number {
  const dx = lineEnd.lat - lineStart.lat;
  const dy = lineEnd.lon - lineStart.lon;
  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag === 0) {
    return Math.sqrt(
      (point.lat - lineStart.lat) ** 2 + (point.lon - lineStart.lon) ** 2,
    );
  }
  return Math.abs(dx * (lineStart.lon - point.lon) - dy * (lineStart.lat - point.lat)) / mag;
}

function douglasPeucker(points: GpsPoint[], epsilon: number): GpsPoint[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIndex = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[end]);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }

  if (maxDist > epsilon) {
    const left = douglasPeucker(points.slice(0, maxIndex + 1), epsilon);
    const right = douglasPeucker(points.slice(maxIndex), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  return [points[0], points[end]];
}

function downsampleTrack(track: GpsPoint[], targetCount: number): GpsPoint[] {
  if (track.length <= targetCount) return track;

  // Use increasing epsilon until we reach target count
  let epsilon = 0.00001;
  let result = track;
  for (let attempt = 0; attempt < 20 && result.length > targetCount; attempt++) {
    result = douglasPeucker(track, epsilon);
    epsilon *= 2;
  }
  // If still too many, take evenly spaced subset
  if (result.length > targetCount) {
    const step = result.length / targetCount;
    const sampled: GpsPoint[] = [];
    for (let i = 0; i < targetCount - 1; i++) {
      sampled.push(result[Math.floor(i * step)]);
    }
    sampled.push(result[result.length - 1]);
    return sampled;
  }
  return result;
}

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
        // Downsample large tracks using Douglas-Peucker algorithm
        const trackToSave =
          parsedData.gpsTrack.length > DOWNSAMPLE_THRESHOLD
            ? downsampleTrack(parsedData.gpsTrack, DOWNSAMPLE_TARGET)
            : parsedData.gpsTrack;

        const lats = trackToSave.map((p) => p.lat);
        const lons = trackToSave.map((p) => p.lon);

        // Generate encoded polyline for map thumbnail display
        // Further downsample to max 500 points for polyline using Douglas-Peucker
        const polylinePoints = douglasPeuckerUtil(
          trackToSave.map((p) => ({ lat: p.lat, lon: p.lon })),
          10, // 10m epsilon
        ).map((p) => ({ lat: p.lat, lng: p.lon }));
        const encodedPolylineStr = encodePolyline(polylinePoints);

        await tx.workoutRoute.create({
          data: {
            workoutId: workout.id,
            encodedPolyline: encodedPolylineStr,
            routeData: JSON.stringify(trackToSave),
            boundNorth: Math.max(...lats),
            boundSouth: Math.min(...lats),
            boundEast: Math.max(...lons),
            boundWest: Math.min(...lons),
            totalPoints: trackToSave.length,
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
