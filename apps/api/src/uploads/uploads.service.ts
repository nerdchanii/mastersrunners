import { Injectable, BadRequestException } from "@nestjs/common";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Prisma } from "@masters-runners/database";
import { FitParserService } from "./parsers/fit-parser.service.js";
import { GpxParserService } from "./parsers/gpx-parser.service.js";
import { DatabaseService } from "../database/database.service.js";

export interface ParseAndCreateResult {
  workout: any | null;
  workoutFile: any;
  error?: string;
}

@Injectable()
export class UploadsService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(
    private readonly fitParser: FitParserService,
    private readonly gpxParser: GpxParserService,
    private readonly db: DatabaseService,
  ) {
    this.bucket = process.env.R2_BUCKET || "masters-runners";
    this.publicUrl = process.env.R2_PUBLIC_URL || "";
    this.s3 = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT || "",
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
    });
  }

  async getUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn });
    return {
      uploadUrl,
      key,
      publicUrl: `${this.publicUrl}/${key}`,
    };
  }

  async getDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await this.s3.send(command);
  }

  generateKey(userId: string, folder: string, filename: string): string {
    const timestamp = Date.now();
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    return `${folder}/${userId}/${timestamp}-${sanitized}`;
  }

  async downloadFile(key: string): Promise<{ buffer: Buffer; size: number }> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    const response = await this.s3.send(command);
    const bytes = await response.Body!.transformToByteArray();
    return {
      buffer: Buffer.from(bytes),
      size: response.ContentLength || bytes.length,
    };
  }

  async parseAndCreateWorkout(
    userId: string,
    input: { fileKey: string; fileType: "FIT" | "GPX"; originalFileName: string },
  ): Promise<ParseAndCreateResult> {
    if (input.fileType !== "FIT" && input.fileType !== "GPX") {
      throw new BadRequestException(`Unsupported file type: ${input.fileType}. Only FIT and GPX are supported.`);
    }

    // 1. Download file from R2
    const { buffer, size } = await this.downloadFile(input.fileKey);

    // 2. Parse
    let parsedData;
    try {
      if (input.fileType === "FIT") {
        parsedData = await this.fitParser.parse(buffer);
      } else {
        parsedData = await this.gpxParser.parse(buffer.toString("utf-8"));
      }
    } catch (parseError) {
      // Parse failed — return error without creating orphaned WorkoutFile
      // (WorkoutFile.workoutId is required and non-nullable, so we can't create one without a valid workout)
      const errorMessage = parseError instanceof Error ? parseError.message : "Unknown parse error";
      return { workout: null, workoutFile: null, error: errorMessage };
    }

    // 3. Create Workout + WorkoutFile + WorkoutRoute in a transaction
    return this.db.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
          fileUrl: `${this.publicUrl}/${input.fileKey}`,
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

      return { workout, workoutFile };
    });
  }
}
