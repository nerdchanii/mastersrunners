import { encodePolyline, decodePolyline } from "./encoded-polyline";

describe("encoded-polyline", () => {
  describe("encodePolyline", () => {
    it("should encode empty array to empty string", () => {
      expect(encodePolyline([])).toBe("");
    });

    it("should encode a single point", () => {
      const points = [{ lat: 37.5665, lng: 126.978 }];
      const encoded = encodePolyline(points);
      expect(typeof encoded).toBe("string");
      expect(encoded.length).toBeGreaterThan(0);
    });

    it("should encode multiple points", () => {
      const points = [
        { lat: 37.5665, lng: 126.978 },
        { lat: 37.567, lng: 126.979 },
        { lat: 37.568, lng: 126.98 },
      ];
      const encoded = encodePolyline(points);
      expect(typeof encoded).toBe("string");
      expect(encoded.length).toBeGreaterThan(0);
    });

    it("should encode known value correctly (Google's example: -179.9832104)", () => {
      // Google's polyline encoding example
      // (38.5, -120.2), (40.7, -120.95), (43.252, -126.453)
      const points = [
        { lat: 38.5, lng: -120.2 },
        { lat: 40.7, lng: -120.95 },
        { lat: 43.252, lng: -126.453 },
      ];
      const encoded = encodePolyline(points);
      expect(encoded).toBe("_p~iF~ps|U_ulLnnqC_mqNvxq`@");
    });
  });

  describe("decodePolyline", () => {
    it("should decode empty string to empty array", () => {
      expect(decodePolyline("")).toEqual([]);
    });

    it("should decode Google's example polyline", () => {
      const encoded = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";
      const points = decodePolyline(encoded);

      expect(points).toHaveLength(3);
      expect(points[0].lat).toBeCloseTo(38.5, 4);
      expect(points[0].lng).toBeCloseTo(-120.2, 4);
      expect(points[1].lat).toBeCloseTo(40.7, 4);
      expect(points[1].lng).toBeCloseTo(-120.95, 4);
      expect(points[2].lat).toBeCloseTo(43.252, 4);
      expect(points[2].lng).toBeCloseTo(-126.453, 4);
    });

    it("should be inverse of encodePolyline", () => {
      const original = [
        { lat: 37.5665, lng: 126.978 },
        { lat: 37.567, lng: 126.979 },
        { lat: 37.568, lng: 126.98 },
      ];
      const encoded = encodePolyline(original);
      const decoded = decodePolyline(encoded);

      expect(decoded).toHaveLength(original.length);
      decoded.forEach((point, i) => {
        expect(point.lat).toBeCloseTo(original[i].lat, 4);
        expect(point.lng).toBeCloseTo(original[i].lng, 4);
      });
    });
  });
});
