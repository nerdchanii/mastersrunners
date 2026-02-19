import { Controller, Put, Req, Inject, BadRequestException } from "@nestjs/common";
import type { Request } from "express";
import { Public } from "../common/decorators/public.decorator.js";
import { DiskStorageAdapter } from "./storage/disk-storage.adapter.js";
import { STORAGE_ADAPTER } from "./storage/storage-adapter.interface.js";

const ROUTE_PREFIX = "/uploads/disk/";

@Controller("uploads/disk")
export class DiskUploadController {
  constructor(
    @Inject(STORAGE_ADAPTER) private readonly storage: DiskStorageAdapter,
  ) {}

  @Public()
  @Put("*key")
  async upload(@Req() req: Request) {
    const key = extractKey(req.url, ROUTE_PREFIX);
    if (!req.body) {
      throw new BadRequestException("No file data received. Check Content-Type header.");
    }
    const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
    await this.storage.saveFile(key, buffer);
    return { success: true, key };
  }
}

function extractKey(url: string, prefix: string): string {
  const idx = url.indexOf(prefix);
  return decodeURIComponent(url.substring(idx + prefix.length));
}
