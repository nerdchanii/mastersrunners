import { ForbiddenException, Injectable } from "@nestjs/common";

import { ChallengeAggregationService } from "../challenges/challenge-aggregation.service.js";
import { StructuredLoggerService } from "../common/logging/structured-logger.service.js";
import { MonitoringService } from "../common/monitoring/monitoring.service.js";
import { FollowRepository } from "../follow/repositories/follow.repository.js";
import { ShoeRepository } from "../shoes/repositories/shoe.repository.js";
import { UploadsService } from "../uploads/uploads.service.js";

import type { CreateWorkoutDto } from "./dto/create-workout.dto.js";
import type { UpdateWorkoutDto } from "./dto/update-workout.dto.js";
import { WorkoutRepository } from "./repositories/workout.repository.js";

type WorkoutDetailTrackPoint = {
  lat: number;
  lon: number;
  timestamp?: string;
  elevation?: number;
  heartRate?: number;
  cadence?: number;
};

type WorkoutDetailLap = {
  lapNumber: number;
  startTime: string;
  distance: number;
  duration: number;
  avgPace: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  avgCadence?: number;
  calories?: number;
};

type WorkoutDetailBlobV1 = {
  version: 1;
  track: WorkoutDetailTrackPoint[];
  laps: WorkoutDetailLap[];
  metrics?: {
    firstPoint?: WorkoutDetailTrackPoint | null;
    lastPoint?: WorkoutDetailTrackPoint | null;
  };
};

type WorkoutPointSummary = {
  lat: number;
  lon: number;
  elevation?: number;
};

function isWorkoutDetailBlobV1(value: unknown): value is WorkoutDetailBlobV1 {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const blob = value as Record<string, unknown>;
  return blob.version === 1 && Array.isArray(blob.track) && Array.isArray(blob.laps);
}

@Injectable()
export class WorkoutsService {
  constructor(
    private readonly workoutRepo: WorkoutRepository,
    private readonly challengeAggregation: ChallengeAggregationService,
    private readonly shoeRepo: ShoeRepository,
    private readonly logger: StructuredLoggerService,
    private readonly monitoring: MonitoringService,
    private readonly followRepo: FollowRepository,
    private readonly uploadsService: UploadsService,
  ) {}

  private sanitizeWorkoutSummary<T extends Record<string, unknown>>(
    workout: T,
  ): Omit<T, "detailPath" | "detailFormatVersion"> {
    const {
      detailPath: _detailPath,
      detailFormatVersion: _detailFormatVersion,
      ...safeWorkout
    } = workout;
    return safeWorkout;
  }

  private async readWorkoutDetailBlob(
    detailPath: string | null | undefined,
  ): Promise<WorkoutDetailBlobV1 | null> {
    if (!detailPath) {
      return null;
    }

    try {
      const { buffer } = await this.uploadsService.downloadFile(detailPath);
      const parsed = JSON.parse(buffer.toString("utf-8")) as unknown;
      return isWorkoutDetailBlobV1(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private mapDetailPoint(
    point: WorkoutDetailTrackPoint | null | undefined,
  ): WorkoutPointSummary | null {
    if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lon)) {
      return null;
    }

    return {
      lat: point.lat,
      lon: point.lon,
      ...(point.elevation !== undefined && { elevation: point.elevation }),
    };
  }

  private synthesizeRouteFromDetail(
    workoutId: string,
    encodedPolyline: string | null | undefined,
    detailBlob: WorkoutDetailBlobV1,
    legacyRoute: Record<string, unknown> | null,
  ) {
    if (detailBlob.track.length === 0) {
      return [];
    }

    const latitudes = detailBlob.track.map((point) => point.lat);
    const longitudes = detailBlob.track.map((point) => point.lon);

    return [
      {
        ...(legacyRoute ?? {}),
        id:
          typeof legacyRoute?.id === "string" && legacyRoute.id.length > 0
            ? legacyRoute.id
            : `${workoutId}:route`,
        workoutId,
        encodedPolyline: encodedPolyline ?? null,
        routeData: JSON.stringify(detailBlob.track),
        boundNorth: Math.max(...latitudes),
        boundSouth: Math.min(...latitudes),
        boundEast: Math.max(...longitudes),
        boundWest: Math.min(...longitudes),
        totalPoints: detailBlob.track.length,
      },
    ];
  }

  private synthesizeLapsFromDetail(workoutId: string, detailBlob: WorkoutDetailBlobV1) {
    return detailBlob.laps.map((lap) => ({
      id: `${workoutId}:lap:${lap.lapNumber}`,
      lapNumber: lap.lapNumber,
      distance: lap.distance,
      duration: lap.duration,
      pace: lap.avgPace,
      ...(lap.avgHeartRate !== undefined && { avgHeartRate: lap.avgHeartRate }),
      ...(lap.maxHeartRate !== undefined && { maxHeartRate: lap.maxHeartRate }),
      ...(lap.avgCadence !== undefined && { avgCadence: lap.avgCadence }),
      ...(lap.calories !== undefined && { calories: lap.calories }),
      startedAt: lap.startTime,
    }));
  }

  private getWorkoutOwnerId(workout: {
    userId?: unknown;
    user?: { id?: unknown } | null;
  }): string | null {
    if (typeof workout.userId === "string" && workout.userId.length > 0) {
      return workout.userId;
    }

    if (typeof workout.user?.id === "string" && workout.user.id.length > 0) {
      return workout.user.id;
    }

    return null;
  }

  private async assertCanReadWorkout(
    workout: {
      visibility?: unknown;
      userId?: unknown;
      user?: { id?: unknown } | null;
    },
    requesterUserId?: string,
  ) {
    const ownerUserId = this.getWorkoutOwnerId(workout);
    const visibility = workout.visibility;

    if (
      !ownerUserId ||
      (visibility !== "PUBLIC" && visibility !== "PRIVATE" && visibility !== "FOLLOWERS")
    ) {
      throw new ForbiddenException("접근 권한이 없습니다.");
    }

    if (visibility === "PRIVATE" && ownerUserId !== requesterUserId) {
      throw new ForbiddenException("접근 권한이 없습니다.");
    }

    if (visibility === "FOLLOWERS" && ownerUserId !== requesterUserId) {
      if (!requesterUserId) {
        throw new ForbiddenException("접근 권한이 없습니다.");
      }

      const follow = await this.followRepo.findFollow(requesterUserId, ownerUserId);
      if (!follow || follow.status !== "ACCEPTED") {
        throw new ForbiddenException("접근 권한이 없습니다.");
      }
    }
  }

  async findAll(
    requesterUserId: string,
    options?: { cursor?: string; limit?: number },
    targetUserId?: string,
  ) {
    const userId = targetUserId ?? requesterUserId;

    if (options?.cursor !== undefined || options?.limit !== undefined) {
      const result = await this.workoutRepo.findByUserWithCursor(userId, options ?? {});
      return {
        ...result,
        data: result.data.map((workout: Record<string, unknown>) =>
          this.sanitizeWorkoutSummary(workout),
        ),
      };
    }
    const workouts = await this.workoutRepo.findAllByUser(userId);
    return workouts.map((workout: Record<string, unknown>) => this.sanitizeWorkoutSummary(workout));
  }

  async create(userId: string, dto: CreateWorkoutDto) {
    const pace = dto.duration / (dto.distance / 1000);
    const workout = await this.workoutRepo.create({
      userId,
      distance: dto.distance,
      duration: dto.duration,
      pace,
      date: new Date(dto.date),
      title: dto.title || null,
      workoutTypeId: dto.workoutTypeId || null,
      memo: dto.memo || null,
      visibility: dto.visibility || "FOLLOWERS",
      shoeId: dto.shoeId || null,
    });

    // Update shoe total distance (non-blocking)
    if (dto.shoeId) {
      try {
        await this.shoeRepo.addDistance(dto.shoeId, dto.distance);
      } catch (error) {
        this.logger.errorWithFields("Failed to update shoe distance", "WorkoutsService", {
          error,
          operation: "create",
          shoeId: dto.shoeId,
          userId,
        });
        this.monitoring.captureException(error, {
          context: "WorkoutsService.create",
          operation: "shoe_distance_increment",
          shoeId: dto.shoeId,
          userId,
        });
      }
    }

    // Aggregate challenge progress (non-blocking)
    try {
      await this.challengeAggregation.onWorkoutCreated(userId, {
        distance: dto.distance,
        duration: dto.duration,
        pace,
        date: new Date(dto.date),
      });
    } catch (error) {
      this.logger.errorWithFields("Failed to aggregate challenge progress", "WorkoutsService", {
        error,
        operation: "create",
        userId,
      });
      this.monitoring.captureException(error, {
        context: "WorkoutsService.create",
        operation: "challenge_aggregation",
        userId,
      });
    }

    return workout;
  }

  async findOne(id: string, requesterUserId?: string) {
    const workout = await this.workoutRepo.findByIdWithUser(id, requesterUserId);
    if (!workout) return null;
    await this.assertCanReadWorkout(workout, requesterUserId);
    const {
      file,
      route,
      laps,
      _count,
      workoutLikes,
      detailPath: _detailPath,
      detailFormatVersion: _detailFormatVersion,
      ...rest
    } = workout;
    const safeFile = file
      ? (({ fileUrl: _fileUrl, sourcePath: _sourcePath, ...safe }) => safe)(file)
      : null;
    const detailBlob = await this.readWorkoutDetailBlob(workout.detailPath);
    const firstDetailTrackPoint = detailBlob?.track[0];
    const lastDetailTrackPoint =
      detailBlob && detailBlob.track.length > 0
        ? detailBlob.track[detailBlob.track.length - 1]
        : undefined;

    const firstPointFromDetail =
      this.mapDetailPoint(detailBlob?.metrics?.firstPoint ?? firstDetailTrackPoint) ?? null;
    const lastPointFromDetail =
      this.mapDetailPoint(detailBlob?.metrics?.lastPoint ?? lastDetailTrackPoint) ?? null;

    // Extract firstPoint/lastPoint from gpsTrack if available
    let firstPoint: { lat: number; lon: number; elevation?: number } | null = firstPointFromDetail;
    let lastPoint: { lat: number; lon: number; elevation?: number } | null = lastPointFromDetail;
    if (!detailBlob && route?.routeData) {
      try {
        const gpsTrack = JSON.parse(route.routeData) as Array<{
          lat: number;
          lon: number;
          elevation?: number;
        }>;
        if (gpsTrack.length > 0) {
          const first = gpsTrack[0];
          const last = gpsTrack[gpsTrack.length - 1];
          firstPoint = {
            lat: first.lat,
            lon: first.lon,
            ...(first.elevation !== undefined && { elevation: first.elevation }),
          };
          lastPoint = {
            lat: last.lat,
            lon: last.lon,
            ...(last.elevation !== undefined && { elevation: last.elevation }),
          };
        }
      } catch {
        // routeData may not be valid JSON, skip
      }
    } else if (!detailBlob && rest.startLat != null && rest.startLng != null) {
      firstPoint = { lat: rest.startLat!, lon: rest.startLng! };
      if (rest.endLat != null && rest.endLng != null) {
        lastPoint = { lat: rest.endLat!, lon: rest.endLng! };
      }
    }

    const workoutRoutes = detailBlob
      ? this.synthesizeRouteFromDetail(rest.id, rest.encodedPolyline, detailBlob, route)
      : route
        ? [route]
        : [];
    const workoutLaps = detailBlob ? this.synthesizeLapsFromDetail(rest.id, detailBlob) : laps;

    return {
      ...rest,
      liked: Array.isArray(workoutLikes) ? workoutLikes.length > 0 : false,
      likeCount: _count?.workoutLikes ?? 0,
      commentCount: _count?.workoutComments ?? 0,
      workoutFiles: safeFile ? [safeFile] : [],
      workoutRoutes,
      workoutLaps,
      firstPoint,
      lastPoint,
    };
  }

  async update(id: string, dto: UpdateWorkoutDto) {
    const data: Record<string, unknown> = {};
    if (dto.distance !== undefined) data.distance = dto.distance;
    if (dto.duration !== undefined) data.duration = dto.duration;
    if (dto.date !== undefined) data.date = new Date(dto.date);
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.workoutTypeId !== undefined) data.workoutTypeId = dto.workoutTypeId;
    if (dto.memo !== undefined) data.memo = dto.memo;
    if (dto.visibility !== undefined) data.visibility = dto.visibility;
    if (dto.shoeId !== undefined) data.shoeId = dto.shoeId;

    // Recalculate pace if distance or duration changed
    if (dto.distance !== undefined || dto.duration !== undefined) {
      let distance = dto.distance;
      let duration = dto.duration;

      // Fetch current values for the missing field
      if (distance === undefined || duration === undefined) {
        const current = await this.workoutRepo.findByIdWithUser(id);
        if (current) {
          distance = distance ?? current.distance;
          duration = duration ?? current.duration;
        }
      }

      if (distance !== undefined && duration !== undefined && distance > 0) {
        data.pace = duration / (distance / 1000);
      }
    }

    return this.workoutRepo.update(id, data);
  }

  async remove(id: string) {
    const workout = await this.workoutRepo.findByIdWithUser(id);
    const result = await this.workoutRepo.softDelete(id);

    // Decrement shoe total distance (non-blocking)
    if (workout?.shoeId && workout?.distance) {
      try {
        await this.shoeRepo.removeDistance(workout.shoeId, workout.distance);
      } catch (error) {
        this.logger.errorWithFields("Failed to decrement shoe distance", "WorkoutsService", {
          error,
          operation: "remove",
          shoeId: workout.shoeId,
          workoutId: id,
        });
        this.monitoring.captureException(error, {
          context: "WorkoutsService.remove",
          operation: "shoe_distance_decrement",
          shoeId: workout.shoeId,
          workoutId: id,
        });
      }
    }

    return result;
  }
}
