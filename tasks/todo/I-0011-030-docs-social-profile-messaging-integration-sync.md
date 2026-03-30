---
id: I-0011-030
title: Resync social, profile, messaging, and integration docs
parent: I-0011-domain-truth-and-boundary-hardening
scope: docs
owner: codex
reviewers:
  - docs-reviewer
  - backend-reviewer
  - frontend-reviewer
po_review: required
depends_on:
  - I-0011-010
blocked_by: []
verify:
  - bash scripts/check-task-review-metadata.sh
  - bash scripts/check-doc-frontmatter.sh
  - rg -n "workoutSharingDefault|isPrivate|DIRECT|CREW|ACTIVITY|ConnectedPlatform|Presigned URL|disk fallback" docs/domain/social.md docs/domain/user-profile.md docs/domain/dm.md docs/domain/external-integration.md packages/database/prisma/schema.prisma design/backend/upload-ingestion.md apps/web/src/components/profile/ProfileTabs.tsx apps/web/src/pages/settings/profile/use-profile-edit-form.ts
artifacts:
  - docs/domain/social.md
  - docs/domain/user-profile.md
  - docs/domain/dm.md
  - docs/domain/external-integration.md
  - docs/domain/glossary.md
  - docs/domain/README.md
---

## Goal

Bring the social, profile, messaging, and external-integration domain docs back into line with current UI, API, and runtime behavior.

## Done Criteria

- profile docs describe only the currently implemented fields, tabs, and settings, with future surfaces split out or explicitly tracked
- social rules reflect workout-level visibility and current DM constraints instead of overstating profile-level gating
- messaging docs describe current `DIRECT`, `CREW`, and `ACTIVITY` behavior, unread handling, and message deletion fields accurately
- external integration docs reflect the implemented upload, parse, storage, and fallback boundaries

## Notes

- This task should update the glossary when shared vocabulary changes.
- Keep current docs grounded in runtime truth. If a richer profile or messaging surface is still desired, move it to `design/` as `target`.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the four domain docs no longer contradict implemented UI or API behavior.
- PO reviewer should check: the resulting docs still express the intended product behavior clearly, even after future-only surfaces are removed from current-state docs.

## Handoff

- Any intentionally deferred profile, DM, or integration capability should be captured as a new `target` design task rather than reintroduced into `docs/domain/`.

## Design Divergence

- If a doc must mention a not-yet-built surface to preserve product intent, split it into a `target` design artifact and link that follow-up here.

## Attempt Log

- 2026-03-30: created after multi-review findings showed that social/profile/DM/integration rules had drifted into a mix of current behavior and future product ideas.

## Review Notes

- Specialist review:
- PO review:
