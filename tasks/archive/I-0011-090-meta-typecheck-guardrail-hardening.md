---
id: I-0011-090
title: Harden typecheck guardrails for TypeScript changes
parent: I-0011-domain-truth-and-boundary-hardening
scope: meta
owner: codex
reviewers:
  - backend-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - I-0011-070
blocked_by: []
verify:
  - bash scripts/check-task-review-metadata.sh
  - bash scripts/run-typecheck.sh
  - pnpm lint
  - pnpm --filter @masters/api test -- --runTestsByPath src/block/block.service.spec.ts src/block/repositories/block.repository.spec.ts
artifacts:
  - scripts/run-typecheck.sh
  - scripts/pre-commit.sh
  - scripts/ci-local.sh
  - design/operating-rules/commit-conventions.md
  - docs/runbooks/test-stability.md
  - apps/api/src/block/repositories/block.repository.ts
---

## Goal

Close the type-safety guardrail gap that let a strict TypeScript error ship after lint and tests passed.

## Done Criteria

- the current `block.repository.ts` transaction callback type error is fixed
- repository typecheck has a stable script entrypoint instead of being duplicated inline across commands
- pre-commit runs the explicit typecheck guard for staged TypeScript-sensitive changes
- docs describe explicit typecheck as a blocking verification signal for TypeScript changes

## Notes

- This task exists because `I-0011-070` passed `lint` and API tests but still broke repo-level `pnpm typecheck`.
- Prefer a single script entrypoint that both humans and guardrails can call.
- Keep the pre-commit escalation scoped to TypeScript-sensitive staged changes so docs-only commits do not pay the full typecheck cost.

## Self Review

- Scope and intent: strict TypeScript 에러가 lint/test만으로 새어 나간 guardrail gap을 닫기 위해 typecheck를 script entrypoint로 묶고 pre-commit/ci-local에 연결했으며, 현재 `block.repository.ts` 타입 slip도 함께 수정했다.
- Source of truth: `package.json`, `scripts/run-typecheck.sh`, `scripts/pre-commit.sh`, `scripts/ci-local.sh`, `design/operating-rules/commit-conventions.md`, `docs/runbooks/test-stability.md`, `apps/api/src/block/repositories/block.repository.ts`
- Design divergence: pre-commit에서 모든 커밋마다 full typecheck를 강제하지는 않고, staged 파일이 TypeScript-sensitive surface를 건드릴 때만 `scripts/run-typecheck.sh`를 호출하게 했다.
- Verification: `bash scripts/check-task-review-metadata.sh`; `bash scripts/run-typecheck.sh`; `pnpm lint`; `pnpm --filter @masters/api test -- --runTestsByPath src/block/block.service.spec.ts src/block/repositories/block.repository.spec.ts`
- Review routing: `backend-reviewer`, `harness-reviewer`, `po-reviewer`

## Review Focus

- Specialist reviewer should check: the repo now has one durable typecheck entrypoint and the pre-commit guard uses it for the right change surface.
- PO reviewer should check: the guardrail closes a real regression class without making routine docs-only work unnecessarily heavy.

## Handoff

- Future TypeScript guard changes should update `scripts/run-typecheck.sh` first, then reuse that entrypoint from hooks and CI rather than re-inlining commands.

## Design Divergence

- 현재 pre-commit trigger는 staged TypeScript/config/prisma 변화에 한정된다. 이후 다른 파일군도 typecheck를 유발해야 한다는 증거가 나오면 trigger 범위를 follow-up으로 확장한다.

## Attempt Log

- 2026-03-30: created after repo-level `pnpm typecheck` caught an implicit-`any` error that task-level verify and pre-commit did not enforce.
- 2026-03-30: `scripts/run-typecheck.sh`를 추가하고 `package.json`, `pre-commit`, `ci-local`이 같은 entrypoint를 재사용하도록 정리했다.
- 2026-03-30: `block.repository.ts`의 transaction callback에 `TransactionClient` 타입을 복구하고 repo-level typecheck, lint, block tests를 다시 통과시켰다.

## Review Notes

- Specialist review: 2026-03-30 `backend-reviewer`, `harness-reviewer` pass. strict TypeScript slip을 재현 가능하게 막는 단일 entrypoint가 생겼고, hook/CI 연결도 그 entrypoint를 재사용한다.
- PO review: 2026-03-30 `po-reviewer` pass. 실제 회귀 클래스를 줄이되 docs-only 커밋까지 과도하게 느리게 만들지는 않는 선에서 guardrail을 강화했다.
