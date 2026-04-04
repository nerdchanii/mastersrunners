# I-0016: 디자인 시스템 및 UX 가드레일

## 요약

소비자용 웹 앱의 UX 방향을 리서치 기반 제품 UX 규칙, 비주얼 시스템 규칙, 카피 규칙, 가벼운 자동 가드레일로 명시해 레포의 현재 truth로 고정한다. 즉시 목표는 화면 전체를 다시 그리는 것이 아니라, 설명이 과하고 데모처럼 보이며 상호작용이 들쭉날쭉한 패턴이 다시 생기지 않도록 막는 것이다. 동시에 앱이 러너 중심 소셜 제품이라는 방향을 유지해야 한다.

## 문제

레포에는 라우트와 기능 문서가 이미 잘 정리되어 있지만, 아래 항목을 하나로 묶는 명시적인 UX 제어면은 아직 없다.

- 공개 탐색과 참여 경계
- 인터페이스 카피 톤
- 카드 래퍼를 언제 허용할지
- 인증 유도/오버레이 주변에서 브라우저 뒤로가기가 어떻게 동작해야 하는지
- 러너 상세 화면이 일반적인 소셜 카드와 어떻게 달라야 하는지

이 체계가 없으면 제품 피드백을 태스크마다 다시 설명해야 하고, 코드 자체는 맞더라도 사용자 경험 회귀가 반복될 수 있다.

## 목표

- 소비자용 웹 앱의 현재 UX 원칙을 한 곳에 정의한다.
- 그 원칙을 외부 UX 가이드와 러너 제품 레퍼런스에 근거해 고정한다.
- 피드, 게시글, 크루, 프로필, 인증 유도에 대한 라우트 수준의 공개 소셜 패턴을 문서화한다.
- 데모처럼 보이거나 과도하게 설명하는 언어를 막는 1차 문구 규칙을 정의한다.
- 카드 사용, 위계, 화면 구성에 대한 비주얼 시스템 규칙을 정의한다.
- 금지 카피와 공개 진입 UX 회귀를 잡아내는 좁고 명확한 자동 가드레일을 추가한다.

## 비목표

- 모든 화면을 한 번에 재디자인하지 않는다.
- 제품 규칙이 선명해지기 전에 토큰/컴포넌트 기반의 완전한 디자인 시스템을 먼저 만들지 않는다.
- API 계약이나 DB 스키마를 바꾸지 않는다.
- `apps/ops-web`은 1차 UX 규칙 대상에 포함하지 않는다.

## 범위

- `design/frontend/ux-principles.md`
- `design/frontend/social-surface-patterns.md`
- `design/frontend/writing-and-copy.md`
- `design/frontend/visual-system-rules.md`
- `design/frontend/conventions.md`
- `design/frontend/ui-system.md`
- `design/frontend/app-shell-routing.md`
- `design/frontend/workout-experience.md`
- `design/frontend/crew-experience.md`
- `design/frontend/social-profile.md`
- `design/frontend/README.md`
- `docs/runbooks/ui-ux-guardrail-review.md`
- `docs/guides/review-harness.md`
- `tasks/_templates/TASK-TEMPLATE.md`
- `apps/web/src/pages/feed/index.tsx`
- `apps/web/e2e/public-entry-auth.spec.ts`
- `apps/web/e2e/ux-contract.spec.ts`
- `apps/web/e2e/helpers/public-entry-fixtures.ts`
- `scripts/check-ux-copy-patterns.mjs`
- `scripts/ci-local.sh`
- `.github/workflows/ci.yml`
- `package.json`

## 설계 참고 문서

- `design/frontend/app-shell-routing.md`
- `design/frontend/workout-experience.md`
- `design/frontend/crew-experience.md`
- `design/frontend/social-profile.md`
- `design/frontend/conventions.md`
- `design/frontend/ui-system.md`
- `docs/reports/i-0014-ui-bug-board.md`

## 외부 참고 자료

