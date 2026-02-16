import { Injectable } from "@nestjs/common";

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
  gpsTrack?: Array<{ lat: number; lon: number; timestamp: Date }>;
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

      // Extract GPS track if available
      let gpsTrack: Array<{ lat: number; lon: number; timestamp: Date }> | undefined;
      if (fitData.records && fitData.records.length > 0) {
        const tracks = fitData.records
          .filter((record: any) => record.position_lat != null && record.position_long != null)
          .map((record: any) => ({
            lat: this.semicirclesToDegrees(record.position_lat),
            lon: this.semicirclesToDegrees(record.position_long),
            timestamp: record.timestamp,
          }));

        if (tracks.length > 0) {
          gpsTrack = tracks;
        }
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
