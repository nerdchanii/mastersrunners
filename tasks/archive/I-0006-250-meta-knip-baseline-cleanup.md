---
id: I-0006-250
title: Restore knip baseline after websocket rollout follow-up
parent: I-0006-guardrail-hardening
scope: meta
owner: unassigned
reviewers:
  - harness-reviewer
  - backend-reviewer
  - frontend-reviewer
po_review: required
depends_on: []
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm knip
  - pnpm ci:local
  - pnpm --filter @masters/api build
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web exec vitest run src/hooks/useChatWindow.test.tsx
artifacts:
  - knip.json
  - apps/api/src/auth/auth-cookie.util.ts
  - apps/api/src/conversations/conversations.controller.ts
  - apps/api/src/conversations/conversations.service.ts
  - apps/web/e2e/helpers/messaging-fixtures.ts
  - apps/web/e2e/helpers/public-entry-fixtures.ts
  - apps/web/e2e/public-entry-auth.spec.ts
  - apps/web/src/components/crew/CrewAttendance.tsx
  - apps/web/src/components/crew/CrewAttendanceStats.shared.tsx
  - apps/web/src/components/crew/CrewCreateForm.tsx
  - apps/web/src/components/crew/CrewEditForm.tsx
  - apps/web/src/components/crew/CrewForm.tsx
  - apps/web/src/components/crew/crew-activity-icons.tsx
  - apps/web/src/components/ui/chart.tsx
  - apps/web/src/components/ui/funnel.tsx
  - apps/web/src/hooks/useChatWindow.ts
  - apps/web/src/hooks/useGroupChat.ts
  - apps/web/src/lib/regions.ts
  - design/initiatives/I-0006-guardrail-hardening.md
---

## 목표

WebSocket rollout follow-up 이후 `pnpm knip`와 `pnpm ci:local`을 다시 통과시키도록 실제 dead export/file을 정리한다.

## 완료 기준

- `pnpm knip`가 unused file/export/type 오류 없이 통과한다.
- `pnpm ci:local`이 pre-push gate로 다시 통과한다.
- 실제 dead code는 제거하고, 정당한 baseline 예외만 남긴다.

## 노트

- 이번 범위는 dead code baseline 복구에만 집중한다.
- 기능 동작 변경은 넣지 않고, export boundary와 미사용 파일 정리만 다룬다.
- 기존 task closeout을 깨지 않도록 unrelated behavior refactor는 넣지 않는다.

## 셀프 리뷰

- 범위와 의도: `pnpm knip`가 막은 실제 dead export/file만 제거하고, e2e fixture/spec drift로 `ci:local`이 다시 깨지는 지점까지 함께 복구한다.
- source of truth: `pnpm knip`, `scripts/ci-local.sh`, 현재 web/api 구현에서 실제 import 사용 여부, `design/initiatives/I-0006-guardrail-hardening.md`.
- 설계 divergence: 없음. 기능 설계를 바꾸지 않고 export boundary와 test fixture만 현재 UI truth에 맞췄다.
- 검증: `pnpm knip`, `pnpm --filter @masters/api build`, `pnpm --filter @masters/web lint`, `pnpm --filter @masters/web exec vitest run src/hooks/useChatWindow.test.tsx`, `pnpm ci:local`.
- 리뷰 라우팅: `meta` cleanup이지만 api/web/e2e를 함께 건드려 `backend-reviewer`, `frontend-reviewer`, `harness-reviewer`, 이후 `po-reviewer`.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: dead code 정리가 실제 unused 항목 제거에 머물고, knip 예외를 무리하게 늘리지 않았는지 본다.
- PO reviewer가 확인할 내용: push gate 복구가 현재 작업 흐름을 막는 실제 문제를 해결하는지 본다.

## 핸드오프

- 이번 batch 이후에도 knip가 새 false positive를 내면 해당 wiring을 별도 task로 분리한다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-22: `fix(api): close websocket chat rollout` 커밋 후 `git push origin dev`가 `pre-push -> pnpm ci:local -> pnpm knip`에서 막혀 후속 cleanup task로 생성했다.
- 2026-04-22: `pnpm knip` unused export/file 정리 후 Playwright가 invite CTA copy drift와 past-date fixture 때문에 실패해 spec/fixture를 현재 UI truth에 맞게 보정했다.
- 2026-04-22: `pnpm ci:local` 재실행까지 통과해 pre-push gate 복구를 확인했다.

## 리뷰 노트

- Specialist review:
  - `harness-reviewer` manual review pass on 2026-04-22: second source of truth 없이 task/initiative/CI 흐름이 같은 gate를 가리키고 있고, 이번 수정이 `knip` baseline 복구와 deterministic pre-push 복원에 머물렀음을 확인했다. Artifact: `tasks/reviews/I-0006-250/harness-reviewer.json`
  - `backend-reviewer` manual review pass on 2026-04-22: auth/conversations 쪽 export 축소가 런타임 contract 변경 없이 internal helper leakage만 줄였고, `apps/api/src/conversations/conversations.controller.ts` explicit return type으로 Nest public surface도 유지됨을 확인했다. Artifact: `tasks/reviews/I-0006-250/backend-reviewer.json`
  - `frontend-reviewer` manual review pass on 2026-04-22: public-entry auth contract가 현재 accessible CTA와 future-dated fixture 기준으로 다시 안정화됐고, `next` preservation/modal gating 동작도 `ci:local` Playwright로 재검증됨을 확인했다. Artifact: `tasks/reviews/I-0006-250/frontend-reviewer.json`
- PO review:
  - `po-reviewer` manual review pass on 2026-04-22: 이번 changeset이 사용자 기능을 넓히지 않고 실제 operator pain point였던 push gate blocker를 해소했으므로 현재 changeset을 닫아도 된다고 판단했다. Artifact: `tasks/reviews/I-0006-250/po-reviewer.json`
