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

    it("should throw not implemented error for valid header", async () => {
      // Create buffer with valid header size (12)
      const validBuffer = Buffer.alloc(20);
      validBuffer[0] = 12; // Valid header size

      await expect(service.parse(validBuffer)).rejects.toThrow(
        "FIT parsing not yet implemented - use GPX for now"
      );
    });

    it("should accept header size of 14", async () => {
      // Create buffer with valid header size (14)
      const validBuffer = Buffer.alloc(20);
      validBuffer[0] = 14; // Valid header size

      await expect(service.parse(validBuffer)).rejects.toThrow(
        "FIT parsing not yet implemented - use GPX for now"
      );
    });
  });
});
