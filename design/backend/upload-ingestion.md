---
doc_state: current
owner: backend
last_verified: 2026-04-03
sources:
  - apps/api/src/uploads/uploads.module.ts
  - apps/api/src/uploads/uploads.service.ts
  - apps/api/src/uploads/uploads.controller.ts
  - apps/api/src/uploads/disk-upload.controller.ts
  - apps/api/src/uploads/disk-files.controller.ts
  - apps/api/src/uploads/parsers/fit-parser.service.ts
  - apps/api/src/uploads/parsers/gpx-parser.service.ts
  - apps/api/src/uploads/storage/storage-adapter.interface.ts
  - apps/api/src/uploads/storage/disk-storage.adapter.ts
  - apps/api/src/uploads/storage/r2-storage.adapter.ts
  - apps/web/src/pages/settings/profile/index.tsx
  - apps/web/src/pages/posts/new/index.tsx
---

# Upload and Ingestion

## Summary

Uploads are handled inside the API through a storage-adapter abstraction, with disk fallback in development-oriented paths and R2 support for configured environments.

## Storage Adapter Boundary

- `StorageAdapter` defines signed upload/download URL generation, public URL derivation, file download, and deletion.
- `UploadsModule` chooses either `DiskStorageAdapter` or `R2StorageAdapter` at startup.
- Disk mode is the current default unless production-style R2 configuration is present.
- Production-style R2 configuration uses `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and the derived standard Cloudflare R2 endpoint unless `R2_ENDPOINT` is explicitly overridden.
- Browser direct uploads to R2 also depend on a bucket-side CORS allowlist that includes the active frontend origin; localhost or other extra origins should only be added by explicit decision.
- `/uploads/presign` is the shared public-asset upload boundary used beyond workouts, including profile and post-image flows.
- canonical workout source presign now lives at `POST /workouts/source/presign`.
- `/uploads/presign` still accepts `folder: "workouts"` as a temporary compatibility path for the current web workout upload flow, but that transitional branch does not return `publicUrl`.

## Upload Request Flow

1. Public assets request a signed upload target from `/uploads/presign`; workout source files request one from `POST /workouts/source/presign`.
2. The API validates folder intent and content type based on the selected boundary.
3. Public-asset uploads receive an upload URL, storage key, and public URL; workout source uploads receive only an upload URL and storage key.
4. The client uploads bytes directly to the storage target.
5. Public assets persist the returned public URL. Workout source files are currently treated as transient ingest inputs until private-source retention lands.

In disk mode the app also exposes public `PUT /uploads/disk/*` and `GET /disk-files/*` handlers for local development and production-like verification flows.

## File-Type and Key Rules

- Image uploads accept `image/jpeg`, `image/png`, `image/webp`, and `image/gif`.
- Workout-source uploads additionally accept `application/octet-stream` and XML-based GPX content types for FIT/GPX ingestion.
- Storage keys follow `{folder}/{userId}/{timestamp}-{sanitizedFilename}`.
- Ownership checks rely on the user-specific key path. Downstream code must not invent keys or bypass the adapter-generated format.

## Workout File Ingestion

`UploadsService.parseAndCreateWorkout()` owns the ingestion pipeline:

1. validate supported file type (`FIT` or `GPX`)
2. download the raw file through the selected adapter
3. parse workout metrics and GPS data
4. discard the raw uploaded source after parse succeeds or fails
5. write `Workout` and redacted `WorkoutFile` metadata
6. derive route bounds, encoded polyline, and lap records

GPS routes are downsampled before persistence to control payload size.

Parser normalization details:

- FIT ingestion trusts the coordinate values already normalized by `fit-file-parser` and preserves per-point elevation, heart rate, and cadence when available.
- GPX ingestion prefers native cumulative distance from `<distance>` extensions when present, then falls back to Haversine distance if the file does not expose cumulative distance.
- GPX heart rate and cadence extraction supports both `gpxtpx`-style and `gpxdata`-style extension namespaces used by watch exports.

## Security and Ownership

- Signed upload URLs are time-limited and adapter-controlled.
- The R2 bucket CORS policy must stay aligned with `FRONTEND_URL`; extra browser origins such as localhost should not be allowed by default, and presigned upload preflights will fail when the origin is outside the bucket allowlist.
- Delete operations validate that the acting user owns the storage key path.
- Public URL generation stays behind the adapter boundary for public assets only; workout source ingestion must not rely on a persistent public URL.
- File-type restrictions exist to keep the shared upload boundary from becoming a generic arbitrary-file ingress path.

## Current Constraints

- The upload boundary is shared, but the parse-and-create ingestion pipeline is still workout-specific rather than a generic asset-processing platform.
- Public URL generation happens inside the adapter boundary, so downstream services should not build storage URLs manually.

## Current Non-Goals

- Post video upload is explicitly out of scope for the current web composer surface.
- The current upload boundary should not imply support for video encoding, thumbnail extraction, streaming delivery, or moderation workflows.
- Until a separate task defines video ingestion, playback, and lifecycle policy, the post composer should continue to promise image uploads only.
- Workout detail may now consume the persisted route, lap, elevation, heart-rate, and cadence data that the ingestion pipeline already stores.
- The current boundary still stops short of secondary media derivatives such as file-info-centric UI, offline map snapshots, video-like route playback exports, or trend analytics that aggregate across multiple workouts.
