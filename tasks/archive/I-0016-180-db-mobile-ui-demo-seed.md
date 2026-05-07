---
id: I-0016-180
title: 모바일 UI 캡처용 데모 DB seed
parent: I-0016-design-system-and-ux-guardrails
scope: db
owner: codex
reviewers:
  - backend-reviewer
po_review: required
depends_on: []
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/database db:seed
  - pnpm --filter @masters/database build
artifacts:
  - packages/database/prisma/seed.ts
---

## 목표

모바일 raw capture 기준 화면에서 빈 상태만 보이지 않도록 개발/검증용 DB seed 데이터를 추가한다.

## 완료 기준

- 기존 workout type seed를 유지한다.
- 개발용 로그인 사용자를 포함해 유저, 팔로우, 운동 기록, 게시글, 크루, 크루 활동/게시판, 대화, 메시지, 알림 데모 데이터가 생성된다.
- seed는 반복 실행 가능해야 한다.
- source mock 없이 DB 데이터로 화면을 확인할 수 있다.

## 노트

- 사용자가 DB 직접 seeding을 승인했다.
- seed 데이터는 모바일 UI 캡처를 위한 개발용 fixture이며 운영 데이터 계약으로 승격하지 않는다.

## 셀프 리뷰

- 범위와 의도: 모바일 raw capture를 위해 개발 DB에 풍부한 관계 데이터를 넣는 seed 확장으로 제한했다.
- source of truth: Prisma 모델은 `packages/database/prisma/schema.prisma`, dev-login 계정은 `apps/api/src/auth/auth.controller.ts`를 따랐다.
- 설계 divergence: 기존 workout type seed는 유지했고, 데모 fixture는 운영 데이터 계약으로 문서 승격하지 않았다.
- 검증: backend-reviewer 변경 요청을 두 차례 반영한 뒤 `pnpm --filter @masters/database db:seed`, `pnpm --filter @masters/database build`를 다시 통과했고, DB에서 토요일 활동/체크인 저장 요일을 확인했다.
- 리뷰 라우팅: DB seed 변경이므로 `backend-reviewer`와 `po-reviewer`가 필요하다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: Prisma 관계 생성 순서, 반복 실행 가능성, 개발 fixture가 운영 데이터 계약으로 오해되지 않는지.
- PO reviewer가 확인할 내용: 캡처 대상 화면이 데이터 있는 상태로 확인 가능해지는지.

## 핸드오프

- 후속 작업은 이 seed를 적용한 뒤 Figma raw capture를 인증/상태별 화면으로 확장한다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-05-06: 사용자가 rich demo seed 생성 및 실행을 승인했다.
- 2026-05-06: 로컬 Postgres/Redis를 Docker Compose로 기동하고 migration 적용 후 rich demo seed를 실행했다.
- 2026-05-06: 반복 실행 검증을 위해 seed를 재실행했고, database package build 및 DB seed 카운트 조회를 완료했다.
- 2026-05-06: backend-reviewer가 KST 기준 날짜 drift를 지적해 `daysAgo()`를 KST fixture helper 기준으로 보정하고, activity check-in 시각을 토요일 활동 시간대에 맞췄다.
- 2026-05-06: 변경 후 `pnpm --filter @masters/database db:seed`, `pnpm --filter @masters/database build`, DB activity/check-in 요일 조회를 통과했다.
- 2026-05-06: backend-reviewer 재검토에서 repeatable upsert와 관계 무결성 보강이 필요하다는 변경 요청을 반영해 seeded relation reset/update와 workout type fail-fast guard를 추가했다.
- 2026-05-06: 수정 후 `pnpm --filter @masters/database db:seed`, `pnpm --filter @masters/database build`를 다시 통과했고, backend-reviewer/po-reviewer 승인 artifact를 갱신했다.

## 리뷰 노트

- Specialist review:
  - reviewer: backend-reviewer
  - reviewer protocol: `reviewers/protocols.json` overlay via `.codex/agents/backend-reviewer.toml`
  - artifact: `tasks/reviews/I-0016-180/backend-reviewer.json`
  - decision: approved
  - findings: no findings. `postWorkout`를 canonical reset으로 바꾸고, seeded parent/author/creator relation을 update 경로에서도 덮어쓰며, workout type lookup을 fail-fast로 바꿔 반복 실행 수렴성과 무결성을 확인했다.
  - residual risks: 외부 placeholder 이미지 URL은 여전히 네트워크 의존성이 있고, Prisma CLI query 실행은 이 환경에서 결과 row를 출력하지 않아 토요일 요일 증빙은 task note에 기록된 기존 DB 조회를 근거로 유지했다.
- PO review:
  - reviewer: po-reviewer
  - reviewer protocol: `reviewers/protocols.json` overlay via `.codex/agents/po-reviewer.toml`
  - artifact: `tasks/reviews/I-0016-180/po-reviewer.json`
  - decision: approved
  - findings: no findings. 모바일 raw capture용으로 필요한 사용자, 운동, 피드, 크루, 활동, 대화, 알림 fixture가 seed 재실행 후에도 안정적으로 유지되는 범위로 확인했다.
  - residual risks: 이번 세션에서는 실제 모바일 UI 캡처를 다시 수행하지 않았고, placeholder 이미지 서비스 가용성은 별도 운영 리스크로 남는다.
