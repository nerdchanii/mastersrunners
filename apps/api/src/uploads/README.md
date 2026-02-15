# Uploads Module

This module handles file uploads to Cloudflare R2 (S3-compatible storage) using presigned URLs.

## Features

- **Presigned URL Generation**: Generate secure, time-limited upload URLs
- **File Type Validation**: Restrict uploads to allowed image and file types
- **User Ownership**: Ensure users can only delete their own files
- **GPX Parsing**: Parse GPX files to extract workout data (distance, duration, pace, GPS track)
- **FIT Parsing**: Stub implementation for future FIT file support

## Installation

Before using this module, install the AWS SDK packages:

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Environment Variables

Required environment variables:

```env
R2_BUCKET=masters-runners
R2_PUBLIC_URL=https://cdn.example.com
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
```

## Usage

### Upload Flow

1. **Client requests presigned URL**:
   ```
   POST /api/v1/uploads/presign
   {
     "filename": "photo.jpg",
     "contentType": "image/jpeg",
     "folder": "images"  // optional, defaults to "images"
   }
   ```

2. **Server responds with presigned URL**:
   ```json
   {
     "uploadUrl": "https://...",
     "key": "images/user123/1234567890-photo.jpg",
     "publicUrl": "https://cdn.example.com/images/user123/1234567890-photo.jpg"
   }
   ```

3. **Client uploads directly to R2** using the presigned URL (PUT request with file binary)

4. **Client saves the `key` and `publicUrl`** in their database (e.g., Post.imageUrls array)

### Delete File

```
DELETE /api/v1/uploads/:key
```

Only the file owner (verified by userId in the key path) can delete the file.

## File Structure

```
uploads/
├── README.md
├── uploads.module.ts          # NestJS module registration
├── uploads.service.ts         # S3 presigned URL service
├── uploads.service.spec.ts    # Tests (requires AWS SDK)
├── uploads.controller.ts      # Upload endpoints
└── parsers/
    ├── fit-parser.service.ts       # FIT file parser (stub)
    ├── fit-parser.service.spec.ts  # FIT parser tests
    ├── gpx-parser.service.ts       # GPX file parser
    └── gpx-parser.service.spec.ts  # GPX parser tests
```

## Allowed File Types

### Images (folder: "images")
- image/jpeg
- image/png
- image/webp
- image/gif

### Files (folder: "files")
- All image types above
- application/octet-stream (for FIT/GPX files)

## Key Format

Files are stored with the following key format:

```
{folder}/{userId}/{timestamp}-{sanitizedFilename}
```

Example: `images/user123/1708080000000-my-photo.jpg`

Special characters in filenames are replaced with underscores (except dots, dashes, and underscores).

## Testing

Run tests:

```bash
# All uploads tests
pnpm test uploads

# Individual test files
pnpm test uploads.service.spec.ts
pnpm test fit-parser.service.spec.ts
pnpm test gpx-parser.service.spec.ts
```

**Note**: `uploads.service.spec.ts` requires AWS SDK packages to be installed. Until then, only basic unit tests run.

## GPX Parser

The GPX parser extracts workout data from GPX XML files:

```typescript
const result = await gpxParserService.parse(gpxXmlString);
// {
//   distance: 5000,        // meters
//   duration: 1200,        // seconds
//   startTime: Date,
//   endTime: Date,
//   avgPace: 240,          // seconds per km
//   gpsTrack: [{ lat, lon, timestamp }, ...]
// }
```

### GPX Format

The parser expects standard GPX 1.1 format:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1">
  <trk>
    <trkseg>
      <trkpt lat="37.7749" lon="-122.4194">
        <time>2026-02-16T10:00:00Z</time>
      </trkpt>
      <!-- more trackpoints -->
    </trkseg>
  </trk>
</gpx>
```

## FIT Parser

The FIT parser is currently a stub. It validates FIT file headers but throws an error indicating full parsing is not yet implemented.

To enable FIT parsing, install a FIT parser package and implement the `parse()` method in `parsers/fit-parser.service.ts`.

## Security

- Presigned URLs expire after 1 hour by default (configurable)
- Users can only delete files they own (enforced by key validation)
- File type restrictions prevent uploading executable or malicious files
- No server-side file storage (files go directly to R2)

## Integration

To use this module in other modules:

```typescript
import { UploadsModule } from '../uploads/uploads.module.js';

@Module({
  imports: [UploadsModule],
  // ...
})
export class MyModule {}
```

Then inject services:

```typescript
import { UploadsService } from '../uploads/uploads.service.js';
import { GpxParserService } from '../uploads/parsers/gpx-parser.service.js';

@Injectable()
export class MyService {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly gpxParser: GpxParserService,
  ) {}
}
```
