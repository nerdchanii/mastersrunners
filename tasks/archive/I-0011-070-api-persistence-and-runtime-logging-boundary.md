---
id: I-0011-070
title: Clarify API persistence and runtime logging boundaries
parent: I-0011-domain-truth-and-boundary-hardening
scope: api
owner: codex
reviewers:
  - backend-reviewer
  - architecture-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - I-0011-060
blocked_by: []
verify:
  - bash scripts/check-task-review-metadata.sh
  - pnpm lint
  - pnpm --filter @masters/api test
  - 'bash -lc ''if rg -n "console\\.(log|error|warn|info)" apps/api/src -g "!**/*.spec.ts"; then exit 1; else exit 0; fi'''
  - rg -n "DatabaseService|StructuredLoggerService|MonitoringService" design/backend/conventions.md apps/api/src/profile apps/api/src/block apps/api/src/crew-boards apps/api/src/common/logging apps/api/src/common/monitoring
artifacts:
  - design/backend/conventions.md
  - apps/api/src/profile/
  - apps/api/src/block/
  - apps/api/src/crew-boards/
  - apps/api/src/common/logging/
  - apps/api/src/common/monitoring/
---

## Goal

Define and enforce where direct persistence access and runtime logging belong in API modules so the service layer stops drifting into unstructured DB and console usage.

## Done Criteria

- direct `DatabaseService` usage is limited to documented boundary owners such as repositories or explicit persistence services
- hotspot feature services that currently bypass the boundary are refactored or explicitly tracked as follow-up debt
- runtime `console.*` usage is removed from API code in favor of structured logging and documented failure-handling policy
- backend conventions record the allowed persistence and logging boundaries clearly

## Notes

- Keep the first pass focused on the confirmed hotspot modules rather than attempting a full API-wide repository rewrite.
- If a side effect cannot be made fully reliable yet, document the failure contract and remaining follow-up instead of leaving silent console-based handling in place.

## Self Review

- Scope and intent: `profile`, `block`, `crew-boards`의 직접 persistence 접근을 repository 경계로 밀어내고, API runtime `console.*` 호출을 structured logging/monitoring 경계로 교체했다.
- Source of truth: `design/backend/conventions.md`, `apps/api/src/profile/profile.service.ts`, `apps/api/src/block/block.service.ts`, `apps/api/src/block/repositories/block.repository.ts`, `apps/api/src/crew-boards/crew-boards.service.ts`, `apps/api/src/crew-boards/crew-boards.repository.ts`, `apps/api/src/workouts/workouts.service.ts`
- Design divergence: 전체 API를 한 번에 repository 패턴으로 재작성하지 않고, task에서 확인된 hotspot만 우선 hardening 했다. `UserRepository`에 post count query를 추가한 것은 cross-aggregate reporting이지만 현재 profile service의 직접 Prisma 접근을 제거하는 쪽을 우선했다.
- Verification: `bash scripts/check-task-review-metadata.sh`; `pnpm lint`; `pnpm --filter @masters/api test`; `bash -lc 'if rg -n "console\\.(log|error|warn|info)" apps/api/src -g "!**/*.spec.ts"; then exit 1; else exit 0; fi'`; `rg -n "DatabaseService|StructuredLoggerService|MonitoringService" design/backend/conventions.md apps/api/src/profile apps/api/src/block apps/api/src/crew-boards apps/api/src/common/logging apps/api/src/common/monitoring`
- Review routing: `backend-reviewer`, `architecture-reviewer`, `harness-reviewer`, `po-reviewer`

## Review Focus

- Specialist reviewer should check: persistence access and runtime logging now happen in explicit, reviewable boundaries rather than opportunistically inside feature services.
- PO reviewer should check: the structural hardening meaningfully lowers operational risk without masking remaining refactor debt.

## Handoff

- Future API modules should treat direct DB access in feature services and runtime `console.*` calls as exceptions that require explicit justification and tracking.

## Design Divergence

- `profile`의 post count 조회는 별도 read-model repository로 분리할 수도 있지만, 이번 task에서는 feature service의 직접 Prisma 접근 제거를 우선해 `UserRepository`에 흡수했다.
- `workouts`의 shoe/challenge side effect failure는 structured log + monitoring capture로 승격됐지만, 재시도/보상 트랜잭션까지 제공하지는 않는다.

## Attempt Log

- 2026-03-30: created after backend review found feature services still injecting `DatabaseService` directly and API runtime code still relying on ad hoc console logging.
- 2026-03-30: `ProfileService`, `BlockService`, `CrewBoardsService`에서 직접 `DatabaseService` 주입을 제거하고 repository method로 경계를 정리했다.
- 2026-03-30: `WorkoutsService`의 runtime `console.error`를 `StructuredLoggerService` + `MonitoringService` 경계로 교체하고 관련 spec을 현재 behavior에 맞춰 갱신했다.

## Review Notes

- Specialist review: 2026-03-30 `backend-reviewer`, `architecture-reviewer`, `harness-reviewer` pass. hotspot service의 persistence/logging 경계가 더 명시적이고 검증 가능한 위치로 이동했다.
- PO review: 2026-03-30 `po-reviewer` pass. 운영 리스크가 높은 ad hoc DB/logging 패턴을 줄였고, 남은 구조적 한계도 task 문서에 숨기지 않았다.
