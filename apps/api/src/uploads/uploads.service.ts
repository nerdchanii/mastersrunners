import type { TransactionClient } from "@masters/database";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";

import { StructuredLoggerService } from "../common/logging/structured-logger.service.js";
import { DatabaseService } from "../database/database.service.js";

import { FitParserService, type ParsedWorkoutData } from "./parsers/fit-parser.service.js";
import { GpxParserService } from "./parsers/gpx-parser.service.js";
import { STORAGE_ADAPTER, type StorageAdapter } from "./storage/storage-adapter.interface.js";
import { douglasPeucker as douglasPeuckerUtil } from "./utils/douglas-peucker.js";
import { encodePolyline } from "./utils/encoded-polyline.js";

const DOWNSAMPLE_THRESHOLD = 1000;
const DOWNSAMPLE_TARGET = 500;
const DETAIL_FORMAT_VERSION = 1;
const PRIVATE_WORKOUT_SOURCE_PLACEHOLDER_URL = "private://workout-source-redacted";

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
    return Math.sqrt((point.lat - lineStart.lat) ** 2 + (point.lon - lineStart.lon) ** 2);
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

export interface WorkoutSourceUploadTarget {
  uploadUrl: string;
  key: string;
}

interface WorkoutDetailBlobV1 {
  version: 1;
  sourceFileType: "FIT" | "GPX";
  summary: {
    distance: number;
    duration: number;
    avgPace: number;
    startTime: string;
    endTime: string;
    avgHeartRate: number | null;
    maxHeartRate: number | null;
    elevationGain: number | null;
    avgCadence: number | null;
    maxCadence: number | null;
    calories: number | null;
  };
  track: Array<{
    lat: number;
    lon: number;
    timestamp: string;
    elevation?: number;
    heartRate?: number;
    cadence?: number;
  }>;
  laps: Array<{
    lapNumber: number;
    startTime: string;
    distance: number;
    duration: number;
    avgPace: number;
    avgHeartRate?: number;
    maxHeartRate?: number;
    avgCadence?: number;
    calories?: number;
  }>;
  metrics: {
    hasGps: boolean;
    firstPoint: WorkoutDetailBlobV1["track"][number] | null;
    lastPoint: WorkoutDetailBlobV1["track"][number] | null;
    maxHeartRate: number | null;
    maxCadence: number | null;
  };
}

