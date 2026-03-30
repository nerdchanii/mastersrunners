---
id: I-0011-020
title: Resync challenge domain docs to current schema and runtime
parent: I-0011-domain-truth-and-boundary-hardening
scope: docs
owner: codex
reviewers:
  - docs-reviewer
  - backend-reviewer
po_review: required
depends_on:
  - I-0011-010
blocked_by: []
verify:
  - bash scripts/check-task-review-metadata.sh
  - bash scripts/check-doc-frontmatter.sh
  - rg -n "type|targetValue|targetUnit|goalType|creatorType|participationUnit|participationMode|ChallengeParticipant" docs/domain/challenge.md packages/database/prisma/schema.prisma design/backend/events-challenges.md apps/api/src/challenges/challenges.service.ts
artifacts:
  - docs/domain/challenge.md
  - docs/domain/glossary.md
  - docs/domain/README.md
  - design/initiatives/I-0011-domain-truth-and-boundary-hardening.md
---

## Goal

Rewrite the challenge domain doc so it reflects the current Prisma schema, API behavior, and current-state design corpus instead of mixing in unverified future concepts.

## Done Criteria

- `docs/domain/challenge.md` matches current field names, participant state, and lifecycle behavior used by the API and schema
- future-only or unimplemented concepts are either removed from the current doc or explicitly pushed into `target` design work
- challenge vocabulary in `docs/domain/glossary.md` no longer contradicts the runtime model

## Notes

- The current implementation centers on `type`, `targetValue`, `targetUnit`, `isPublic`, `crewId`, and direct participant progress updates.
- Do not preserve `PLATFORM`, approval workflows, or richer team semantics in the current doc unless they are re-verified against code and schema.

## Self Review

- Scope and intent: Challenge 문서를 현재 API 계약, Prisma 스키마, repository/service 동작에 맞춰 다시 쓰고 challenge 용어를 현재 runtime 기준으로 정리했다.
- Source of truth: `packages/database/prisma/schema.prisma`, `apps/api/src/challenges/challenges.controller.ts`, `apps/api/src/challenges/challenges.service.ts`, `apps/api/src/challenges/repositories/*.ts`, `design/backend/events-challenges.md`
- Design divergence: 스키마에 남아 있는 `creatorType`, `goalType`, `participationUnit`, `participationMode`, `joinType`, `visibility`는 현재 challenge API 계약의 핵심 규칙으로 노출되지 않아 확장 필드로만 기록했다. 반면 워크아웃 생성 후 `ChallengeAggregationService`가 `DISTANCE`, `FREQUENCY` 타입 일부를 비동기 후속 처리로 집계하는 경로는 current runtime으로 유지되어 문서에 반영했다.
- Verification: `bash scripts/check-task-review-metadata.sh`; `bash scripts/check-doc-frontmatter.sh`; `rg -n "type|targetValue|targetUnit|goalType|creatorType|participationUnit|participationMode|ChallengeParticipant" docs/domain/challenge.md packages/database/prisma/schema.prisma design/backend/events-challenges.md apps/api/src/challenges/challenges.service.ts`
- Review routing: `docs-reviewer`, `backend-reviewer`, `po-reviewer`

## Review Focus

- Specialist reviewer should check: the challenge doc reads as current truth and does not reintroduce speculative participation rules.
- PO reviewer should check: the resulting challenge rules are still meaningful as product vocabulary and do not hide future ideas that need separate planning.

## Handoff

- If restored future challenge features are still desired, create separate `target` design tasks rather than stretching this current-state sync task.

## Design Divergence

- Challenge schema에는 phase-2 확장 필드가 남아 있지만 현재 controller/service 계약은 해당 필드를 실사용 규칙으로 드러내지 않는다. richer challenge semantics가 필요하면 별도 `target` 설계 task로 다뤄야 한다.

## Attempt Log

- 2026-03-30: created after reviewers found the challenge domain doc was the largest single mismatch between current docs and runtime behavior.
- 2026-03-30: current challenge truth를 사용자 생성/참여, 참가자·팀 lifecycle, soft delete 기준으로 재정리하고 오래된 PLATFORM/승인 워크플로우 설명을 제거했다.
- 2026-03-30: `ChallengeAggregationService`와 `workouts.service.ts`를 다시 대조해 `DISTANCE`, `FREQUENCY` 타입의 workout-triggered progress aggregation은 current runtime으로 문서에 남겼다.

## Review Notes

- Specialist review: 2026-03-30 `docs-reviewer` + `backend-reviewer` pass. Challenge 문서가 현재 controller/service/schema와 workout-triggered aggregation 경로까지 포함해 current truth와 일치하고 speculative participation rules를 현재 truth로 남기지 않는다.
- PO review: 2026-03-30 `po-reviewer` pass. 현재 제품 용어는 유지하되, 아직 구현되지 않은 challenge 운영 개념은 현재 문서에서 분리됐다.
