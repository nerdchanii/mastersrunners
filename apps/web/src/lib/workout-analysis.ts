export interface WorkoutRoutePointLike {
  lat: number;
  lon?: number | null;
  lng?: number | null;
  elevation?: number | null;
  heartRate?: number | null;
  cadence?: number | null;
  timestamp?: string | Date | null;
}

export interface WorkoutTrackPoint {
  index: number;
  lat: number;
  lon: number;
  distanceMeters: number;
  distanceKm: number;
  elapsedSeconds: number;
  elevation: number | null;
  heartRate: number | null;
  cadence: number | null;
  timestamp: string | null;
}

export interface WorkoutLapLike {
  lapNumber: number;
  distance: number;
  duration: number;
  pace: number;
  avgHeartRate?: number | null;
  maxHeartRate?: number | null;
  avgCadence?: number | null;
  calories?: number | null;
}

export interface WorkoutLapSegment extends WorkoutLapLike {
  startIndex: number | null;
  endIndex: number | null;
  startDistanceMeters: number;
  endDistanceMeters: number;
  startDistanceKm: number;
  endDistanceKm: number;
}

function toFiniteNumber(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseTimestamp(timestamp: string | Date | null | undefined): number | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) {
    return Number.isFinite(timestamp.getTime()) ? timestamp.getTime() : null;
  }

  const parsed = new Date(timestamp);
  return Number.isFinite(parsed.getTime()) ? parsed.getTime() : null;
}

function resolveLon(point: WorkoutRoutePointLike): number | null {
  const lon = point.lon ?? point.lng;
  return typeof lon === "number" && Number.isFinite(lon) ? lon : null;
}

function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadius = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

export function buildWorkoutTrack(
  routeData: WorkoutRoutePointLike[],
  totalDurationSeconds: number,
): WorkoutTrackPoint[] {
  const sanitized = routeData
    .map((point) => {
      const lon = resolveLon(point);
      if (!Number.isFinite(point.lat) || lon == null) {
        return null;
      }

      return {
        lat: point.lat,
        lon,
        elevation: toFiniteNumber(point.elevation),
        heartRate: toFiniteNumber(point.heartRate),
        cadence: toFiniteNumber(point.cadence),
        timestampMs: parseTimestamp(point.timestamp),
      };
    })
    .filter((point): point is NonNullable<typeof point> => point != null);

  if (sanitized.length === 0) {
    return [];
  }

  const firstTimestamp = sanitized[0].timestampMs;
  const lastTimestamp = sanitized[sanitized.length - 1].timestampMs;
  const canUseTimestamps =
    firstTimestamp != null &&
    lastTimestamp != null &&
    lastTimestamp > firstTimestamp &&
    sanitized.every((point) => point.timestampMs != null);

  const totalDistanceMeters = sanitized.reduce((distance, point, index) => {
    if (index === 0) return 0;
    const previous = sanitized[index - 1];
    return distance + haversineDistanceMeters(previous.lat, previous.lon, point.lat, point.lon);
  }, 0);

  let cumulativeDistance = 0;

  return sanitized.map((point, index) => {
    if (index > 0) {
      const previous = sanitized[index - 1];
      cumulativeDistance += haversineDistanceMeters(
        previous.lat,
        previous.lon,
        point.lat,
        point.lon,
      );
    }

    let elapsedSeconds = 0;
    if (canUseTimestamps) {
      elapsedSeconds = Math.max(0, (point.timestampMs! - firstTimestamp!) / 1000);
    } else if (totalDurationSeconds > 0 && totalDistanceMeters > 0) {
      elapsedSeconds = (cumulativeDistance / totalDistanceMeters) * totalDurationSeconds;
    } else if (totalDurationSeconds > 0 && sanitized.length > 1) {
      elapsedSeconds = (index / (sanitized.length - 1)) * totalDurationSeconds;
    }

    return {
      index,
      lat: point.lat,
      lon: point.lon,
      distanceMeters: cumulativeDistance,
      distanceKm: cumulativeDistance / 1000,
      elapsedSeconds,
      elevation: point.elevation,
      heartRate: point.heartRate,
      cadence: point.cadence,
      timestamp: point.timestampMs != null ? new Date(point.timestampMs).toISOString() : null,
    };
  });
}

export function sampleWorkoutTrack(
  track: WorkoutTrackPoint[],
  maxPoints = 240,
): WorkoutTrackPoint[] {
  if (track.length <= maxPoints) {
    return track;
  }

  const sampled: WorkoutTrackPoint[] = [];
  const lastIndex = track.length - 1;
  const step = lastIndex / (maxPoints - 1);

  for (let sampleIndex = 0; sampleIndex < maxPoints; sampleIndex += 1) {
    const sourceIndex = Math.round(sampleIndex * step);
    const point = track[sourceIndex];
    if (!point) continue;
    if (sampled[sampled.length - 1]?.index === point.index) continue;
    sampled.push(point);
  }

  if (sampled[sampled.length - 1]?.index !== track[lastIndex]?.index) {
    sampled.push(track[lastIndex]);
  }

  return sampled;
}

export function hasMetricSeries(
  track: WorkoutTrackPoint[],
  metric: "elevation" | "heartRate" | "cadence",
): boolean {
  return track.filter((point) => point[metric] != null).length >= 2;
}

function findNearestPointIndex(track: WorkoutTrackPoint[], distanceMeters: number): number {
  if (track.length === 0) return 0;

  let nearestIndex = 0;
  let nearestDelta = Number.POSITIVE_INFINITY;

  track.forEach((point, index) => {
    const delta = Math.abs(point.distanceMeters - distanceMeters);
    if (delta < nearestDelta) {
      nearestDelta = delta;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

export function buildLapSegments(
  laps: WorkoutLapLike[],
  track: WorkoutTrackPoint[],
): WorkoutLapSegment[] {
  if (laps.length === 0) {
    return [];
  }

  const totalLapDistance = laps.reduce((distance, lap) => distance + lap.distance, 0);
  const totalTrackDistance = track[track.length - 1]?.distanceMeters ?? totalLapDistance;
  let startDistanceMeters = 0;

  return laps.map((lap) => {
    const rawEndDistanceMeters = startDistanceMeters + lap.distance;
    const endDistanceMeters = Math.min(totalTrackDistance, rawEndDistanceMeters);
    const hasTrack = track.length > 0;
    const startIndex = hasTrack ? findNearestPointIndex(track, startDistanceMeters) : null;
    const endIndex =
      hasTrack && startIndex != null
        ? Math.max(startIndex, findNearestPointIndex(track, endDistanceMeters))
        : null;

    const segment: WorkoutLapSegment = {
      ...lap,
      startIndex,
      endIndex,
      startDistanceMeters,
      endDistanceMeters,
      startDistanceKm: startDistanceMeters / 1000,
      endDistanceKm: endDistanceMeters / 1000,
    };

    startDistanceMeters += lap.distance;
    return segment;
  });
}
