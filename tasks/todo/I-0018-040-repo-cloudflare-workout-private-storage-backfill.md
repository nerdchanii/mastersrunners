---
id: I-0018-040
title: Cloudflare private workout storage cutover와 backfill을 정리한다
parent: I-0018-workout-detail-blob-and-source-privacy
scope: repo
owner: unassigned
depends_on:
  - tasks/archive/I-0018-030-api-workout-detail-read-cutover.md
blocked_by: []
execution_status: in_progress
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/uploads/uploads.service.spec.ts
  - pnpm format:check
artifacts:
  - design/backend/upload-ingestion.md
  - docs/domain/workout.md
  - docs/runbooks/environment-and-settings.md
  - docs/runbooks/
  - scripts/
---

## 목표

Cloudflare R2의 public asset / private workout storage 경계를 실제 외부 상태와 문서까지 포함해 정리하고, 기존 data를 backfill한다.

## 완료 기준

- public asset bucket과 private workout bucket 경계가 문서와 외부 상태에서 정리된다.
- 기존 workout source가 `sourcePath`로 backfill된다.
- `I-0018-060`에서 legacy `fileUrl`로 compatibility-filled된 `sourcePath` row가 real private-storage identifier로 교체됐다는 증거를 남긴다.
- raw source 재파싱 우선, legacy fallback 보조 규칙으로 `detailPath`가 backfill된다.
- 관련 env/runbook/design/domain 문서가 현재 truth로 갱신된다.

## 노트

- Cloudflare MCP를 활용한다.
- 외부 상태 증거와 repo 내부 스크립트/문서를 함께 남긴다.

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:
- 리뷰: 필요하면 `backend-reviewer`, `harness-reviewer`, `docs-reviewer`, PO 관점으로 opt-in 한다.

## 리뷰 계획

- `backend-reviewer`, `harness-reviewer`, `docs-reviewer`: storage cutover, backfill safety, script/runbook 정합성을 본다.
- PO 관점: privacy 강화와 운영 복잡도 tradeoff가 납득 가능한지 본다.

## 핸드오프

- `I-0018-070` physical cleanup task는 이 task의 backfill 완료를 전제로 legacy schema를 제거한다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-22: task 생성.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:
