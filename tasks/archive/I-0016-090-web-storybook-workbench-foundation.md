---
id: I-0016-090
title: Storybook 기반 consumer-web visual workbench를 시드
parent: I-0016-design-system-and-ux-guardrails
scope: web
owner: unassigned
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0016-080-web-mobile-profile-and-feed-edge-alignment.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
verify:
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web storybook:coverage
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
  - pnpm --filter @masters/web storybook -- --smoke-test
  - pnpm --filter @masters/web build-storybook
artifacts:
  - apps/web/package.json
  - apps/web/scripts/run-storybook.mjs
  - apps/web/scripts/check-storybook-coverage.mjs
  - .storybook/main.ts
  - .storybook/preview.tsx
  - apps/web/src/storybook/storybook-environment.ts
  - apps/web/src/storybook/storybook-fixtures.ts
  - apps/web/src/app/app-providers.tsx
  - design/frontend/ui-system.md
  - design/frontend/conventions.md
  - docs/runbooks/ui-ux-guardrail-review.md
---

## 목표

전체 라우트를 매번 직접 순회하지 않고도 consumer-web UI를 빠르게 점검하고 다듬을 수 있도록, `apps/web`용 Storybook 기반 visual workbench를 실제 운영 가능한 범위까지 확장한다.

## 완료 기준

- `apps/web`에서 Storybook이 실행되고 빌드된다.
- theme, query context, global CSS를 반영하는 공용 preview decorator와 Storybook 전용 browser/api mock 계층이 존재한다.
- `apps/web/src/components/**`의 각 component에 co-located story가 존재한다.
- story minimum contract와 coverage gate가 문서와 실행 스크립트에 반영된다.
- Storybook과 실라우트/Playwright를 언제 각각 써야 하는지 문서에 적힌다.

## 노트

- 범위는 `apps/ops-web`이 아니라 `apps/web`만 다룬다.
- Storybook은 전체 페이지 복제보다 component-level workbench를 우선하지만, 현재 task에서는 `components/**` 전 범위를 co-located stories로 덮는다.
- Storybook은 시각 작업대이고, 실제 라우팅/인증/뒤로가기 계약의 truth는 여전히 실앱과 Playwright다.
- 관련 UX 문서: `design/frontend/ui-system.md`, `design/frontend/conventions.md`, `design/frontend/visual-system-rules.md`, `docs/runbooks/ui-ux-guardrail-review.md`

## 셀프 리뷰

- 범위와 의도: `apps/web` Storybook을 foundation 수준에서 멈추지 않고, browser/api mock을 갖춘 workbench로 확장하고 `components/**` 전 컴포넌트에 co-located stories를 붙였다. 실라우트 복제나 `apps/ops-web` 확장은 범위에 넣지 않았다.
- source of truth: `design/initiatives/I-0016-design-system-and-ux-guardrails.md`, `design/frontend/ui-system.md`, `design/frontend/conventions.md`, `docs/runbooks/ui-ux-guardrail-review.md`
- 설계 divergence: 없음. workbench 범위는 문서대로 component-level visual workbench로 제한했고, 라우트 truth는 여전히 실앱/Playwright에 남겨 두었다. 후속 UI polish는 같은 task에 끼워 넣지 않고 `I-0016-100`~`I-0016-140`으로 분리했다.
- 코드와 구조: shared `AppProviders`로 앱 런타임과 Storybook preview를 같은 theme/query/auth shell에 맞췄고, `storybook-environment.ts`에서 Storybook 전용 browser/api mock을 제공했다. Storybook stories는 각 component 디렉터리에 co-locate했고, coverage gate 스크립트로 누락을 막았다.
- 검증:
  - `pnpm --filter @masters/web lint`
  - `pnpm --filter @masters/web storybook:coverage`
  - `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`
  - `pnpm --filter @masters/web storybook -- --smoke-test`
  - `pnpm --filter @masters/web build-storybook`
  - 참고: 기존 web lint에는 unrelated `react-hooks/exhaustive-deps` warning 2건(`apps/web/src/pages/profile/[id]/followers.tsx`, `apps/web/src/pages/profile/[id]/following.tsx`)이 남아 있지만 exit code는 0이며 이번 Storybook 작업 범위 밖이라 그대로 두었다.
