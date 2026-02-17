import { Controller, Get, Req, Res, NotFoundException, Inject } from "@nestjs/common";
import type { Request, Response } from "express";
import { resolve, join } from "node:path";
import { promises as fs } from "node:fs";
import { lookup } from "mime-types";
import { Public } from "../common/decorators/public.decorator.js";
import { DiskStorageAdapter } from "./storage/disk-storage.adapter.js";
import { STORAGE_ADAPTER } from "./storage/storage-adapter.interface.js";

const ROUTE_PREFIX = "/disk-files/";

@Controller("disk-files")
export class DiskFilesController {
  constructor(
    @Inject(STORAGE_ADAPTER) private readonly storage: DiskStorageAdapter,
  ) {}

  @Public()
  @Get("*key")
  async serve(@Req() req: Request, @Res() res: Response) {
    const key = extractKey(req.url, ROUTE_PREFIX);
    const storageDir = this.storage.storageDir;
    const filePath = resolve(join(storageDir, key));

    // Path traversal prevention
    if (!filePath.startsWith(resolve(storageDir))) {
      throw new NotFoundException();
    }

    try {
      await fs.access(filePath);
    } catch {
      throw new NotFoundException();
    }

    const mimeType = lookup(filePath) || "application/octet-stream";
    res.setHeader("Content-Type", mimeType);
    const buffer = await fs.readFile(filePath);
    res.send(buffer);
  }
}

function extractKey(url: string, prefix: string): string {
  const idx = url.indexOf(prefix);
  return decodeURIComponent(url.substring(idx + prefix.length));
}
