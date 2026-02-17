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
        laps: undefined,
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

    it("should parse lap data from FIT file", async () => {
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
          records: [],
          laps: [
            {
              start_time: new Date("2026-02-16T10:00:00Z"),
              timestamp: new Date("2026-02-16T10:05:00Z"),
              total_distance: 1000,
              total_timer_time: 300,
              avg_heart_rate: 145,
              max_heart_rate: 160,
              avg_cadence: 82,
              total_calories: 60,
            },
            {
              start_time: new Date("2026-02-16T10:05:00Z"),
              timestamp: new Date("2026-02-16T10:10:00Z"),
              total_distance: 1000,
              total_timer_time: 290,
              avg_heart_rate: 155,
              max_heart_rate: 170,
              avg_cadence: 85,
              total_calories: 65,
            },
            {
              start_time: new Date("2026-02-16T10:10:00Z"),
              timestamp: new Date("2026-02-16T10:15:00Z"),
              total_distance: 1000,
              total_timer_time: 310,
              avg_heart_rate: 150,
              max_heart_rate: 165,
              avg_cadence: 80,
              total_calories: 62,
            },
          ],
        });

      const result = await service.parse(fitBuffer);

      expect(result.laps).toBeDefined();
      expect(result.laps).toHaveLength(3);

      // First lap
      expect(result.laps![0]).toEqual({
        lapNumber: 1,
        startTime: new Date("2026-02-16T10:00:00Z"),
        distance: 1000,
        duration: 300,
        avgPace: 300, // 300 / 1 = 300 sec/km
        avgHeartRate: 145,
        maxHeartRate: 160,
        avgCadence: 82,
        calories: 60,
      });

      // Second lap
      expect(result.laps![1]).toEqual({
        lapNumber: 2,
        startTime: new Date("2026-02-16T10:05:00Z"),
        distance: 1000,
        duration: 290,
        avgPace: 290, // 290 / 1 = 290 sec/km
        avgHeartRate: 155,
        maxHeartRate: 170,
        avgCadence: 85,
        calories: 65,
      });
    });

    it("should handle laps with missing optional fields", async () => {
      const fitBuffer = Buffer.alloc(100);
      fitBuffer[0] = 12;

      jest
        .spyOn(service as any, "parseFitBuffer")
        .mockResolvedValueOnce({
          sessions: [
            {
              total_distance: 2000,
              total_timer_time: 600,
              start_time: new Date("2026-02-16T10:00:00Z"),
              timestamp: new Date("2026-02-16T10:10:00Z"),
            },
          ],
          records: [],
          laps: [
            {
              start_time: new Date("2026-02-16T10:00:00Z"),
              total_distance: 1000,
              total_timer_time: 300,
              // no heart_rate, cadence, calories
            },
          ],
        });

      const result = await service.parse(fitBuffer);

      expect(result.laps).toHaveLength(1);
      expect(result.laps![0].avgHeartRate).toBeUndefined();
      expect(result.laps![0].maxHeartRate).toBeUndefined();
      expect(result.laps![0].avgCadence).toBeUndefined();
      expect(result.laps![0].calories).toBeUndefined();
    });

    it("should return undefined laps when no lap data exists", async () => {
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
          records: [],
          // no laps field
        });

      const result = await service.parse(fitBuffer);
      expect(result.laps).toBeUndefined();
    });

    it("should extract per-point elevation, heartRate, cadence from records", async () => {
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
              position_lat: 376739502,
              position_long: 1268315888,
              timestamp: new Date("2026-02-16T10:00:00Z"),
              altitude: 52.5,
              heart_rate: 142,
              cadence: 83,
            },
            {
              position_lat: 376740000,
              position_long: 1268316000,
              timestamp: new Date("2026-02-16T10:01:00Z"),
              altitude: 55.2,
              heart_rate: 148,
              cadence: 85,
            },
          ],
        });

      const result = await service.parse(fitBuffer);

      expect(result.gpsTrack).toHaveLength(2);
      expect(result.gpsTrack![0]).toMatchObject({
        lat: expect.any(Number),
        lon: expect.any(Number),
        elevation: 52.5,
        heartRate: 142,
        cadence: 83,
      });
      expect(result.gpsTrack![1]).toMatchObject({
        elevation: 55.2,
        heartRate: 148,
        cadence: 85,
      });
    });

    it("should use enhanced_altitude when altitude is not available", async () => {
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
              position_lat: 376739502,
              position_long: 1268315888,
              timestamp: new Date("2026-02-16T10:00:00Z"),
              enhanced_altitude: 100.3,
              // no altitude field
            },
          ],
        });

      const result = await service.parse(fitBuffer);

      expect(result.gpsTrack![0].elevation).toBe(100.3);
    });

    it("should handle records without per-point metrics", async () => {
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
              position_lat: 376739502,
              position_long: 1268315888,
              timestamp: new Date("2026-02-16T10:00:00Z"),
              // no altitude, heart_rate, cadence
            },
          ],
        });

      const result = await service.parse(fitBuffer);

      expect(result.gpsTrack![0].elevation).toBeUndefined();
      expect(result.gpsTrack![0].heartRate).toBeUndefined();
      expect(result.gpsTrack![0].cadence).toBeUndefined();
    });

    it("should handle lap with zero distance (avgPace = 0)", async () => {
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
          records: [],
          laps: [
            {
              start_time: new Date("2026-02-16T10:00:00Z"),
              total_distance: 0,
              total_timer_time: 10,
            },
          ],
        });

      const result = await service.parse(fitBuffer);

      expect(result.laps![0].avgPace).toBe(0);
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