- 리뷰 라우팅: consumer-web UI와 workflow가 함께 바뀌는 task이므로 `frontend-reviewer`, `ui-ux-reviewer`, `harness-reviewer`, `po-reviewer`. 현재 task는 review만 통과하면 archive로 옮길 closeout candidate이며, 후속 polish task는 별도 review 사이클로 이어간다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: Storybook 도입 범위가 라우트 전체 복제가 아니라 reusable UI와 대표 섹션 중심의 visual workbench로 잘 잘려 있는지 확인한다.
- PO reviewer가 확인할 내용: 이 follow-up이 디자인 시스템을 위한 디자인 시스템이 아니라, 실제 consumer-web polish 속도를 높이는 실행 단위로 정의되어 있는지 확인한다.

## 핸드오프

- 구현 시에는 Storybook foundation만으로 끝내지 말고, 바로 쓸 수 있는 starter stories까지 같은 changeset에서 시드한다.
- full-page route story보다, feed/post/profile/crew/workout을 대표하는 stable presentational sections를 우선 분리한다.
- Storybook foundation closeout 이후의 UI polish는 `I-0016-100`~`I-0016-140` task에서 실제 사용 흐름 기준으로 순차 진행한다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-07: Storybook을 바로 도입하지 않고도 후속 workstream이 보이도록 `I-0016` 아래 todo task로 시드했다.
- 2026-04-08: 루트 `.storybook/` 설정, shared preview decorator, starter stories, Storybook wrapper script를 추가해 `apps/web` visual workbench foundation을 구현했다.
- 2026-04-08: Storybook preview에 browser/api mock 계층을 추가하고, `apps/web/src/components/**` 전 컴포넌트에 co-located stories를 채웠다. coverage 확인용 `storybook:coverage` 스크립트도 함께 추가했다.
- 2026-04-08: Storybook foundation task를 closeout 후보로 올리고, 후속 UI polish 범위를 `Feed/Post`, `Profile`, `Crew`, `Workout`, `Discovery` 5개 흐름 task로 분리했다.

## 리뷰 노트

- Specialist review:
  - reviewer: frontend-reviewer
  - reviewer protocol: `.codex/agents/frontend-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/frontend-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-090/frontend-reviewer.json`
  - decision: approved
  - findings: none
  - residual risks: feed/post/profile/crew/workout/discovery polish 자체는 foundation 범위에 포함하지 않았으므로 `I-0016-100`~`I-0016-140`에서 이어서 다룬다.
  - reviewer: ui-ux-reviewer
  - reviewer protocol: `.codex/agents/ui-ux-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/ui-ux-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-090/ui-ux-reviewer.json`
  - decision: approved
  - findings: none
  - residual risks: Storybook workbench가 열렸지만 button affordance, profile hierarchy, crew/workout surface polish은 후속 task에서 순차적으로 다듬는다.
  - reviewer: harness-reviewer
  - reviewer protocol: `.codex/agents/harness-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/harness-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-090/harness-reviewer.json`
  - decision: approved
  - findings: none
  - residual risks: Storybook smoke/static build는 통과하지만 third-party `"use client"` bundle warning과 chunk-size warning은 현재 toolchain noise로 남아 있다.
- PO review:
  - reviewer: po-reviewer
  - reviewer protocol: `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-090/po-reviewer.json`
  - decision: approved
  - findings: none
  - residual risks: Storybook foundation은 닫을 수 있지만 실제 product polish는 후속 flow task들을 통해 계속 진행해야 한다.
