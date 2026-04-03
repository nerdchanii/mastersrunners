---
doc_state: current
owner: frontend
last_verified: 2026-04-03
sources:
  - apps/web/src/components/workout/WorkoutAnalysisMap.tsx
  - apps/web/src/components/workout/WorkoutAnalysisCharts.tsx
  - apps/web/src/components/workout/WorkoutAttachmentPreview.tsx
  - apps/web/src/pages/posts/[id]/index.tsx
  - apps/web/src/pages/workouts/index.tsx
  - apps/web/src/pages/workouts/new/index.tsx
  - apps/web/src/pages/workouts/new/use-workout-entry.ts
  - apps/web/src/pages/workouts/detail/index.tsx
  - apps/web/src/pages/workouts/[id]/edit/index.tsx
  - apps/web/src/hooks/useWorkouts.ts
  - apps/web/src/lib/workout-analysis.ts
  - apps/web/src/hooks/useMessages.ts
---

# Workout Experience

## Summary

Workout UX centers on authenticated capture, review, and reuse of workout records. The creation flow supports both manual entry and FIT/GPX upload, and workouts can later be attached to posts or linked to event results. The current detail route is now analysis-first: it leads with a large route map when GPS exists, then layers distance/time/pace summary, route-linked charts, and lap review below.

## Route Model

- `/workouts` lists the authenticated user's workout history
- `/workouts/new` creates a workout
- `/workouts/:id` shows workout detail
- `/workouts/:id/edit` edits an existing workout

All workout routes are protected.

## Creation Flow

`/workouts/new` is a dual-mode entry experience:

- `file` mode uploads FIT or GPX files, parses them, and previews normalized metrics
- `manual` mode captures distance, duration, date, memo, and visibility directly
- manual distance input is collected in kilometers for the UI, then normalized to meters before the API request is sent

The page state is orchestrated by `useWorkoutEntry`, which owns:

- drag-and-drop file state
- parse/upload progress
- metric normalization
- visibility choice
- form submission and cancellation

## Data and Reuse Model

- workout type options are fetched from `/workout-types`
- the post composer reuses existing workouts via `useWorkouts`
- post detail keeps post-owned image media visible above attached workouts so feed-to-detail navigation does not drop the primary post content
- attached workouts on post detail now render as richer previews with route thumbnails and analysis-oriented summary chips before they deep-link back to `/workouts/:id`
- anonymous visitors can still see those attached-workout previews on public post detail, but clicking the preview should open an auth dialog in place instead of redirecting the current post page away to `/login`
- event result linking is handled from the event detail page rather than from workout detail
- the current `/workouts/:id` route uses persisted route, lap, and point-level sensor data to render a map-first report with linked elevation, heart-rate, and cadence charts when those series exist
- chart scrubbing and lap selection both share one route-selection model so the detail surface can grow into deeper analytics work later

## Visibility and Metadata

Current workout records expose:

- visibility (`PRIVATE`, `FOLLOWERS`, `PUBLIC`)
- memo
- photos
- parsed route and lap metrics are now part of the workout-detail UI promise when the underlying workout record has them
- optional shoe association at the data-model level

## Current Constraints

- route pages still own a fair amount of orchestration instead of delegating fully to a hook/view-model layer
- shoe selection and shoe review UX are not a first-class standalone surface yet even though workout records can point to a shoe
- event linking is a neighboring workflow, not an integrated step in workout creation
- workouts without GPS or sensor series intentionally degrade by partial rendering instead of switching to a separate detail layout
- the current workout-detail report still stops short of long-horizon analytics such as trend comparison, effort scoring, or historical overlays
- post video is out of scope for this batch and should stay out of the workout attachment story
