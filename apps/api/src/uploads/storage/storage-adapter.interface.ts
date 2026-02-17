export interface UploadUrlResult {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export interface DownloadResult {
  buffer: Buffer;
  size: number;
}

export interface StorageAdapter {
  getUploadUrl(key: string, contentType: string, expiresIn?: number): Promise<UploadUrlResult>;
  getDownloadUrl(key: string, expiresIn?: number): Promise<string>;
  getPublicUrl(key: string): string;
  downloadFile(key: string): Promise<DownloadResult>;
  deleteFile(key: string): Promise<void>;
}

export const STORAGE_ADAPTER = Symbol("STORAGE_ADAPTER");
