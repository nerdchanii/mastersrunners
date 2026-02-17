import { promises as fs } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { DiskStorageAdapter } from "./disk-storage.adapter.js";

describe("DiskStorageAdapter", () => {
  let adapter: DiskStorageAdapter;
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `disk-storage-test-${Date.now()}`);
    process.env.DISK_STORAGE_DIR = testDir;
    process.env.API_PORT = "4000";

    adapter = new DiskStorageAdapter();
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
    delete process.env.DISK_STORAGE_DIR;
  });

  describe("getUploadUrl", () => {
    it("should return local upload URL", async () => {
      const result = await adapter.getUploadUrl("images/user1/photo.jpg", "image/jpeg");

      expect(result.uploadUrl).toBe("http://localhost:4000/api/v1/uploads/disk/images/user1/photo.jpg");
      expect(result.key).toBe("images/user1/photo.jpg");
      expect(result.publicUrl).toBe("http://localhost:4000/api/v1/disk-files/images/user1/photo.jpg");
    });
  });

  describe("getDownloadUrl", () => {
    it("should return public URL", async () => {
      const result = await adapter.getDownloadUrl("files/test.fit");

      expect(result).toBe("http://localhost:4000/api/v1/disk-files/files/test.fit");
    });
  });

  describe("getPublicUrl", () => {
    it("should return disk-files URL", () => {
      const result = adapter.getPublicUrl("images/user1/photo.jpg");

      expect(result).toBe("http://localhost:4000/api/v1/disk-files/images/user1/photo.jpg");
    });
  });

  describe("saveFile + downloadFile", () => {
    it("should save and read back a file", async () => {
      const content = Buffer.from("hello world");
      await adapter.saveFile("test/file.txt", content);

      const result = await adapter.downloadFile("test/file.txt");

      expect(result.buffer.toString()).toBe("hello world");
      expect(result.size).toBe(11);
    });

    it("should create nested directories automatically", async () => {
      const content = Buffer.from("nested");
      await adapter.saveFile("a/b/c/deep.txt", content);

      const result = await adapter.downloadFile("a/b/c/deep.txt");
      expect(result.buffer.toString()).toBe("nested");
    });
  });

  describe("deleteFile", () => {
    it("should delete an existing file", async () => {
      await adapter.saveFile("to-delete.txt", Buffer.from("bye"));
      await adapter.deleteFile("to-delete.txt");

      await expect(adapter.downloadFile("to-delete.txt")).rejects.toThrow();
    });

    it("should not throw when deleting a non-existent file", async () => {
      await expect(adapter.deleteFile("nonexistent.txt")).resolves.not.toThrow();
    });
  });
});
