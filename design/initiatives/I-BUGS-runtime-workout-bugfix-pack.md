# I-BUGS: Runtime Workout Bugfix Pack

## Summary

Close a set of user-observed workout data bugs across manual entry and FIT/GPX ingestion without widening scope into new feature work.

## Problem

Recent workout data issues exposed a few correctness bugs in manual entry normalization and parser behavior:

- manual workout submission could send kilometers where the API expects meters
- invalid pace inputs could render broken UI strings
- FIT GPS points could be re-converted after the parser had already normalized them
- GPX files from some watches expose distance, heart rate, and cadence under namespaces the parser did not fully honor

## Goals

- restore canonical workout unit handling in the manual entry flow
- preserve trustworthy GPS and metric extraction from FIT and GPX imports
- record each bugfix as a task with review and verification notes

## Non-Goals

- redesign the upload pipeline
- add new workout import formats
- change canonical workout units or storage shape

## Scope

- `apps/web/src/pages/workouts/new/use-workout-entry.ts`
- `apps/web/src/lib/format.ts`
- `apps/web/src/components/workout/LapsTable.tsx`
- `apps/web/e2e/helpers/mock-auth.ts`
- `apps/api/src/uploads/parsers/fit-parser.service.ts`
- `apps/api/src/uploads/parsers/gpx-parser.service.ts`
- parser specs and linked design docs

## Design References

- `design/frontend/workout-experience.md`
- `design/backend/upload-ingestion.md`
- `design/adr/ADR-0003-canonical-workout-units.md`
- `docs/domain/workout.md`

## Review Plan

- web task: `frontend-reviewer`
- parser tasks: `backend-reviewer`
- PO review checks that the fixes resolve observed workout correctness bugs without broadening scope into product redesign

## Task Breakdown

- `tasks/archive/I-BUGS-010-web-fix-manual-workout-pace.md`
- `tasks/archive/I-BUGS-011-api-fix-fit-parsing.md`
- `tasks/archive/I-BUGS-012-api-fix-gpx-distance.md`
- `tasks/archive/I-BUGS-013-api-gpx-hr-cadence.md`

## Success Criteria

- manual workout entry submits canonical units and no longer renders invalid pace strings
- FIT and GPX ingestion preserve the metrics needed for trustworthy workout detail views
- task records contain verification and review closeout instead of relying on local-only context
