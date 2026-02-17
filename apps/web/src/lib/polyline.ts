/**
 * Google Encoded Polyline Algorithm 디코더
 * https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
export interface LatLng {
  lat: number;
  lng: number;
}

export function decodePolyline(encoded: string): LatLng[] {
  const result: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result_b = 0;
    let b: number;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result_b |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result_b & 1 ? ~(result_b >> 1) : result_b >> 1;
    lat += dlat;

    shift = 0;
    result_b = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result_b |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result_b & 1 ? ~(result_b >> 1) : result_b >> 1;
    lng += dlng;

    result.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return result;
}

/** LatLng 배열을 SVG viewBox에 맞게 정규화 */
export function normalizePath(
  points: LatLng[],
  width: number,
  height: number,
  padding = 4
): Array<{ x: number; y: number }> {
  if (points.length < 2) return [];

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  // 종횡비 유지
  const scale = Math.min(innerW / lngRange, innerH / latRange);
  const offsetX = padding + (innerW - lngRange * scale) / 2;
  const offsetY = padding + (innerH - latRange * scale) / 2;

  return points.map((p) => ({
    x: offsetX + (p.lng - minLng) * scale,
    // SVG y축은 반전
    y: offsetY + (maxLat - p.lat) * scale,
  }));
}
