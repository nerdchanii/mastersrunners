/**
 * Google Encoded Polyline Algorithm
 * https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */

export interface LatLng {
  lat: number;
  lng: number;
}

function encodeNumber(num: number): string {
  let value = Math.round(num * 1e5);
  value = value < 0 ? ~(value << 1) : value << 1;

  let result = "";
  while (value >= 0x20) {
    result += String.fromCharCode(((0x20 | (value & 0x1f)) + 63));
    value >>= 5;
  }
  result += String.fromCharCode((value + 63));
  return result;
}

/**
 * GPS 좌표 배열을 Google Encoded Polyline 문자열로 인코딩합니다.
 */
export function encodePolyline(points: LatLng[]): string {
  if (points.length === 0) return "";

  let result = "";
  let prevLat = 0;
  let prevLng = 0;

  for (const point of points) {
    result += encodeNumber(point.lat - prevLat);
    result += encodeNumber(point.lng - prevLng);
    prevLat = point.lat;
    prevLng = point.lng;
  }

  return result;
}

/**
 * Google Encoded Polyline 문자열을 GPS 좌표 배열로 디코딩합니다.
 */
export function decodePolyline(encoded: string): LatLng[] {
  if (!encoded) return [];

  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    // Decode latitude
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dLat;

    // Decode longitude
    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dLng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}
