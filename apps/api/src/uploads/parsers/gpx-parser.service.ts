import { Injectable } from "@nestjs/common";
import type { ParsedWorkoutData } from "./fit-parser.service.js";

@Injectable()
export class GpxParserService {
  async parse(xmlString: string): Promise<ParsedWorkoutData> {
    // Extract track points with optional extensions (elevation, HR, cadence)
    const enrichedPoints = this.extractEnrichedTrackPoints(xmlString);

    if (enrichedPoints.length < 2) {
      throw new Error("GPX file has insufficient track points");
    }

    const startTime = enrichedPoints[0].timestamp;
    const endTime = enrichedPoints[enrichedPoints.length - 1].timestamp;
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    let totalDistance = 0;
    for (let i = 1; i < enrichedPoints.length; i++) {
      totalDistance += this.haversineDistance(
        enrichedPoints[i - 1].lat, enrichedPoints[i - 1].lon,
        enrichedPoints[i].lat, enrichedPoints[i].lon
      );
    }

    const avgPace = duration / (totalDistance / 1000); // seconds per km

    // Calculate elevation gain (sum of positive elevation changes)
    let elevationGain: number | undefined;
    const elevations = enrichedPoints
      .map(p => p.elevation)
      .filter((e): e is number => e !== undefined);
    if (elevations.length >= 2) {
      let gain = 0;
      for (let i = 1; i < elevations.length; i++) {
        const diff = elevations[i] - elevations[i - 1];
        if (diff > 0) {
          gain += diff;
        }
      }
      elevationGain = gain;
    }

    // Calculate heart rate stats
    const heartRates = enrichedPoints
      .map(p => p.heartRate)
      .filter((hr): hr is number => hr !== undefined);
    const avgHeartRate = heartRates.length > 0
      ? heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length
      : undefined;
    const maxHeartRate = heartRates.length > 0
      ? Math.max(...heartRates)
      : undefined;

    // Calculate cadence stats
    const cadences = enrichedPoints
      .map(p => p.cadence)
      .filter((cad): cad is number => cad !== undefined);
    const avgCadence = cadences.length > 0
      ? cadences.reduce((sum, cad) => sum + cad, 0) / cadences.length
      : undefined;
    const maxCadence = cadences.length > 0
      ? Math.max(...cadences)
      : undefined;

    // Build gpsTrack array with all available metrics
    const gpsTrack = enrichedPoints.map(p => ({
      lat: p.lat,
      lon: p.lon,
      timestamp: p.timestamp,
      ...(p.elevation !== undefined && { elevation: p.elevation }),
      ...(p.heartRate !== undefined && { heartRate: p.heartRate }),
      ...(p.cadence !== undefined && { cadence: p.cadence }),
    }));

    return {
      distance: totalDistance,
      duration,
      startTime,
      endTime,
      avgPace,
      elevationGain,
      avgHeartRate,
      maxHeartRate,
      avgCadence,
      maxCadence,
      gpsTrack,
    };
  }

  private extractEnrichedTrackPoints(xml: string): Array<{
    lat: number;
    lon: number;
    timestamp: Date;
    elevation?: number;
    heartRate?: number;
    cadence?: number;
  }> {
    const points: Array<{
      lat: number;
      lon: number;
      timestamp: Date;
      elevation?: number;
      heartRate?: number;
      cadence?: number;
    }> = [];

    const trkptRegex = /<trkpt\s+(?:lat="([^"]+)"\s+lon="([^"]+)"|lon="([^"]+)"\s+lat="([^"]+)")[^>]*>([\s\S]*?)<\/trkpt>/g;
    let match;
    while ((match = trkptRegex.exec(xml)) !== null) {
      // Handle both attribute orders: lat-lon or lon-lat
      const lat = match[1] ? parseFloat(match[1]) : parseFloat(match[4]);
      const lon = match[2] ? parseFloat(match[2]) : parseFloat(match[3]);
      const content = match[5];

      // Extract time (required)
      const timeMatch = /<time>([^<]+)<\/time>/.exec(content);
      if (!timeMatch) continue;
      const timestamp = new Date(timeMatch[1]);

      // Extract optional elevation
      const eleMatch = /<ele>([^<]+)<\/ele>/.exec(content);
      const elevation = eleMatch ? parseFloat(eleMatch[1]) : undefined;

      // Extract optional heart rate (multiple namespace patterns)
      const hrMatch = /<(?:gpxtpx:)?(?:ns3:)?hr>([^<]+)<\/(?:gpxtpx:)?(?:ns3:)?hr>/.exec(content);
      const heartRate = hrMatch ? parseInt(hrMatch[1], 10) : undefined;

      // Extract optional cadence (multiple namespace patterns)
      const cadMatch = /<(?:gpxtpx:)?(?:ns3:)?(?:cad|RunCadence)>([^<]+)<\/(?:gpxtpx:)?(?:ns3:)?(?:cad|RunCadence)>/.exec(content);
      const cadence = cadMatch ? parseInt(cadMatch[1], 10) : undefined;

      points.push({
        lat,
        lon,
        timestamp,
        elevation,
        heartRate,
        cadence,
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
