import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable } from "@nestjs/common";

import { resolveR2Endpoint } from "./r2-runtime.js";
import type {
  DownloadResult,
  StorageAdapter,
  UploadUrlResult,
} from "./storage-adapter.interface.js";

@Injectable()
export class R2StorageAdapter implements StorageAdapter {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor() {
    this.bucket = process.env.R2_BUCKET || process.env.R2_BUCKET_NAME || "masters-runners";
    this.publicUrl = (process.env.R2_PUBLIC_URL || process.env.R2_PUBLIC_BASE_URL || "").replace(
      /\/$/,
      "",
    );
    this.s3 = new S3Client({
      region: "auto",
      endpoint: resolveR2Endpoint(process.env),
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
    });
  }

  async getUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<UploadUrlResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn });
    return {
      uploadUrl,
      key,
      publicUrl: this.getPublicUrl(key),
    };
  }

  async getDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  getPublicUrl(key: string): string {
    if (!this.publicUrl) return key;
    return `${this.publicUrl}/${key}`;
  }

  async downloadFile(key: string): Promise<DownloadResult> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    const response = await this.s3.send(command);
    const bytes = await response.Body!.transformToByteArray();
    return {
      buffer: Buffer.from(bytes),
      size: response.ContentLength || bytes.length,
    };
  }

  async saveFile(
    key: string,
    buffer: Buffer,
    contentType = "application/octet-stream",
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });
    await this.s3.send(command);
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await this.s3.send(command);
  }
}
