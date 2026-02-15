import { Injectable } from "@nestjs/common";
import type { ParsedWorkoutData } from "./fit-parser.service.js";

@Injectable()
export class GpxParserService {
  async parse(xmlString: string): Promise<ParsedWorkoutData> {
    // Basic GPX parsing using regex for track points
    // GPX format: <trkpt lat="..." lon="..."><time>...</time></trkpt>
    const trackPoints = this.extractTrackPoints(xmlString);

    if (trackPoints.length < 2) {
      throw new Error("GPX file has insufficient track points");
    }

    const startTime = trackPoints[0].timestamp;
    const endTime = trackPoints[trackPoints.length - 1].timestamp;
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    let totalDistance = 0;
    for (let i = 1; i < trackPoints.length; i++) {
      totalDistance += this.haversineDistance(
        trackPoints[i - 1].lat, trackPoints[i - 1].lon,
        trackPoints[i].lat, trackPoints[i].lon
      );
    }

    const avgPace = duration / (totalDistance / 1000); // seconds per km

    return {
      distance: totalDistance,
      duration,
      startTime,
      endTime,
      avgPace,
      gpsTrack: trackPoints,
    };
  }

  private extractTrackPoints(xml: string): Array<{ lat: number; lon: number; timestamp: Date }> {
    const points: Array<{ lat: number; lon: number; timestamp: Date }> = [];
    const trkptRegex = /<trkpt\s+(?:lat="([^"]+)"\s+lon="([^"]+)"|lon="([^"]+)"\s+lat="([^"]+)")[^>]*>[\s\S]*?<time>([^<]+)<\/time>[\s\S]*?<\/trkpt>/g;
    let match;
    while ((match = trkptRegex.exec(xml)) !== null) {
      // Handle both attribute orders: lat-lon or lon-lat
      const lat = match[1] ? parseFloat(match[1]) : parseFloat(match[4]);
      const lon = match[2] ? parseFloat(match[2]) : parseFloat(match[3]);
      const timestamp = match[5];

      points.push({
        lat,
        lon,
        timestamp: new Date(timestamp),
      });
    }
    return points;
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
