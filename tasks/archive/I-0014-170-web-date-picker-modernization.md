---
id: I-0014-170
title: Replace native date inputs with a calmer shared date picker
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/web build
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/pages/workouts/new/index.tsx
  - apps/web/src/pages/workouts/[id]/edit.tsx
  - apps/web/src/pages/challenges/new/index.tsx
  - apps/web/src/pages/challenges/[id]/edit/index.tsx
  - apps/web/src/components/ui/
---

## Goal

Standardize date picking with a lighter shared component instead of inconsistent native browser date inputs.

## Done Criteria

- the targeted forms use one calmer shared date-picking experience
- mobile and desktop behavior feel more consistent than native browser date inputs
- the chosen component remains minimal and does not overpower the form

## Notes

- Execution mode: autonomous.
- Favor a restrained shared picker rather than a feature-heavy calendar surface.

## Self Review

- Scope and intent: native `type="date"` 입력을 shared picker wrapper로 치환하는 범위만 다뤘고, 기존 저장/검증 로직은 유지했다.
- Source of truth: `design/frontend/conventions.md`와 대상 폼들의 현재 date-string contract를 함께 맞췄다.
- Design divergence: 없음. 날짜 입력을 shared `components/ui/date-picker.tsx`로 통일했다.
- Verification: `pnpm --filter @masters/web build`, `bash scripts/check-task-review-metadata.sh`
- Review routing: user-facing UI 변경이므로 `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

## Review Focus

- Specialist reviewer should check: the date picker feels simpler and more consistent than the current native input mix.
- PO reviewer should check: the interaction matches the intended minimal UX direction.

## Handoff

- Reuse the same date-picker wrapper across other forms instead of letting more native date inputs reappear.

## Design Divergence

- Current forms still rely on native date inputs with inconsistent platform behavior.

## Attempt Log

- 2026-04-01: created after product flagged the current datepicker UX as unpleasant.
- 2026-04-01: replaced four native date inputs with a shared dialog-based picker while keeping each form's existing `yyyy-mm-dd` state contract intact.

## Review Notes

- Specialist review: the shared picker keeps the forms consistent across mobile and desktop without introducing a heavy calendar surface or changing submit contracts.
- PO review: date selection now feels calmer and more intentional than the browser-native controls it replaced.
