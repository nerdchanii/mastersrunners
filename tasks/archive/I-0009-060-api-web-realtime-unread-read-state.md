---
id: I-0009-060
title: Move unread and read state to one realtime socket
parent: I-0009-crew-messaging-ux
scope: api-web-docs
owner: codex
reviewers:
  - backend-reviewer
  - frontend-reviewer
  - ui-ux-reviewer
  - docs-reviewer
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/realtime/realtime.gateway.spec.ts src/notifications/notifications.service.spec.ts
  - pnpm --filter @masters/web test -- --runTestsByPath src/lib/realtime-context.test.tsx src/hooks/useChatWindow.test.tsx
  - pnpm --filter @masters/api build
  - VITE_API_URL=https://dev.mastersrunners.com/api/v1 pnpm --filter @masters/web build
  - pnpm typecheck
  - pnpm lint
  - bash -lc 'if rg -n "notifications/sse|conversations/sse|notification SSE|ConversationSse|NotificationsSse|EventSource" apps docs design | rg -v "^design/adr/ADR-000[4-6]"; then echo "Unexpected live SSE/EventSource references remain."; exit 1; else exit 0; fi'
  - bash scripts/check-active-task-closeout.sh
artifacts:
  - apps/api/src/realtime/realtime.gateway.ts
  - apps/api/src/realtime/realtime-events.service.ts
  - apps/web/src/lib/realtime-context.tsx
  - docs/domain/dm.md
  - design/architecture/storage-realtime-data-flow.md
---

## 목표

브라우저가 하나의 `/realtime` socket.io 연결로 DM, 크루 채팅, 활동 채팅, notification unread/read 상태를 받도록 정리하고 기존 unread polling과 SSE 스트림을 제거한다.

## 완료 기준

- `/realtime` socket namespace가 채팅 메시지, 채팅 읽음, notification 생성/읽음 이벤트를 처리한다.
- 프런트엔드는 badge 갱신을 위한 반복 unread polling과 `EventSource`를 사용하지 않는다.
- `GET /conversations/sse`, `GET /notifications/sse`, 관련 SSE service가 제거된다.
- 현재 도메인/아키텍처/운영 문서가 단일 realtime socket 구조와 일치한다.

## 노트

- REST unread endpoints는 초기 snapshot과 호환용으로 유지한다.
- DM, 크루, 활동 conversation은 같은 `Conversation` 모델과 같은 realtime event contract를 사용한다.
- 이 작업은 비용 절감 목적의 transport 정리이며 presence, typing, delivery receipt는 범위 밖이다.

## 셀프 리뷰

- 범위와 의도: unread/read 상태를 `/realtime` socket.io 연결 하나로 통합하고, 기존 conversation/notification SSE 및 notification unread polling을 제거하는 데 집중했다. Presence, typing, delivery receipt, Redis fan-out은 범위 밖으로 유지했다.
- source of truth: `apps/api/src/realtime/realtime.gateway.ts`, `apps/api/src/realtime/realtime-events.service.ts`, `apps/web/src/lib/realtime-context.tsx`, `docs/domain/dm.md`, `design/architecture/storage-realtime-data-flow.md`, `design/backend/messaging-realtime.md`, `design/adr/ADR-0006-single-realtime-socket-for-chat-and-notifications.md`.
- 설계 divergence: 기존 구현은 notification SSE와 unread polling이 남아 있었고, 이 작업에서 current docs와 구현을 `/realtime` 단일 socket 기준으로 맞췄다. 남은 multi-instance fan-out 한계는 기존과 동일하게 문서화했다.
- 검증: realtime gateway, notification service, realtime provider, chat window 테스트와 API/web build, workspace typecheck/lint, historical ADR만 제외하는 SSE/EventSource 잔재 검색을 통과했다.
- 리뷰 라우팅: backend-reviewer는 gateway auth/fan-out/read 상태를, frontend-reviewer는 provider/cache/read UX를, ui-ux-reviewer는 unread badge와 읽음 반영의 사용자-facing 피드백을, docs-reviewer는 문서 동기화를, harness-reviewer는 verify/task 상태를, po-reviewer는 비용 절감과 사용자 가치 범위를 확인한다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: socket auth, room fan-out, read/unread cache consistency, SSE 제거 후 문서 동기화.
- PO reviewer가 확인할 내용: 사용자에게 채팅/알림 badge가 더 자연스럽고 비용 유발 중복 polling이 제거되는지.

