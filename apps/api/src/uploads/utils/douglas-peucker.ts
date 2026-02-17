/**
 * Douglas-Peucker 알고리즘을 사용해 GPS 트랙을 다운샘플링합니다.
 * 지정한 epsilon(미터 단위) 이하의 편차를 가진 포인트를 제거합니다.
 */

export interface GpsPoint {
  lat: number;
  lon: number;
  timestamp?: Date;
  elevation?: number;
  heartRate?: number;
  cadence?: number;
  [key: string]: unknown;
}

/**
 * 두 GPS 좌표 사이의 Haversine 거리(미터)를 계산합니다.
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 선분(lat1,lon1)→(lat2,lon2)에서 점(lat,lon)까지의 수직 거리(미터)를 계산합니다.
 */
function perpendicularDistance(
  lat: number,
  lon: number,
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const d12 = haversineDistance(lat1, lon1, lat2, lon2);
  if (d12 === 0) {
    return haversineDistance(lat, lon, lat1, lon1);
  }

  // Use cross product approximation in flat-earth projection (good enough for small distances)
  const dx = lat2 - lat1;
  const dy = lon2 - lon1;
  const area = Math.abs(dy * lat - dx * lon + lat2 * lon1 - lon2 * lat1);
  const base = Math.sqrt(dx * dx + dy * dy);
  const ratioDistance = area / base;

  // Convert ratio to approximate meters
  const latMeters = haversineDistance(lat1, lon1, lat2, lon1);
  const lonMeters = haversineDistance(lat1, lon1, lat1, lon2);
  const totalMeters = Math.sqrt(latMeters * latMeters + lonMeters * lonMeters);
  const totalRatio = Math.sqrt(dx * dx + dy * dy);

  if (totalRatio === 0) return 0;
  return (ratioDistance / totalRatio) * totalMeters;
}

/**
 * Douglas-Peucker 재귀 구현
 */
function douglasPeuckerRecursive<T extends GpsPoint>(
  points: T[],
  start: number,
  end: number,
  epsilon: number,
  keepFlags: boolean[],
): void {
  if (end <= start + 1) return;

  let maxDist = 0;
  let maxIndex = start;

  for (let i = start + 1; i < end; i++) {
    const dist = perpendicularDistance(
      points[i].lat,
      points[i].lon,
      points[start].lat,
      points[start].lon,
      points[end].lat,
      points[end].lon,
    );
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }

  if (maxDist > epsilon) {
    keepFlags[maxIndex] = true;
    douglasPeuckerRecursive(points, start, maxIndex, epsilon, keepFlags);
    douglasPeuckerRecursive(points, maxIndex, end, epsilon, keepFlags);
  }
}

/**
 * Douglas-Peucker 알고리즘으로 GPS 트랙 포인트를 다운샘플링합니다.
 *
 * @param points GPS 트랙 포인트 배열
 * @param epsilon 허용 오차 (미터). 기본값: 5m
 * @returns 다운샘플링된 포인트 배열 (첫/마지막 포인트 항상 포함)
 */
export function douglasPeucker<T extends GpsPoint>(points: T[], epsilon = 5): T[] {
  if (points.length <= 2) return points;

  const keepFlags = new Array(points.length).fill(false);
  keepFlags[0] = true;
  keepFlags[points.length - 1] = true;

  douglasPeuckerRecursive(points, 0, points.length - 1, epsilon, keepFlags);

  return points.filter((_, i) => keepFlags[i]);
}
