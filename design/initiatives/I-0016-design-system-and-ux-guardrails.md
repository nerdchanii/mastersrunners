# I-0016: 디자인 시스템 및 UX 가드레일

## 요약

소비자용 웹 앱의 UX 방향을 리서치 기반 제품 UX 규칙, 비주얼 시스템 규칙, 카피 규칙, 가벼운 자동 가드레일, 그리고 재사용 UI를 격리해서 다듬을 수 있는 시각 작업대 기준으로 명시해 레포의 현재 truth로 고정한다. 즉시 목표는 화면 전체를 다시 그리는 것이 아니라, 설명이 과하고 데모처럼 보이며 상호작용이 들쭉날쭉한 패턴이 다시 생기지 않도록 막는 것이다. 동시에 앱이 러너 중심 소셜 제품이라는 방향을 유지해야 한다.

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
- 자주 손보는 consumer-web UI를 전체 라우트를 매번 순회하지 않고도 점검할 수 있는 시각 작업대 방향을 정리한다.

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
- `tasks/archive/I-0016-090-web-storybook-workbench-foundation.md`

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
- Storybook 기반 visual workbench follow-up은 consumer-web UI 계층은 `frontend-reviewer`, `ui-ux-reviewer`, 실행 스크립트/작업흐름은 `harness-reviewer`로 본다.
- PO 리뷰는 결과물이 마케팅용 셸이 아니라 러너 중심 소셜 제품 방향을 유지하는지 확인한다.

## 태스크 분해

- `tasks/archive/I-0016-010-meta-web-ux-guardrail-foundation.md`
- `tasks/archive/I-0016-020-web-public-social-surface-alignment.md`
- `tasks/archive/I-0016-030-web-copy-and-auth-gate-alignment.md`
- `tasks/archive/I-0016-040-meta-ux-guardrail-checks-expansion.md`
- `tasks/archive/I-0016-050-web-public-profile-and-crew-route-alignment.md`
- `tasks/archive/I-0016-060-web-profile-workout-visibility-policy-followup.md`
- `tasks/archive/I-0016-070-web-follow-graph-route-protection-alignment.md`
- `tasks/archive/I-0016-080-web-mobile-profile-and-feed-edge-alignment.md`
- `tasks/archive/I-0016-090-web-storybook-workbench-foundation.md`
- `tasks/archive/I-0016-100-web-feed-post-action-flow-polish.md`
- `tasks/archive/I-0016-110-web-profile-identity-flow-polish.md`
- `tasks/archive/I-0016-120-web-crew-participation-flow-polish.md`
- `tasks/archive/I-0016-125-web-crew-announcement-composer.md`
- `tasks/archive/I-0016-126-web-crew-board-feed-and-profile-gutter.md`
- `tasks/active/I-0016-128-web-crew-hub-path-routing.md`
- `tasks/todo/I-0016-130-web-workout-capture-and-analysis-flow-polish.md`
- `tasks/todo/I-0016-140-web-discovery-and-participation-surface-flow-polish.md`
- `tasks/todo/I-0016-170-web-design-system-primitive-consolidation.md`
- `tasks/archive/I-0016-150-meta-storybook-build-output-depcruise-guard.md`
- `tasks/archive/I-0016-160-meta-storybook-knip-baseline-guard.md`

## 성공 기준

- 소비자용 웹 앱이 앞으로의 태스크가 참조할 수 있는 하나의 UX 규칙 세트를 갖는다.
- 공개 소셜 라우트가 읽기, 게이팅, 뒤로가기 동작에 대해 명시적인 공통 계약을 갖는다.
- 레포가 명백한 데모/설명형 문구에 대한 금지 패턴을 정의한다.
- CI/local 검사에서 1차 금지 문구와 공개 진입 UX 회귀를 잡아낸다.
- 이후 사용자용 웹 태스크를 채팅 기억이 아니라 구체적인 UX 문서 기준으로 리뷰할 수 있다.
- 후속 UI 다듬기 작업이 전체 라우트 순회 대신 격리된 visual workbench와 실라우트 검증을 병행하는 방식으로 진행될 수 있다.

## 진행 메모

