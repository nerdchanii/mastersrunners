---
doc_state: current
owner: frontend
last_verified: 2026-04-03
sources:
  - apps/web/src/pages/posts/[id]/index.tsx
  - apps/web/src/pages/workouts/index.tsx
  - apps/web/src/pages/workouts/new/index.tsx
  - apps/web/src/pages/workouts/new/use-workout-entry.ts
  - apps/web/src/pages/workouts/detail/index.tsx
  - apps/web/src/pages/workouts/[id]/edit/index.tsx
  - apps/web/src/hooks/useWorkouts.ts
  - apps/web/src/hooks/useMessages.ts
---

# Workout Experience

## Summary

Workout UX centers on authenticated capture, review, and reuse of workout records. The creation flow supports both manual entry and FIT/GPX upload, and workouts can later be attached to posts or linked to event results. The current attachment/detail batch is summary-first: it deep-links into `/workouts/:id` and only relies on workout type, distance, duration, average pace, and workout date.

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
- attached workouts on post detail now live inside the same divided document flow as the post body and comment thread, and each row deep-links back to `/workouts/:id` with a safe summary block
- event result linking is handled from the event detail page rather than from workout detail
- the current `/workouts/:id` route stays summary-first for this batch and does not ship route maps, elevation charts, lap tables, or similar file-derived panels

## Visibility and Metadata

Current workout records expose:

- visibility (`PRIVATE`, `FOLLOWERS`, `PUBLIC`)
- memo
- photos
- parsed route and lap metrics may still exist in storage, but they are not part of the current workout-detail UI promise
- optional shoe association at the data-model level

## Current Constraints

- route pages still own a fair amount of orchestration instead of delegating fully to a hook/view-model layer
- shoe selection and shoe review UX are not a first-class standalone surface yet even though workout records can point to a shoe
- event linking is a neighboring workflow, not an integrated step in workout creation
- v1 workout attachments and workout detail intentionally do not promise route maps, elevation charts, lap tables, or other file-derived visuals until a later data-availability checkpoint
- post video is out of scope for this batch and should stay out of the workout attachment story
