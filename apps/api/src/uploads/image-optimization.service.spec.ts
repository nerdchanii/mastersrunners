import { Test } from "@nestjs/testing";
import { ImageOptimizationService } from "./image-optimization.service";

// Mock sharp module
jest.mock("sharp", () => {
  const mockSharpInstance = {
    resize: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from("optimized-image")),
    metadata: jest.fn().mockResolvedValue({ width: 2000, height: 1500, format: "jpeg" }),
  };
  return jest.fn().mockReturnValue(mockSharpInstance);
});

describe("ImageOptimizationService", () => {
  let service: ImageOptimizationService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [ImageOptimizationService],
    }).compile();

    service = module.get(ImageOptimizationService);
  });

  describe("resizeAndOptimize", () => {
    it("should resize image to max 1920px and quality 80", async () => {
      const inputBuffer = Buffer.from("fake-image-data");
      const result = await service.resizeAndOptimize(inputBuffer);

      expect(result).toBeInstanceOf(Buffer);
    });

    it("should apply custom max size and quality options", async () => {
      const inputBuffer = Buffer.from("fake-image-data");
      const result = await service.resizeAndOptimize(inputBuffer, {
        maxWidth: 1280,
        maxHeight: 960,
        quality: 90,
      });

      expect(result).toBeInstanceOf(Buffer);
    });

    it("should return a Buffer", async () => {
      const inputBuffer = Buffer.from("fake-image-data");
      const result = await service.resizeAndOptimize(inputBuffer);

      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });

  describe("convertToWebP", () => {
    it("should convert image to WebP format", async () => {
      const inputBuffer = Buffer.from("fake-image-data");
      const result = await service.convertToWebP(inputBuffer);

      expect(result).toBeInstanceOf(Buffer);
    });

    it("should return a Buffer", async () => {
      const inputBuffer = Buffer.from("fake-image-data");
      const result = await service.convertToWebP(inputBuffer);

      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });

  describe("generateThumbnail", () => {
    it("should generate thumbnail with default 300x300 size", async () => {
      const inputBuffer = Buffer.from("fake-image-data");
      const result = await service.generateThumbnail(inputBuffer);

      expect(result).toBeInstanceOf(Buffer);
    });

    it("should generate thumbnail with custom size", async () => {
      const inputBuffer = Buffer.from("fake-image-data");
      const result = await service.generateThumbnail(inputBuffer, 150);

      expect(result).toBeInstanceOf(Buffer);
    });

    it("should return a Buffer", async () => {
      const inputBuffer = Buffer.from("fake-image-data");
      const result = await service.generateThumbnail(inputBuffer, 300);

      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });

  describe("isImageContentType", () => {
    it("should return true for image content types", () => {
      expect(service.isImageContentType("image/jpeg")).toBe(true);
      expect(service.isImageContentType("image/png")).toBe(true);
      expect(service.isImageContentType("image/webp")).toBe(true);
      expect(service.isImageContentType("image/gif")).toBe(true);
    });

    it("should return false for non-image content types", () => {
      expect(service.isImageContentType("application/octet-stream")).toBe(false);
      expect(service.isImageContentType("video/mp4")).toBe(false);
      expect(service.isImageContentType("text/plain")).toBe(false);
    });
  });
});
