---
id: I-BUGS-013
title: Fix GPX parsing for hr and cadence
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
  - apps/api/src/uploads/parsers/gpx-parser.service.ts
  - apps/api/src/uploads/parsers/gpx-parser.service.spec.ts
---

## Goal

Add `gpxdata` namespace support to GPX heart-rate and cadence extraction so watch-exported GPX files can produce trustworthy metric summaries.

## Done Criteria

- The parser matches `gpxdata:hr` alongside the existing GPX heart-rate namespace patterns.
- The parser matches `gpxdata:cadence` plus the existing cadence tag variants.
- Backend parser-focused specs and API build typecheck pass.

## Notes

- This task closes a namespace gap inside the existing GPX parser rather than widening the upload boundary.
- Malformed metric extensions are normalized to `undefined` so bad watch-exported tags do not leak `NaN` into HR or cadence summaries.

## Self Review

- Scope and intent: extend GPX parser metrics support for watch-exported namespace variants only.
- Source of truth: `design/backend/upload-ingestion.md` and the observed `gpxdata` GPX exports from the user-reported files.
- Design divergence: none. The parser already owns optional metric extraction; this closes a namespace gap.
- Verification: parser-focused API tests and `tsc -p tsconfig.build.json --noEmit` pass.
- Review routing: `backend-reviewer` plus PO review is sufficient because the task stays within parser metric extraction.

## Review Focus

- Specialist reviewer should check: `gpxdata:hr` and `gpxdata:cadence` variants are parsed without regressing existing `gpxtpx` support.
- PO reviewer should check: imported heart-rate and cadence summaries become trustworthy for watch-exported GPX files.

## Handoff

- Keep namespace support narrow and spec-backed; add new extension variants only when a real export sample requires them.

## Design Divergence

- None.

## Attempt Log

- 2026-03-30: extracted heart-rate and cadence from the user's Coros GPX and traced the gap to unsupported `gpxdata` tags.
- 2026-03-31: expanded cadence matching to cover `cadence` as well as `cad`, then added regression coverage for `gpxdata` heart-rate, cadence, and cumulative-distance exports in one parser spec.
- 2026-03-31: hardened GPX numeric extension parsing so malformed `hr`, `cadence`, `distance`, or `ele` values are ignored instead of propagating `NaN`.
- 2026-03-31: `pnpm --filter @masters/api test` still has an unrelated date-sensitive failure in `src/challenges/challenges.service.spec.ts`, so this task uses focused upload-parser verification plus API build typecheck instead of claiming a clean full-suite pass.
- 2026-03-31: verification passed with `pnpm --filter @masters/api exec tsc -p tsconfig.build.json --noEmit` and focused upload-parser specs.

## Review Notes

- Specialist review:
  - `backend-reviewer` pass on 2026-03-31: confirmed the parser now accepts `gpxdata` heart-rate and cadence variants without regressing existing namespace support, malformed numeric extensions now collapse to `undefined`, and the regression spec exercises the watch-exported namespace shape directly.
- PO review:
  - 2026-03-31: user-approved closeout. The fix improves workout import fidelity without broadening scope beyond parser correctness.
