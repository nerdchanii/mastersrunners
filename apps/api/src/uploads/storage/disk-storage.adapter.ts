import { Injectable } from "@nestjs/common";
import { promises as fs } from "node:fs";
import { join, dirname } from "node:path";
import type { StorageAdapter, UploadUrlResult, DownloadResult } from "./storage-adapter.interface.js";

@Injectable()
export class DiskStorageAdapter implements StorageAdapter {
  readonly storageDir: string;
  private readonly baseUrl: string;

  constructor() {
    this.storageDir = process.env.DISK_STORAGE_DIR || join(process.cwd(), "uploads");
    const port = process.env.API_PORT || "4000";
    this.baseUrl = `http://localhost:${port}/api/v1`;
  }

  async getUploadUrl(key: string, _contentType: string, _expiresIn?: number): Promise<UploadUrlResult> {
    return {
      uploadUrl: `${this.baseUrl}/uploads/disk/${key}`,
      key,
      publicUrl: this.getPublicUrl(key),
    };
  }

  async getDownloadUrl(key: string, _expiresIn?: number): Promise<string> {
    return this.getPublicUrl(key);
  }

  getPublicUrl(key: string): string {
    return `${this.baseUrl}/disk-files/${key}`;
  }

  async downloadFile(key: string): Promise<DownloadResult> {
    const filePath = join(this.storageDir, key);
    const buffer = await fs.readFile(filePath);
    return { buffer, size: buffer.length };
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = join(this.storageDir, key);
    try {
      await fs.unlink(filePath);
    } catch (err: any) {
      if (err.code !== "ENOENT") throw err;
    }
  }

  async saveFile(key: string, buffer: Buffer): Promise<void> {
    const filePath = join(this.storageDir, key);
    await fs.mkdir(dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
  }
}
