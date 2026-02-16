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

    it("should parse GPX with elevation data and calculate elevation gain", async () => {
      const elevationGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TestApp">
  <trk>
    <trkseg>
      <trkpt lat="37.7749" lon="-122.4194">
        <ele>100.0</ele>
        <time>2026-02-16T10:00:00Z</time>
      </trkpt>
      <trkpt lat="37.7750" lon="-122.4195">
        <ele>105.5</ele>
        <time>2026-02-16T10:00:05Z</time>
      </trkpt>
      <trkpt lat="37.7751" lon="-122.4196">
        <ele>103.0</ele>
        <time>2026-02-16T10:00:10Z</time>
      </trkpt>
      <trkpt lat="37.7752" lon="-122.4197">
        <ele>110.0</ele>
        <time>2026-02-16T10:00:15Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

      const result = await service.parse(elevationGpx);

      // Elevation gain: (105.5-100.0) + (110.0-103.0) = 5.5 + 7.0 = 12.5
      // The 103.0 is lower than 105.5, so that segment contributes 0 to gain
      expect(result.elevationGain).toBeCloseTo(12.5, 1);
    });

    it("should parse GPX with heart rate extensions", async () => {
      const hrGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TestApp" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">
  <trk>
    <trkseg>
      <trkpt lat="37.7749" lon="-122.4194">
        <time>2026-02-16T10:00:00Z</time>
        <extensions>
          <gpxtpx:TrackPointExtension>
            <gpxtpx:hr>145</gpxtpx:hr>
          </gpxtpx:TrackPointExtension>
        </extensions>
      </trkpt>
      <trkpt lat="37.7750" lon="-122.4195">
        <time>2026-02-16T10:00:05Z</time>
        <extensions>
          <gpxtpx:TrackPointExtension>
            <gpxtpx:hr>155</gpxtpx:hr>
          </gpxtpx:TrackPointExtension>
        </extensions>
      </trkpt>
      <trkpt lat="37.7751" lon="-122.4196">
        <time>2026-02-16T10:00:10Z</time>
        <extensions>
          <gpxtpx:TrackPointExtension>
            <gpxtpx:hr>150</gpxtpx:hr>
          </gpxtpx:TrackPointExtension>
        </extensions>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

      const result = await service.parse(hrGpx);

      expect(result.avgHeartRate).toBeCloseTo(150, 0); // (145+155+150)/3 = 150
      expect(result.maxHeartRate).toBe(155);
    });

    it("should parse GPX with cadence extensions", async () => {
      const cadenceGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TestApp" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">
  <trk>
    <trkseg>
      <trkpt lat="37.7749" lon="-122.4194">
        <time>2026-02-16T10:00:00Z</time>
        <extensions>
          <gpxtpx:TrackPointExtension>
            <gpxtpx:cad>85</gpxtpx:cad>
          </gpxtpx:TrackPointExtension>
        </extensions>
      </trkpt>
      <trkpt lat="37.7750" lon="-122.4195">
        <time>2026-02-16T10:00:05Z</time>
        <extensions>
          <gpxtpx:TrackPointExtension>
            <gpxtpx:cad>90</gpxtpx:cad>
          </gpxtpx:TrackPointExtension>
        </extensions>
      </trkpt>
      <trkpt lat="37.7751" lon="-122.4196">
        <time>2026-02-16T10:00:10Z</time>
        <extensions>
          <gpxtpx:TrackPointExtension>
            <gpxtpx:cad>88</gpxtpx:cad>
          </gpxtpx:TrackPointExtension>
        </extensions>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

      const result = await service.parse(cadenceGpx);

      expect(result.avgCadence).toBeCloseTo(87.67, 1); // (85+90+88)/3 = 87.67
      expect(result.maxCadence).toBe(90);
    });

    it("should parse GPX with all extensions (elevation, heart rate, cadence)", async () => {
      const fullGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TestApp" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">
  <trk>
    <trkseg>
      <trkpt lat="37.7749" lon="-122.4194">
        <ele>100.0</ele>
        <time>2026-02-16T10:00:00Z</time>
        <extensions>
          <gpxtpx:TrackPointExtension>
            <gpxtpx:hr>145</gpxtpx:hr>
            <gpxtpx:cad>85</gpxtpx:cad>
          </gpxtpx:TrackPointExtension>
        </extensions>
      </trkpt>
      <trkpt lat="37.7750" lon="-122.4195">
        <ele>105.5</ele>
        <time>2026-02-16T10:00:05Z</time>
        <extensions>
          <gpxtpx:TrackPointExtension>
            <gpxtpx:hr>155</gpxtpx:hr>
            <gpxtpx:cad>90</gpxtpx:cad>
          </gpxtpx:TrackPointExtension>
        </extensions>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

      const result = await service.parse(fullGpx);

      expect(result.elevationGain).toBeCloseTo(5.5, 1);
      expect(result.avgHeartRate).toBeCloseTo(150, 0);
      expect(result.maxHeartRate).toBe(155);
      expect(result.avgCadence).toBeCloseTo(87.5, 1);
      expect(result.maxCadence).toBe(90);
    });

    it("should handle GPX without extensions gracefully", async () => {
      const result = await service.parse(sampleGpxXml);

      // Should still work, optional fields undefined
      expect(result.distance).toBeGreaterThan(0);
      expect(result.duration).toBe(15);
      expect(result.elevationGain).toBeUndefined();
      expect(result.avgHeartRate).toBeUndefined();
      expect(result.maxHeartRate).toBeUndefined();
      expect(result.avgCadence).toBeUndefined();
      expect(result.maxCadence).toBeUndefined();
    });

    it("should handle GPX with partial extension data", async () => {
      const partialGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TestApp" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">
  <trk>
    <trkseg>
      <trkpt lat="37.7749" lon="-122.4194">
        <ele>100.0</ele>
        <time>2026-02-16T10:00:00Z</time>
        <extensions>
          <gpxtpx:TrackPointExtension>
            <gpxtpx:hr>145</gpxtpx:hr>
          </gpxtpx:TrackPointExtension>
        </extensions>
      </trkpt>
      <trkpt lat="37.7750" lon="-122.4195">
        <time>2026-02-16T10:00:05Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

      const result = await service.parse(partialGpx);

      // Should calculate from available data only
      expect(result.elevationGain).toBeUndefined(); // Only one elevation point
      expect(result.avgHeartRate).toBe(145); // Only one HR reading
      expect(result.maxHeartRate).toBe(145);
      expect(result.avgCadence).toBeUndefined(); // No cadence data
      expect(result.maxCadence).toBeUndefined();
    });

    it("should calculate elevation gain only from positive changes", async () => {
      const downhillGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TestApp">
  <trk>
    <trkseg>
      <trkpt lat="37.7749" lon="-122.4194">
        <ele>200.0</ele>
        <time>2026-02-16T10:00:00Z</time>
      </trkpt>
      <trkpt lat="37.7750" lon="-122.4195">
        <ele>190.0</ele>
        <time>2026-02-16T10:00:05Z</time>
      </trkpt>
      <trkpt lat="37.7751" lon="-122.4196">
        <ele>180.0</ele>
        <time>2026-02-16T10:00:10Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

      const result = await service.parse(downhillGpx);

      // All downhill, no positive elevation change
      expect(result.elevationGain).toBe(0);
    });
  });
});
