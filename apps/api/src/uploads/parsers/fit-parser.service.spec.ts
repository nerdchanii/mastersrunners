import { Test, TestingModule } from "@nestjs/testing";
import { FitParserService } from "./fit-parser.service.js";

describe("FitParserService", () => {
  let service: FitParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FitParserService],
    }).compile();

    service = module.get<FitParserService>(FitParserService);
  });

  describe("parse", () => {
    it("should throw on too-short buffer", async () => {
      const shortBuffer = Buffer.from([0x00, 0x01, 0x02]);

      await expect(service.parse(shortBuffer)).rejects.toThrow(
        "Invalid FIT file: too short"
      );
    });

    it("should throw on invalid header size", async () => {
      // Create buffer with invalid header size (not 12 or 14)
      const invalidBuffer = Buffer.alloc(20);
      invalidBuffer[0] = 16; // Invalid header size

      await expect(service.parse(invalidBuffer)).rejects.toThrow(
        "Invalid FIT file: bad header size"
      );
    });

    it("should parse a valid FIT file with session data", async () => {
      // Create a minimal valid FIT buffer (will be mocked)
      const fitBuffer = Buffer.alloc(100);
      fitBuffer[0] = 12; // Valid header size

      // Mock the fit-file-parser to return session data
      jest
        .spyOn(service as any, "parseFitBuffer")
        .mockResolvedValueOnce({
          sessions: [
            {
              total_distance: 5000, // meters
              total_timer_time: 1500, // seconds
              start_time: new Date("2026-02-16T10:00:00Z"),
              timestamp: new Date("2026-02-16T10:25:00Z"),
              avg_heart_rate: 150,
              max_heart_rate: 180,
              total_calories: 300,
              total_ascent: 50,
              avg_cadence: 85,
              max_cadence: 95,
            },
          ],
          records: [],
        });

      const result = await service.parse(fitBuffer);

      expect(result).toEqual({
        distance: 5000,
        duration: 1500,
        startTime: new Date("2026-02-16T10:00:00Z"),
        endTime: new Date("2026-02-16T10:25:00Z"),
        avgPace: 300, // 1500 / 5 = 300 seconds per km
        avgHeartRate: 150,
        maxHeartRate: 180,
        calories: 300,
        elevationGain: 50,
        avgCadence: 85,
        maxCadence: 95,
        gpsTrack: undefined,
      });
    });

    it("should parse FIT file with GPS track data", async () => {
      const fitBuffer = Buffer.alloc(100);
      fitBuffer[0] = 12;

      jest
        .spyOn(service as any, "parseFitBuffer")
        .mockResolvedValueOnce({
          sessions: [
            {
              total_distance: 1000,
              total_timer_time: 300,
              start_time: new Date("2026-02-16T10:00:00Z"),
              timestamp: new Date("2026-02-16T10:05:00Z"),
            },
          ],
          records: [
            {
              position_lat: 376739502, // semicircles
              position_long: 1268315888, // semicircles
              timestamp: new Date("2026-02-16T10:00:00Z"),
            },
            {
              position_lat: 376740000,
              position_long: 1268316000,
              timestamp: new Date("2026-02-16T10:01:00Z"),
            },
          ],
        });

      const result = await service.parse(fitBuffer);

      expect(result.gpsTrack).toBeDefined();
      expect(result.gpsTrack).toHaveLength(2);
      expect(result.gpsTrack![0]).toMatchObject({
        lat: expect.any(Number),
        lon: expect.any(Number),
        timestamp: new Date("2026-02-16T10:00:00Z"),
      });
    });

    it("should handle FIT file with no GPS data", async () => {
      const fitBuffer = Buffer.alloc(100);
      fitBuffer[0] = 12;

      jest
        .spyOn(service as any, "parseFitBuffer")
        .mockResolvedValueOnce({
          sessions: [
            {
              total_distance: 5000,
              total_timer_time: 1500,
              start_time: new Date("2026-02-16T10:00:00Z"),
              timestamp: new Date("2026-02-16T10:25:00Z"),
            },
          ],
          records: [], // No GPS records
        });

      const result = await service.parse(fitBuffer);

      expect(result.gpsTrack).toBeUndefined();
      expect(result.distance).toBe(5000);
      expect(result.duration).toBe(1500);
    });

    it("should handle FIT file with missing optional fields", async () => {
      const fitBuffer = Buffer.alloc(100);
      fitBuffer[0] = 12;

      jest
        .spyOn(service as any, "parseFitBuffer")
        .mockResolvedValueOnce({
          sessions: [
            {
              total_distance: 3000,
              total_timer_time: 900,
              start_time: new Date("2026-02-16T10:00:00Z"),
              timestamp: new Date("2026-02-16T10:15:00Z"),
              // No heart rate, calories, elevation, or cadence
            },
          ],
          records: [],
        });

      const result = await service.parse(fitBuffer);

      expect(result.avgHeartRate).toBeUndefined();
      expect(result.maxHeartRate).toBeUndefined();
      expect(result.calories).toBeUndefined();
      expect(result.elevationGain).toBeUndefined();
      expect(result.avgCadence).toBeUndefined();
      expect(result.maxCadence).toBeUndefined();
    });

    it("should throw error when no session data in FIT file", async () => {
      const fitBuffer = Buffer.alloc(100);
      fitBuffer[0] = 12;

      jest
        .spyOn(service as any, "parseFitBuffer")
        .mockResolvedValueOnce({
          sessions: [], // No sessions
          records: [],
        });

      await expect(service.parse(fitBuffer)).rejects.toThrow(
        "No session data found in FIT file"
      );
    });

    it("should throw error when parsing fails", async () => {
      const fitBuffer = Buffer.alloc(100);
      fitBuffer[0] = 12;

      jest
        .spyOn(service as any, "parseFitBuffer")
        .mockRejectedValueOnce(new Error("Invalid FIT format"));

      await expect(service.parse(fitBuffer)).rejects.toThrow(
        "Failed to parse FIT file: Invalid FIT format"
      );
    });

    it("should calculate avgPace correctly from distance and duration", async () => {
      const fitBuffer = Buffer.alloc(100);
      fitBuffer[0] = 12;

      jest
        .spyOn(service as any, "parseFitBuffer")
        .mockResolvedValueOnce({
          sessions: [
            {
              total_distance: 10000, // 10 km
              total_timer_time: 3000, // 50 minutes
              start_time: new Date("2026-02-16T10:00:00Z"),
              timestamp: new Date("2026-02-16T10:50:00Z"),
            },
          ],
          records: [],
        });

      const result = await service.parse(fitBuffer);

      // 3000 seconds / 10 km = 300 seconds per km = 5:00 min/km
      expect(result.avgPace).toBe(300);
    });
  });
});
