---
id: I-0011-040
title: Document delete and restore lifecycles by entity
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
  - rg -n "soft delete|hard delete|restore|deletedAt" docs/domain/business-rules.md docs/domain/event.md docs/domain/workout.md docs/domain/post-feed.md docs/domain/crew.md docs/domain/dm.md packages/database/prisma/schema.prisma
artifacts:
  - docs/domain/business-rules.md
  - docs/domain/event.md
  - docs/domain/workout.md
  - docs/domain/post-feed.md
  - docs/domain/crew.md
  - docs/domain/dm.md
  - docs/domain/README.md
---

## Goal

Replace blanket deletion statements with an explicit entity-by-entity delete and restore matrix grounded in schema and runtime behavior.

## Done Criteria

- `docs/domain/business-rules.md` states which entities are soft-deleted, hard-deleted, or not restorable in current implementation
- cascade, detach, counter, and visibility side effects are documented for the main entities affected by delete operations
- linked domain docs that mention delete behavior no longer contradict the central matrix

## Notes

- The current repo mixes `deletedAt` models with hard-delete flows such as event removal.
- This task should prefer accuracy over elegance. If the implementation is inconsistent, say so and open a follow-up task instead of smoothing it over.

## Self Review

- Scope and intent: blanket delete 원칙을 걷어내고, 실제 runtime과 schema가 보여주는 soft delete / hard delete / restore 경계를 엔티티별 매트릭스로 다시 적었다.
- Source of truth: `packages/database/prisma/schema.prisma`, `apps/api/src/workouts/workouts.service.ts`, `apps/api/src/posts/posts.service.ts`, `apps/api/src/events/events.service.ts`, `apps/api/src/conversations/repositories/conversations.repository.ts`, `apps/api/src/crews/crews.service.ts`, `apps/api/src/crews/internal/crew-membership.service.ts`
- Design divergence: 원하는 제품 규칙과 별개로 현재 구현이 섞여 있는 부분을 그대로 남겼다. 특히 `CrewMember`는 hard delete와 status transition이 혼용되고, `Workout` 삭제는 side effect rollback을 보장하지 않는다.
- Verification: `bash scripts/check-task-review-metadata.sh`; `bash scripts/check-doc-frontmatter.sh`; `rg -n "soft delete|hard delete|restore|deletedAt" docs/domain/business-rules.md docs/domain/event.md docs/domain/workout.md docs/domain/post-feed.md docs/domain/crew.md docs/domain/dm.md packages/database/prisma/schema.prisma`
- Review routing: `docs-reviewer`, `backend-reviewer`, `po-reviewer`

## Review Focus

- Specialist reviewer should check: delete and restore behavior is grounded in schema and runtime code, not inferred from older blanket rules.
- PO reviewer should check: the matrix makes operational and user-visible consequences of delete actions understandable.

## Handoff

- If the delete model itself should change after this task, create API or DB follow-up work rather than weakening the accuracy of the docs.

## Design Divergence

- `Workout` 삭제 시 shoe distance 보정과 challenge progress rollback은 best-effort에 가깝고 restore contract도 없다.
- `Crew`는 상위 엔티티만 soft delete되고 하위 엔티티는 hard delete와 status update가 혼용된다.
- `Event`는 hard delete인데 주변 사용자 기대치가 soft delete에 가까우면 별도 product/API task가 필요하다.

## Attempt Log

- 2026-03-30: created after review found that current delete rules overstated soft-delete coverage and hid hard-delete cases such as events.
- 2026-03-30: central delete matrix를 `User`, `Workout`, `Post`, `Message`, `Crew`, `Challenge`, `Event`, `CrewActivity`, `Follow`, `Block`, `CrewMember` 기준으로 재작성했다.
- 2026-03-30: linked domain docs(`crew`, `event`, `workout`, `post-feed`, `dm`)에 현재 삭제 방식과 restore 부재를 명시해 중앙 문서와 충돌을 제거했다.

## Review Notes

- Specialist review: 2026-03-30 `docs-reviewer`, `backend-reviewer` pass. schema/runtime이 드러내는 delete contract를 과장 없이 문서화했고 blanket soft-delete 설명을 제거했다.
- PO review: 2026-03-30 `po-reviewer` pass. 사용자 관점에서 중요한 삭제 후 결과와 복원 부재가 더 명확해졌다.
