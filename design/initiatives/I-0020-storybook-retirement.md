# I-0020: Storybook 퇴역

## Summary

Storybook을 `mastersrunners`의 공식 UI 관리 도구에서 제거하고, 소비자용 웹 UI 검증 기준을 실앱, Playwright, 설계 문서 리뷰 중심으로 되돌린다.

## Problem

Storybook은 reusable UI와 대표 surface를 빠르게 다듬는 workbench로 도입됐지만, 실제 운영에서는 story, fixture, mock, wrapper, dependency 예외가 별도 관리면으로 늘었다. 그 결과 UI truth가 실앱과 Storybook 사이에 나뉘고, 관리되지 않는 story가 오히려 변경 부담을 키운다.

## Goals

- Storybook runtime, scripts, stories, fixture/mock helper, dependency를 제거한다.
- Storybook 전용 lint, typecheck, dependency, dead-code 예외를 정리한다.
- 현재 설계 문서와 UX 런북에서 Storybook 기반 검증 지시를 제거한다.
- Storybook 기반 todo task를 obsolete archive로 닫고, 이후 UI 검증은 실앱과 Playwright 기준으로 진행한다.
- Storybook 제거로 surfaced된 `depcruise`/`knip` production dead code와 import-cycle cleanup은 같은 changeset 안에서 정리한다.

## Non-Goals

- 과거 archive와 review artifact의 감사 기록을 삭제하지 않는다.
- 이번 작업에서 소비자용 웹 UI를 재디자인하지 않는다.
- Storybook fixture를 별도 mock 데이터 시스템으로 이관하지 않는다.

## Scope

- `apps/web/package.json`
- `pnpm-lock.yaml`
- `.storybook/`
- `apps/web/src/**/*.stories.tsx`
- `apps/web/src/storybook/`
- `apps/web/scripts/run-storybook.mjs`
- `apps/web/scripts/check-storybook-coverage.mjs`
- `knip.json`
- `eslint.config.mjs`
- `.dependency-cruiser.cjs`
- `.gitignore`
- `apps/web/tsconfig.json`
- `design/frontend/`
- `docs/runbooks/ui-ux-guardrail-review.md`
- `apps/web/src/hooks/notification-keys.ts`
- `apps/web/src/hooks/useNotifications.ts`
- `apps/web/src/lib/realtime-context.tsx`
- `apps/web/src/lib/realtime-context.test.tsx`
- `apps/web/src/components/crew/CrewHubQuickActions.tsx`
- `apps/web/src/components/crew/crew-hub-context.ts`
- `apps/web/src/components/crew/crew-hub-routes.ts`
- `tasks/archive/I-0016-120-web-crew-participation-flow-polish.md`
- `tasks/archive/I-0016-130-web-workout-capture-and-analysis-flow-polish.md`
- `tasks/archive/I-0016-140-web-discovery-and-participation-surface-flow-polish.md`

## Design References

- `design/frontend/ui-system.md`
- `design/frontend/conventions.md`
- `docs/runbooks/ui-ux-guardrail-review.md`
- `design/initiatives/I-0016-design-system-and-ux-guardrails.md`

## Review Plan

- `frontend-reviewer`: web build/type/lint 영향과 production import 경계 확인
- `harness-reviewer`: package scripts, lockfile, knip, depcruise, generated artifact rules 확인
- `docs-reviewer`: current design truth와 runbook에서 Storybook 운영 지시가 제거됐는지 확인
- `ui-ux-reviewer`: Storybook 제거 후 UX 검증 기준이 실앱/Playwright 중심으로 충분히 명확한지 확인
- `po-reviewer`: 관리 포인트 축소라는 제품/운영 목표가 달성됐는지 확인

## Task Breakdown

- `tasks/archive/I-0020-010-repo-storybook-retirement.md`

## Success Criteria

- `apps/web`에 Storybook 명령, dependency, config, helper, story 파일이 남지 않는다.
- 현재 설계 문서와 runbook이 Storybook을 UI 검증 기준으로 요구하지 않는다.
- obsolete Storybook todo task가 archive로 이동한다.
- `pnpm --filter @masters/web lint`, `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`, `pnpm depcruise`, `pnpm knip`가 Storybook 제거 후 통과한다.
