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
  gpsTrack?: Array<{ lat: number; lon: number; timestamp: Date }>;
}

@Injectable()
export class FitParserService {
  // For now, stub - full implementation when fit-file-parser package is added
  async parse(buffer: Buffer): Promise<ParsedWorkoutData> {
    // Validate FIT file header (first 12 bytes)
    if (buffer.length < 12) {
      throw new Error("Invalid FIT file: too short");
    }
    const headerSize = buffer[0];
    if (headerSize !== 12 && headerSize !== 14) {
      throw new Error("Invalid FIT file: bad header size");
    }

    // TODO: Implement full FIT parsing with fit-file-parser package
    throw new Error("FIT parsing not yet implemented - use GPX for now");
  }
}
