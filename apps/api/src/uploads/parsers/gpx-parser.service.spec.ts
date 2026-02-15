import { Test, TestingModule } from "@nestjs/testing";
import { GpxParserService } from "./gpx-parser.service.js";

describe("GpxParserService", () => {
  let service: GpxParserService;

  const sampleGpxXml = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TestApp">
  <trk>
    <name>Morning Run</name>
    <trkseg>
      <trkpt lat="37.7749" lon="-122.4194">
        <time>2026-02-16T10:00:00Z</time>
      </trkpt>
      <trkpt lat="37.7750" lon="-122.4195">
        <time>2026-02-16T10:00:05Z</time>
      </trkpt>
      <trkpt lat="37.7751" lon="-122.4196">
        <time>2026-02-16T10:00:10Z</time>
      </trkpt>
      <trkpt lat="37.7752" lon="-122.4197">
        <time>2026-02-16T10:00:15Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GpxParserService],
    }).compile();

    service = module.get<GpxParserService>(GpxParserService);
  });

  describe("parse", () => {
    it("should extract distance, duration, pace from track points", async () => {
      const result = await service.parse(sampleGpxXml);

      expect(result.startTime).toEqual(new Date("2026-02-16T10:00:00Z"));
      expect(result.endTime).toEqual(new Date("2026-02-16T10:00:15Z"));
      expect(result.duration).toBe(15); // 15 seconds
      expect(result.distance).toBeGreaterThan(0); // Should have calculated distance
      expect(result.avgPace).toBeGreaterThan(0); // Should have calculated pace
      expect(result.gpsTrack).toHaveLength(4);
      expect(result.gpsTrack?.[0]).toEqual({
        lat: 37.7749,
        lon: -122.4194,
        timestamp: new Date("2026-02-16T10:00:00Z"),
      });
    });

    it("should throw on insufficient track points", async () => {
      const insufficientGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TestApp">
  <trk>
    <trkseg>
      <trkpt lat="37.7749" lon="-122.4194">
        <time>2026-02-16T10:00:00Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

      await expect(service.parse(insufficientGpx)).rejects.toThrow(
        "GPX file has insufficient track points"
      );
    });

    it("should throw on empty track", async () => {
      const emptyGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TestApp">
  <trk>
    <trkseg>
    </trkseg>
  </trk>
</gpx>`;

      await expect(service.parse(emptyGpx)).rejects.toThrow(
        "GPX file has insufficient track points"
      );
    });

    it("should calculate distance correctly for known coordinates", async () => {
      // Create GPX with two points 1km apart (approximately)
      // Using coordinates roughly 1km apart in latitude
      const oneKmGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TestApp">
  <trk>
    <trkseg>
      <trkpt lat="37.7749" lon="-122.4194">
        <time>2026-02-16T10:00:00Z</time>
      </trkpt>
      <trkpt lat="37.7839" lon="-122.4194">
        <time>2026-02-16T10:05:00Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

      const result = await service.parse(oneKmGpx);

      // Approximately 1km (1000m) - allow some margin for calculation
      expect(result.distance).toBeGreaterThan(900);
      expect(result.distance).toBeLessThan(1100);
      expect(result.duration).toBe(300); // 5 minutes
    });

    it("should parse track points with different attribute orders", async () => {
      const differentOrderGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TestApp">
  <trk>
    <trkseg>
      <trkpt lon="-122.4194" lat="37.7749">
        <time>2026-02-16T10:00:00Z</time>
      </trkpt>
      <trkpt lat="37.7750" lon="-122.4195">
        <time>2026-02-16T10:00:05Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

      const result = await service.parse(differentOrderGpx);

      expect(result.gpsTrack).toHaveLength(2);
      expect(result.gpsTrack?.[0]).toEqual({
        lat: 37.7749,
        lon: -122.4194,
        timestamp: new Date("2026-02-16T10:00:00Z"),
      });
    });
  });
});
