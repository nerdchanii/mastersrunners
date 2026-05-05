---
id: I-0014-140
title: Flatten crew settings basic-info shells and trim form chrome
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
  - apps/web/src/pages/crews/[id]/settings/index.tsx
  - apps/web/src/components/crew/CrewForm.tsx
  - design/frontend/crew-experience.md
---

## Goal

Remove the card-inside-card crew settings treatment and simplify basic-info form chrome such as excessive labels and required markers.

## Done Criteria

- crew settings no longer present nested generic cards in the basic-info area
- labels, helper copy, and required indicators are trimmed to what actually improves form comprehension
- the resulting form still remains accessible and understandable on mobile

## Notes

- Execution mode: autonomous.
- Keep this task on shell cleanup and form chrome only; crew media fields and tab hierarchy have separate tasks.

## Self Review

- Scope and intent: crew settings 기본 정보 탭의 card-in-card 구성을 제거하고, 단순 텍스트 필드의 과한 라벨/필수표시를 줄이는 범위로 제한했다.
- Source of truth: `design/frontend/crew-experience.md`의 settings shell 규칙과 현재 `/crews/:id/settings` 구현을 함께 맞췄다.
- Design divergence: 없음. 기존 중첩 카드 구현이 현재 디자인 의도보다 과했던 부분을 정리했다.
- Verification: `pnpm --filter @masters/web build`, `bash scripts/check-task-review-metadata.sh`
- Review routing: user-facing UI 변경이므로 `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

## Review Focus

- Specialist reviewer should check: the form feels flatter and cleaner without reducing clarity.
- PO reviewer should check: the settings screen no longer looks like “card inside card” UI.

## Handoff

- Crew media and hierarchy tasks should reuse this flatter settings shell rather than reintroducing wrapper cards.

## Design Divergence

- Current crew settings still stack a page shell and a `CrewForm` card on top of each other.

## Attempt Log

- 2026-04-01: created after product called out nested cards and unnecessary form chrome in crew settings.
- 2026-04-01: flattened the edit shell into one panel, removed generic form-card chrome, and kept destructive actions visually separate without reusing card wrappers.

## Review Notes

- Specialist review: crew settings edit flow now uses one flat basic-info panel, placeholder-first inputs, and a simpler destructive section without nested generic cards.
- PO review: the page no longer reads like “card inside card” UI and keeps basic-info editing visually lighter on mobile.