@Injectable()
export class UploadsService {
  constructor(
    @Inject(STORAGE_ADAPTER) private readonly storage: StorageAdapter,
    private readonly fitParser: FitParserService,
    private readonly gpxParser: GpxParserService,
    private readonly db: DatabaseService,
    private readonly logger: StructuredLoggerService,
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

  async createPublicAssetUploadTarget(
    userId: string,
    folder: string,
    filename: string,
    contentType: string,
  ) {
    const key = this.generateKey(userId, folder, filename);
    return this.getUploadUrl(key, contentType);
  }

  async createWorkoutSourceUploadTarget(
    userId: string,
    filename: string,
    contentType: string,
  ): Promise<WorkoutSourceUploadTarget> {
    const key = this.generateKey(userId, "workouts", filename);
    const { uploadUrl } = await this.getUploadUrl(key, contentType);
    return { uploadUrl, key };
  }

  async downloadFile(key: string): Promise<{ buffer: Buffer; size: number }> {
    return this.storage.downloadFile(key);
  }

  private generateWorkoutDetailPath(userId: string, originalFileName: string): string {
    const baseName = originalFileName.replace(/\.[^.]+$/, "");
    return this.generateKey(userId, "workout-details", `${baseName}.detail.v1.json`);
  }

  private buildWorkoutDetailBlob(
    parsedData: ParsedWorkoutData,
    fileType: "FIT" | "GPX",
  ): WorkoutDetailBlobV1 {
    const track = (parsedData.gpsTrack ?? []).map((point) => ({
      lat: point.lat,
      lon: point.lon,
      timestamp: point.timestamp.toISOString(),
      ...(point.elevation !== undefined && { elevation: point.elevation }),
      ...(point.heartRate !== undefined && { heartRate: point.heartRate }),
      ...(point.cadence !== undefined && { cadence: point.cadence }),
    }));
    const laps = (parsedData.laps ?? []).map((lap) => ({
      lapNumber: lap.lapNumber,
      startTime: lap.startTime.toISOString(),
      distance: lap.distance,
      duration: lap.duration,
      avgPace: lap.avgPace,
      ...(lap.avgHeartRate !== undefined && { avgHeartRate: lap.avgHeartRate }),
      ...(lap.maxHeartRate !== undefined && { maxHeartRate: lap.maxHeartRate }),
      ...(lap.avgCadence !== undefined && { avgCadence: lap.avgCadence }),
      ...(lap.calories !== undefined && { calories: lap.calories }),
    }));
    const firstPoint = track[0] ?? null;
    const lastPoint = track[track.length - 1] ?? null;

    return {
      version: 1,
      sourceFileType: fileType,
      summary: {
        distance: parsedData.distance,
        duration: parsedData.duration,
        avgPace: parsedData.avgPace,
        startTime: parsedData.startTime.toISOString(),
        endTime: parsedData.endTime.toISOString(),
        avgHeartRate: parsedData.avgHeartRate ?? null,
        maxHeartRate: parsedData.maxHeartRate ?? null,
        elevationGain: parsedData.elevationGain ?? null,
        avgCadence: parsedData.avgCadence ?? null,
        maxCadence: parsedData.maxCadence ?? null,
        calories: parsedData.calories ?? null,
      },
      track,
      laps,
      metrics: {
        hasGps: track.length > 0,
        firstPoint,
        lastPoint,
        maxHeartRate: parsedData.maxHeartRate ?? null,
        maxCadence: parsedData.maxCadence ?? null,
      },
    };
  }

  private async discardTransientWorkoutSource(key: string): Promise<void> {
    try {
      await this.storage.deleteFile(key);
    } catch (error) {
      this.logger.logEvent("warn", "Failed to discard transient workout source", "UploadsService", {
        fileKey: key,
        error:
          error instanceof Error
            ? { name: error.name, message: error.message, stack: error.stack }
            : error,
      });
    }
  }

  private async discardGeneratedWorkoutDetail(key: string): Promise<void> {
    try {
      await this.storage.deleteFile(key);
    } catch (error) {
      this.logger.logEvent(
        "warn",
        "Failed to discard generated workout detail blob",
        "UploadsService",
        {
          detailPath: key,
          error:
            error instanceof Error
              ? { name: error.name, message: error.message, stack: error.stack }
              : error,
        },
      );
    }
  }

  async parseAndCreateWorkout(
    userId: string,
    input: { fileKey: string; fileType: "FIT" | "GPX"; originalFileName: string },
  ): Promise<ParseAndCreateResult> {
    if (input.fileType !== "FIT" && input.fileType !== "GPX") {
      throw new BadRequestException(
        `Unsupported file type: ${input.fileType}. Only FIT and GPX are supported.`,
      );
    }

    // 1. Download file from storage
    const { buffer, size } = await this.storage.downloadFile(input.fileKey);

    // 2. Parse
    let parsedData: ParsedWorkoutData;
    try {
      if (input.fileType === "FIT") {
        parsedData = await this.fitParser.parse(buffer);
      } else {
        parsedData = await this.gpxParser.parse(buffer.toString("utf-8"));
      }
    } catch (parseError) {
      await this.discardTransientWorkoutSource(input.fileKey);
      const errorMessage = parseError instanceof Error ? parseError.message : "Unknown parse error";
      return { workout: null, workoutFile: null, error: errorMessage };
    }

    const detailPath = this.generateWorkoutDetailPath(userId, input.originalFileName);
    const detailBlob = this.buildWorkoutDetailBlob(parsedData, input.fileType);
    await this.storage.saveFile(
      detailPath,
      Buffer.from(JSON.stringify(detailBlob), "utf-8"),
      "application/json",
    );

    let encodedPolylineStr: string | null = null;
    let routeTrackToSave: GpsPoint[] | null = null;
    let routeBounds: {
      boundNorth: number;
      boundSouth: number;
      boundEast: number;
      boundWest: number;
    } | null = null;

    if (parsedData.gpsTrack && parsedData.gpsTrack.length > 0) {
      routeTrackToSave =
        parsedData.gpsTrack.length > DOWNSAMPLE_THRESHOLD
          ? downsampleTrack(parsedData.gpsTrack, DOWNSAMPLE_TARGET)
          : parsedData.gpsTrack;

      const lats = routeTrackToSave.map((p) => p.lat);
      const lons = routeTrackToSave.map((p) => p.lon);
      routeBounds = {
        boundNorth: Math.max(...lats),
        boundSouth: Math.min(...lats),
        boundEast: Math.max(...lons),
        boundWest: Math.min(...lons),
      };

      const polylinePoints = douglasPeuckerUtil(
        routeTrackToSave.map((p) => ({ lat: p.lat, lon: p.lon })),
        10,
      ).map((p) => ({ lat: p.lat, lng: p.lon }));
      encodedPolylineStr = encodePolyline(polylinePoints);
    }

    // 3. Create Workout + WorkoutFile + WorkoutRoute in a transaction
    try {
      return await this.db.prisma.$transaction(async (tx: TransactionClient) => {
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
            encodedPolyline: encodedPolylineStr,
            detailPath,
            detailFormatVersion: DETAIL_FORMAT_VERSION,
          },
        });

        const workoutFile = await tx.workoutFile.create({
          data: {
            workoutId: workout.id,
            fileType: input.fileType,
            fileUrl: PRIVATE_WORKOUT_SOURCE_PLACEHOLDER_URL,
            sourcePath: input.fileKey,
            originalFileName: input.originalFileName,
            fileSize: size,
            processStatus: "COMPLETED",
            processedAt: new Date(),
          },
        });

        if (routeTrackToSave && routeBounds && encodedPolylineStr) {
          await tx.workoutRoute.create({
            data: {
              workoutId: workout.id,
              encodedPolyline: encodedPolylineStr,
              routeData: JSON.stringify(routeTrackToSave),
              boundNorth: routeBounds.boundNorth,
              boundSouth: routeBounds.boundSouth,
              boundEast: routeBounds.boundEast,
              boundWest: routeBounds.boundWest,
              totalPoints: routeTrackToSave.length,
            },
          });
        }

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
    } catch (error) {
      await this.discardGeneratedWorkoutDetail(detailPath);
      throw error;
    }
  }
}
