import { Injectable } from "@nestjs/common";
import sharp from "sharp";

interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

@Injectable()
export class ImageOptimizationService {
  isImageContentType(contentType: string): boolean {
    return contentType.startsWith("image/");
  }

  async resizeAndOptimize(
    buffer: Buffer,
    options: ResizeOptions = {},
  ): Promise<Buffer> {
    const { maxWidth = 1920, maxHeight = 1920, quality = 80 } = options;

    return sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality, progressive: true })
      .toBuffer();
  }

  async convertToWebP(buffer: Buffer, quality = 80): Promise<Buffer> {
    return sharp(buffer)
      .webp({ quality })
      .toBuffer();
  }

  async generateThumbnail(buffer: Buffer, size = 300): Promise<Buffer> {
    return sharp(buffer)
      .resize(size, size, {
        fit: "cover",
        position: "centre",
      })
      .jpeg({ quality: 75 })
      .toBuffer();
  }
}