- 2026-04-03: 현재 frontend conventions가 코드 중심적일 뿐, 공개 소셜 화면의 UX 품질과 제품 톤을 보호하지 못한다는 제품 피드백을 바탕으로 이 이니셔티브를 열었다.
- 2026-04-03: 제품 결정에 따라 게스트 `/feed`는 당분간 실시간 전체 공개 피드가 아니라 privacy-safe한 큐레이션 프리뷰 또는 제한된 목 데이터 표면으로 운영할 수 있도록 공개 정책을 정리했다.
- 2026-04-03: 최종 UX 리뷰에서 남은 리스크를 `게스트 프리뷰 affordance 정리`와 `공개 UX 회귀 검증 강화` 두 갈래로 나눠 후속 active 태스크로 착수했다.
- 2026-04-04: `I-0016-020`에서 게스트 `/feed` 프리뷰 affordance와 공개 게시글 참여 게이트를 정렬한 뒤, 남은 공개 프로필/크루 라우트 정렬 범위는 `I-0016-050`으로 분리했다.
- 2026-04-04: `I-0016-050`에서 공개 프로필을 `헤더 + 게시글 + 크루` 읽기 표면으로 열고, 공개 크루를 `summary + activity list + board list`까지만 허용하는 계약으로 정렬했다.
- 2026-04-04: `I-0016-050` closeout residual risk를 `공개 프로필 workout 정책`과 `followers/following 라우트 보호 정렬` 두 개의 후속 태스크로 다시 분리했다.
- 2026-04-04: 모바일 프로필 헤더 카드 UI와 피드/프로필 거터가 소비자용 소셜 표면과 어긋난다는 피드백에 따라 `I-0016-080`을 추가했다.
- 2026-04-04: `I-0016-030`을 닫으면서 공개 크루 상세와 메시지 허브의 설명형 helper copy를 줄이고, 섹션 제목과 empty state가 이미 말하는 내용을 반복하지 않는 문구 규칙을 문서 truth로 보강했다.
- 2026-04-04: `I-0016-060`에서 타인 공개 프로필의 workout 비노출을 영구 정책으로 닫고, web surface뿐 아니라 profile API aggregate도 같은 privacy 경계를 따르도록 정렬했다.
- 2026-04-04: `I-0016-070`에서 followers/following을 공개 트리 밖의 본인 전용 보호 라우트로 옮기고, follow controller와 페이지 진입 흐름을 같은 정책으로 정렬했다.
- 2026-04-07: 전체 web surface를 매번 수동 순회하지 않고 consumer UI를 빠르게 다듬을 수 있도록, `I-0016-090`에서 Storybook 기반 visual workbench follow-up을 backlog로 시드했다.
- 2026-04-08: `I-0016-090`에서 `apps/web`용 Storybook foundation과 shared preview decorator, starter stories, review guidance를 구현해 visual workbench를 실제로 열었다.
- 2026-04-08: 같은 `I-0016-090` 안에서 Storybook harness를 browser/api mock 레이어로 확장하고, `apps/web/src/components/**` 전 컴포넌트에 co-located stories를 채워 coverage gate까지 붙였다.
- 2026-04-08: Storybook foundation을 closeout 후보로 고정하고, 이후 UI 다듬기 작업을 `Feed/Post`, `Profile`, `Crew`, `Workout`, `Discovery` 5개 polishing task로 분리했다.
- 2026-04-09: `I-0016-110`에서 profile identity flow를 `ProfileHeader` / `ProfileStats` / `ProfileTabs`로 분리해, Storybook에서 header → stats → tabs → preview list rhythm을 한 번에 검토할 수 있게 정리했다.
- 2026-04-09: 같은 `I-0016-110` 후속 polish에서 stats를 다시 header identity block 안으로 합치고, posts/workouts/crew posts를 `/feed` surface language에 맞춰 profile 전용 preview card보다 feed-like interaction을 우선하도록 조정했다.
- 2026-04-08: `I-0016-090` push 단계에서 Storybook generated output이 dependency-cruiser 입력으로 섞여 merge를 막아, generated 산출물 제외 규칙을 `I-0016-150` follow-up으로 분리했다.
- 2026-04-08: 같은 push 단계에서 knip가 Storybook wiring을 false positive로 잡아, Storybook baseline 예외를 `I-0016-160` follow-up으로 분리했다.
- 2026-04-11: crew 참여/허브 작업을 진행하면서 아이콘 버튼, 라운드 값, 액션 래퍼가 여러 화면에서 제각각 다시 생길 수 있다는 문제가 드러나 `I-0016-170`으로 디자인 시스템 프리미티브를 더 작은 재사용 단위로 묶는 후속 정비를 추가했다. 우선순위는 `icon button`, 공통 `pill/tag` 스타일, 그리고 crew/workout/messages에 흩어진 primitive wrapper를 버튼/태그 컴포넌트로 흡수하는 것이다.
- 2026-05-04: `I-0016-128`에서 크루 허브를 path 기반 탭으로 정리하면서 운영진 전용 가입대기를 `/crews/:id/pending` 1차 탭으로 분리했다.