- Apple Human Interface Guidelines, Launching: https://developer.apple.com/design/human-interface-guidelines/launching/
- Apple Human Interface Guidelines, Onboarding: https://developer.apple.com/design/human-interface-guidelines/onboarding
- Apple, Writing for interfaces: https://developer.apple.com/videos/play/wwdc2022/10037/
- Baymard, Account Sign-In Flows: https://baymard.com/blog/account-sign-in-flows
- Baymard, Back Button Expectations: https://baymard.com/blog/back-button-expectations
- Material Design, Dialogs: https://m1.material.io/components/dialogs.html
- Material Design, Empty States: https://m1.material.io/patterns/empty-states.html
- Strava Support, Viewing Activities: https://support.strava.com/hc/en-us/articles/216917457-Viewing-Activities
- Strava Support, Activity Privacy Controls: https://support.strava.com/hc/en-us/articles/216919377-Activity-Privacy-Controls
- Strava Support, Clubs on the Mobile App: https://support.strava.com/hc/en-us/articles/221622188-Clubs-on-the-Mobile-App
- COROS Help Center, Activity List and Activity Summary: https://support.coros.com/hc/en-us/articles/360039842452-Activity-List-and-Activity-Summary

## 리뷰 계획

- UX 기반 문서와 사용자 가드레일: `frontend-reviewer`, `ui-ux-reviewer`, `docs-reviewer`
- 레포 자동화와 태스크 템플릿 변경: `harness-reviewer`
- PO 리뷰는 결과물이 마케팅용 셸이 아니라 러너 중심 소셜 제품 방향을 유지하는지 확인한다.

## 태스크 분해

- `tasks/archive/I-0016-010-meta-web-ux-guardrail-foundation.md`
- `tasks/archive/I-0016-020-web-public-social-surface-alignment.md`
- `tasks/todo/I-0016-030-web-copy-and-auth-gate-alignment.md`
- `tasks/archive/I-0016-040-meta-ux-guardrail-checks-expansion.md`
- `tasks/archive/I-0016-050-web-public-profile-and-crew-route-alignment.md`

## 성공 기준

- 소비자용 웹 앱이 앞으로의 태스크가 참조할 수 있는 하나의 UX 규칙 세트를 갖는다.
- 공개 소셜 라우트가 읽기, 게이팅, 뒤로가기 동작에 대해 명시적인 공통 계약을 갖는다.
- 레포가 명백한 데모/설명형 문구에 대한 금지 패턴을 정의한다.
- CI/local 검사에서 1차 금지 문구와 공개 진입 UX 회귀를 잡아낸다.
- 이후 사용자용 웹 태스크를 채팅 기억이 아니라 구체적인 UX 문서 기준으로 리뷰할 수 있다.

## 진행 메모

- 2026-04-03: 현재 frontend conventions가 코드 중심적일 뿐, 공개 소셜 화면의 UX 품질과 제품 톤을 보호하지 못한다는 제품 피드백을 바탕으로 이 이니셔티브를 열었다.
- 2026-04-03: 제품 결정에 따라 게스트 `/feed`는 당분간 실시간 전체 공개 피드가 아니라 privacy-safe한 큐레이션 프리뷰 또는 제한된 목 데이터 표면으로 운영할 수 있도록 공개 정책을 정리했다.
- 2026-04-03: 최종 UX 리뷰에서 남은 리스크를 `게스트 프리뷰 affordance 정리`와 `공개 UX 회귀 검증 강화` 두 갈래로 나눠 후속 active 태스크로 착수했다.
- 2026-04-04: `I-0016-020`에서 게스트 `/feed` 프리뷰 affordance와 공개 게시글 참여 게이트를 정렬한 뒤, 남은 공개 프로필/크루 라우트 정렬 범위는 `I-0016-050`으로 분리했다.
- 2026-04-04: `I-0016-050`에서 공개 프로필을 `헤더 + 게시글 + 크루` 읽기 표면으로 열고, 공개 크루를 `summary + activity list + board list`까지만 허용하는 계약으로 정렬했다.
