import { Injectable } from "@nestjs/common";

export interface ParsedLapData {
  lapNumber: number;
  startTime: Date;
  distance: number; // meters
  duration: number; // seconds
  avgPace: number; // seconds per km
  avgHeartRate?: number;
  maxHeartRate?: number;
  avgCadence?: number;
  calories?: number;
}

export interface ParsedWorkoutData {
  distance: number; // meters
  duration: number; // seconds
  startTime: Date;
  endTime: Date;
  avgPace: number; // seconds per km
  avgHeartRate?: number;
  maxHeartRate?: number;
  calories?: number;
  elevationGain?: number;
  avgCadence?: number;
  maxCadence?: number;
  gpsTrack?: Array<{
    lat: number;
    lon: number;
    timestamp: Date;
    elevation?: number;
    heartRate?: number;
    cadence?: number;
  }>;
  laps?: ParsedLapData[];
}

@Injectable()
export class FitParserService {
  async parse(buffer: Buffer): Promise<ParsedWorkoutData> {
    // Validate FIT file header (first 12 bytes)
    if (buffer.length < 12) {
      throw new Error("Invalid FIT file: too short");
    }
    const headerSize = buffer[0];
    if (headerSize !== 12 && headerSize !== 14) {
      throw new Error("Invalid FIT file: bad header size");
    }

    try {
      const fitData = await this.parseFitBuffer(buffer);

      // Extract session data
      if (!fitData.sessions || fitData.sessions.length === 0) {
        throw new Error("No session data found in FIT file");
      }

      const session = fitData.sessions[0];

      // Calculate avgPace in seconds per km
      const distanceInKm = session.total_distance / 1000;
      const avgPace = session.total_timer_time / distanceInKm;

      // Extract GPS track with per-point metrics if available
      let gpsTrack: ParsedWorkoutData["gpsTrack"];
      if (fitData.records && fitData.records.length > 0) {
        const tracks = fitData.records
          .filter((record: any) => record.position_lat != null && record.position_long != null)
          .map((record: any) => ({
            lat: this.semicirclesToDegrees(record.position_lat),
            lon: this.semicirclesToDegrees(record.position_long),
            timestamp: record.timestamp,
            elevation: record.altitude ?? record.enhanced_altitude,
            heartRate: record.heart_rate,
            cadence: record.cadence,
          }));

        if (tracks.length > 0) {
          gpsTrack = tracks;
        }
      }

      // Extract lap data
      let laps: ParsedLapData[] | undefined;
      if (fitData.laps && fitData.laps.length > 0) {
        laps = fitData.laps.map((lap: any, index: number) => {
          const lapDistance = lap.total_distance ?? 0;
          const lapDuration = lap.total_timer_time ?? lap.total_elapsed_time ?? 0;
          const lapDistanceKm = lapDistance / 1000;
          const lapAvgPace = lapDistanceKm > 0 ? lapDuration / lapDistanceKm : 0;

          return {
            lapNumber: index + 1,
            startTime: lap.start_time ?? lap.timestamp,
            distance: lapDistance,
            duration: lapDuration,
            avgPace: lapAvgPace,
            avgHeartRate: lap.avg_heart_rate,
            maxHeartRate: lap.max_heart_rate,
            avgCadence: lap.avg_cadence,
            calories: lap.total_calories,
          };
        });
      }

      return {
        distance: session.total_distance,
        duration: session.total_timer_time,
        startTime: session.start_time,
        endTime: session.timestamp,
        avgPace,
        avgHeartRate: session.avg_heart_rate,
        maxHeartRate: session.max_heart_rate,
        calories: session.total_calories,
        elevationGain: session.total_ascent,
        avgCadence: session.avg_cadence,
        maxCadence: session.max_cadence,
        gpsTrack,
        laps,
      };
    } catch (error) {
      if (error instanceof Error && error.message === "No session data found in FIT file") {
        throw error;
      }
      throw new Error(`Failed to parse FIT file: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private async parseFitBuffer(buffer: Buffer): Promise<any> {
    // Dynamic import because fit-file-parser is CommonJS
    const FitParser = (await import("fit-file-parser")).default;
    const parser = new FitParser({
      force: true,
      speedUnit: "m/s",
      lengthUnit: "m",
      temperatureUnit: "celsius",
      elapsedRecordField: true,
      mode: "both",
    });

    return new Promise((resolve, reject) => {
      // fit-file-parser expects ArrayBuffer, convert Buffer to ArrayBuffer
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
      parser.parse(arrayBuffer as ArrayBuffer, (error: string | undefined, data: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  private semicirclesToDegrees(semicircles: number): number {
    // FIT files store coordinates in semicircles (2^31 semicircles = 180 degrees)
    return semicircles * (180 / Math.pow(2, 31));
  }
}
