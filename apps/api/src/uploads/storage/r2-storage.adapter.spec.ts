import { R2StorageAdapter } from "./r2-storage.adapter.js";

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}));

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn().mockResolvedValue("https://signed-url.example.com"),
}));

describe("R2StorageAdapter", () => {
  let adapter: R2StorageAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.R2_BUCKET = "test-bucket";
    process.env.R2_PUBLIC_URL = "https://cdn.example.com";
    process.env.R2_ENDPOINT = "https://test.r2.cloudflarestorage.com";
    process.env.R2_ACCESS_KEY_ID = "test-key";
    process.env.R2_SECRET_ACCESS_KEY = "test-secret";

    adapter = new R2StorageAdapter();
  });

  describe("getUploadUrl", () => {
    it("should return signed upload URL with public URL", async () => {
      const result = await adapter.getUploadUrl("images/user1/photo.jpg", "image/jpeg");

      expect(result.uploadUrl).toBe("https://signed-url.example.com");
      expect(result.key).toBe("images/user1/photo.jpg");
      expect(result.publicUrl).toBe("https://cdn.example.com/images/user1/photo.jpg");
    });
  });

  describe("getDownloadUrl", () => {
    it("should return signed download URL", async () => {
      const result = await adapter.getDownloadUrl("files/test.fit");

      expect(result).toBe("https://signed-url.example.com");
    });
  });

  describe("getPublicUrl", () => {
    it("should return public URL for key", () => {
      const result = adapter.getPublicUrl("images/user1/photo.jpg");

      expect(result).toBe("https://cdn.example.com/images/user1/photo.jpg");
    });
  });

  describe("downloadFile", () => {
    it("should download file and return buffer with size", async () => {
      const mockBuffer = Buffer.from("file-content");
      (adapter as any).s3.send = jest.fn().mockResolvedValue({
        Body: { transformToByteArray: () => Promise.resolve(new Uint8Array(mockBuffer)) },
        ContentLength: mockBuffer.length,
      });

      const result = await adapter.downloadFile("files/test.fit");

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.size).toBe(mockBuffer.length);
    });
  });

  describe("deleteFile", () => {
    it("should send delete command", async () => {
      (adapter as any).s3.send = jest.fn().mockResolvedValue({});

      await expect(adapter.deleteFile("files/test.fit")).resolves.not.toThrow();
      expect((adapter as any).s3.send).toHaveBeenCalled();
    });
  });
});
