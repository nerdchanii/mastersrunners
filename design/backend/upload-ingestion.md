---
doc_state: current
owner: backend
last_verified: 2026-03-12
sources:
  - apps/api/src/uploads/uploads.module.ts
  - apps/api/src/uploads/uploads.service.ts
  - apps/api/src/uploads/uploads.controller.ts
  - apps/api/src/uploads/disk-upload.controller.ts
  - apps/api/src/uploads/disk-files.controller.ts
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
- `/uploads/presign` is a shared upload boundary used beyond workouts, including profile and post-image flows.

## Workout File Ingestion

`UploadsService.parseAndCreateWorkout()` owns the ingestion pipeline:

1. validate supported file type (`FIT` or `GPX`)
2. download the raw file through the selected adapter
3. parse workout metrics and GPS data
4. write `Workout` and `WorkoutFile`
5. derive route bounds, encoded polyline, and lap records

GPS routes are downsampled before persistence to control payload size.

## Current Constraints

- The upload boundary is shared, but the parse-and-create ingestion pipeline is still workout-specific rather than a generic asset-processing platform.
- In disk mode the app exposes public `PUT /uploads/disk/*` and `GET /disk-files/*` handlers for local file writing and serving.
- Public URL generation happens inside the adapter boundary, so downstream services should not build storage URLs manually.