## 핸드오프

- 후속 작업이 있다면 Cloud Run 비용 재측정은 배포 후 로그/latency 기준으로 별도 확인한다.

## 설계 divergence

- 현재 구현은 문서의 “전역 chat socket” 목표와 달리 notification SSE 및 unread polling을 함께 사용한다. 이 task에서 repo truth와 구현을 `/realtime` 단일 socket 기준으로 맞춘다.

## 시도 로그

- 2026-04-28: 사용자 승인 계획에 따라 `/realtime` 단일 socket 리팩토링 작업을 시작했다.

## 리뷰 노트

- Specialist review:
  - reviewer: backend-reviewer
  - reviewer protocol: reviewers/protocols.json + .codex/agents/backend-reviewer.toml + .agents/skills/review-output-contract/SKILL.md + .agents/skills/backend-review-checklist/SKILL.md
  - artifact: tasks/reviews/I-0009-060/backend-reviewer.json
  - decision: approved
  - findings: 없음.
  - residual risks: realtime fan-out은 여전히 process-local 한계가 있으므로 multi-instance delivery는 후속 인프라 작업이 필요하다. focused backend regression은 unread recount failure와 raw 2000자 websocket message boundary를 보호하지만 reconnect edge case는 별도 runtime sanity check가 필요하다.
- Specialist review:
  - reviewer: frontend-reviewer
  - reviewer protocol: reviewers/protocols.json + .codex/agents/frontend-reviewer.toml + .agents/skills/review-output-contract/SKILL.md + .agents/skills/frontend-review-checklist/SKILL.md
  - artifact: tasks/reviews/I-0009-060/frontend-reviewer.json
  - decision: approved
  - findings: 없음.
  - residual risks: unread badge ownership이 shared realtime provider로 모였으므로 이후 shell-level badge 변경은 이 cache contract를 기준으로 다시 확인해야 한다. full browser reconnect cycle은 이번 verify 범위 밖이다.
- Specialist review:
  - reviewer: ui-ux-reviewer
  - reviewer protocol: reviewers/protocols.json + .codex/agents/ui-ux-reviewer.toml + .agents/skills/review-output-contract/SKILL.md + .agents/skills/ui-ux-review-checklist/SKILL.md
  - artifact: tasks/reviews/I-0009-060/ui-ux-reviewer.json
  - decision: approved
  - findings: 없음.
  - residual risks: unread/read feedback의 체감 부드러움은 live browser에서 desktop/mobile shell sanity check가 한 번 더 있으면 좋다. richer presence/typing cue는 여전히 범위 밖이다.
- Specialist review:
  - reviewer: docs-reviewer
  - reviewer protocol: reviewers/protocols.json + .codex/agents/docs-reviewer.toml + .agents/skills/review-output-contract/SKILL.md + .agents/skills/docs-review-checklist/SKILL.md
  - artifact: tasks/reviews/I-0009-060/docs-reviewer.json
  - decision: approved
  - findings: 없음.
  - residual risks: historical ADR은 의도적으로 SSE를 언급하므로 이후 transport 검색도 archived decision과 current doc를 구분해야 한다. realtime deployment proof는 여전히 manual operator step이다.
- Specialist review:
  - reviewer: harness-reviewer
  - reviewer protocol: reviewers/protocols.json + .codex/agents/harness-reviewer.toml + .agents/skills/review-output-contract/SKILL.md + .agents/skills/harness-review-checklist/SKILL.md
  - artifact: tasks/reviews/I-0009-060/harness-reviewer.json
  - decision: approved
  - findings: 없음.
  - residual risks: SSE 제거 검증은 historical ADR 제외 규칙을 유지해야 한다. active-task closeout automation은 live realtime deployment behavior까지 대신 검증하지는 않는다.
- PO review:
  - reviewer: po-reviewer
  - reviewer protocol: reviewers/protocols.json + .codex/agents/po-reviewer.toml + .agents/skills/review-output-contract/SKILL.md + .agents/skills/po-review-checklist/SKILL.md
  - artifact: tasks/reviews/I-0009-060/po-reviewer.json
  - decision: approved
  - findings: 없음.
  - residual risks: duplicated unread transport 비용과 badge consistency 문제는 닫혔지만 multi-instance fan-out과 richer messaging UX는 이번 task 범위 밖이다. 실제 Cloud Run 비용 절감량은 handoff에 적은 대로 배포 후 재측정이 필요하다.
