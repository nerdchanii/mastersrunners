---
id: I-BUGS-011
title: Fix FIT parser coordinates bug
parent: I-BUGS
scope: api
owner: frontend-ui-ux-engineer
reviewers:
  - backend-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/api exec tsc -p tsconfig.build.json --noEmit
  - pnpm --filter @masters/api test -- --runTestsByPath src/uploads/parsers/fit-parser.service.spec.ts src/uploads/parsers/gpx-parser.service.spec.ts src/uploads/uploads.service.spec.ts
artifacts:
  - apps/api/src/uploads/parsers/fit-parser.service.ts
  - apps/api/src/uploads/parsers/fit-parser.service.spec.ts
---

## Goal

Remove the duplicated semicircle-to-degrees coordinate conversion in `FitParserService` so imported routes preserve valid GPS points and downstream workout maps render correctly.

## Done Criteria

- `semicirclesToDegrees` is removed from `FitParserService`.
- `record.position_lat` and `record.position_long` are passed through as the parser-normalized `lat` and `lon` values.
- Backend parser-focused specs and API build typecheck pass.

## Notes

- `fit-file-parser` already converts FIT semicircle coordinates to degrees.
- This task stays scoped to preserving parser-normalized coordinates, not redesigning the upload ingestion contract.

## Self Review

- Scope and intent: keep this task on parser correctness only.
- Source of truth: `design/backend/upload-ingestion.md` and the observed `fit-file-parser` output shape.
- Design divergence: none. The fix restores the intended parser boundary instead of changing the ingestion contract.
- Verification: parser-focused API tests and `tsc -p tsconfig.build.json --noEmit` pass.
- Review routing: `backend-reviewer` plus PO review is sufficient for this bounded parser bugfix.

## Review Focus

- Specialist reviewer should check: the parser now preserves coordinates already normalized by `fit-file-parser` and the regression spec covers that expectation.
- PO reviewer should check: the fix improves route correctness without widening scope into broader import behavior changes.

## Handoff

- Keep relying on the parser-library boundary for FIT coordinate normalization unless a future parser swap explicitly changes that contract.

## Design Divergence

- None.

## Attempt Log

- 2026-03-30: debugged the user's FIT parsing discrepancy and traced it to a second coordinate conversion inside `FitParserService`.
- 2026-03-31: added a regression spec proving parser-normalized latitude and longitude values are preserved without another semicircle conversion.
- 2026-03-31: `pnpm --filter @masters/api test` still has an unrelated date-sensitive failure in `src/challenges/challenges.service.spec.ts`, so this task uses focused upload-parser verification plus API build typecheck instead of claiming a clean full-suite pass.
- 2026-03-31: verification passed with `pnpm --filter @masters/api exec tsc -p tsconfig.build.json --noEmit` and focused upload-parser specs.

## Review Notes

- Specialist review:
  - `backend-reviewer` pass on 2026-03-31: confirmed the FIT parser now trusts the normalized coordinates returned by `fit-file-parser`, the regression spec locks that behavior in place, and the remaining full-suite failure is unrelated challenge-test drift.
- PO review:
  - 2026-03-31: user-approved closeout. The fix stays within workout import correctness and does not change product scope.
