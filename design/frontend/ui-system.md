---
doc_state: current
owner: frontend
last_verified: 2026-04-09
sources:
  - apps/web/package.json
  - apps/web/vite.config.ts
  - .storybook/main.ts
  - .storybook/preview.tsx
  - apps/web/src/storybook/storybook-environment.ts
  - apps/web/src/storybook/storybook-fixtures.ts
  - apps/web/src/globals.css
  - apps/web/src/app/app-providers.tsx
  - apps/web/src/lib/theme-context.tsx
  - apps/web/src/components/ui/button.tsx
  - apps/web/src/components/ui/sonner.tsx
  - apps/web/src/lib/utils.ts
---

# UI 시스템

## 요약

현재 UI 스택은 Tailwind CSS v4와 shadcn 스타일 프리미티브를 기반으로 하며, 디자인 토큰은 `globals.css`의 CSS custom property로 표현된다.

## 스타일링 스택

- Vite가 CSS와 React의 빌드/런타임 경계를 제공한다.
- Storybook visual workbench는 루트 `.storybook/` 설정으로 `apps/web` 컴포넌트를 Vite 기반으로 렌더링한다.
- Storybook preview 레이어는 현재 JSX runtime 차이 때문에 `.storybook/preview.tsx`에서 React import를 명시적으로 유지한다.
- Storybook iframe은 `apps/web/index.html`의 font/body baseline을 자동 상속하지 않으므로 `.storybook/preview-head.html`과 `.storybook/preview-body.html`에서 앱과 같은 기본 shell을 맞춘다.
- `globals.css`는 Tailwind, `tw-animate-css`, shadcn 테마 헬퍼, Leaflet CSS를 import한다.
- color, radius, chart, sidebar 토큰은 CSS 변수로 정의된다.
- Tailwind 테마 별칭은 `@theme inline`을 통해 해당 변수에 매핑된다.
- `apps/web`의 UI primitive는 Next.js 전용 `"use client"` 경계 없이도 동작하는 일반 React 컴포넌트로 유지한다.

## 테마 모델

- `ThemeProvider`는 테마 선택값을 `localStorage`에 저장한다.
- DOM 레벨 전환은 `<html>`의 `.dark` 클래스로 처리한다.
- 현재 지원하는 모드는 `light`, `dark`, `system` 세 가지뿐이다.
- 앱과 Storybook preview는 모두 `AppProviders`를 통해 같은 theme/query/auth shell을 공유한다.
- `components/ui/sonner.tsx`는 현재 active theme를 따라가므로, workbench에서도 토스트 색과 surface tone이 실앱과 같은 규칙을 따른다.

## Visual Workbench

- Storybook은 `pnpm --filter @masters/web storybook`과 `pnpm --filter @masters/web build-storybook`으로 실행한다.
- preview decorator는 global CSS, Query Client, ThemeProvider, AuthProvider, MemoryRouter를 공통으로 감싼다.
- Storybook preview는 `apps/web/src/storybook/storybook-environment.ts`의 browser/api mock을 함께 설치해 `api.fetch`, `navigator.share`, `IntersectionObserver`, `EventSource`, `matchMedia`, `URL.createObjectURL` 같은 의존성을 deterministic하게 재현한다.
- Storybook workbench는 `apps/web/src/components/**`의 co-located stories를 기준으로 유지한다.
- 각 component story의 최소 계약은 `Playground` 또는 직접 조작 가능한 대표 story 1개와, 필요 시 `States`/`Variants`/`Interaction`로 상태 차이를 드러내는 것이다.
- `pnpm --filter @masters/web storybook:coverage`는 모든 `components/**/*.tsx`에 대응하는 `*.stories.tsx`가 있는지 확인하는 coverage gate다.
- `/feed`, `/posts/:id`, `/profile/:id`, `/crews/:id`, `/workouts/:id` 같은 실제 라우트 계약의 truth는 여전히 실앱과 Playwright다.
- feed/post action row와 guest gate는 signed-in/guest 비교 story를 기본으로 두고, 행동이 막히는 순간의 copy와 affordance를 같은 언어로 검토한다.
- profile identity flow는 `ProfileHeader`, `ProfileStats`, `ProfileTabs`를 따로 떼어 보되, 실제 프로필 화면에서는 stats가 header 안의 같은 identity block으로 읽혀야 한다. Storybook에서는 `header(embedded stats) → tabs → preview feed`의 리듬이 `/feed`와 어긋나지 않는지 확인한다.
- profile header의 own/following/private/pending variant는 avatar, name, bio, record block, action area 높이 차이가 과도하지 않게 같은 baseline을 유지해야 한다.
- profile header의 PB는 outline chip이 아니라 bio 아래 이어지는 record line으로 표시한다. 현재 schema/API는 초 단위 PB만 저장하므로 race name/date 같은 메타데이터 표시는 별도 후속 과업 없이는 넣지 않는다.
- profile tabs의 posts/workouts는 profile 전용 preview card를 새로 만들기보다 `/feed` surface language를 재사용하고, crews tab도 crew info card가 아니라 crew post feed처럼 읽혀야 한다.
- stories는 `components/ui`, `components/common`, `components/layout`, `components/feed`, `components/profile`, `components/post`, `components/social`, `components/challenge`, `components/event`, `components/crew`, `components/workout` 아래에 co-locate한다.

## 컴포넌트 컨벤션

- 재사용 가능한 프리미티브는 `components/ui` 아래에 둔다
- variant는 보통 `class-variance-authority`로 모델링한다
- 클래스 조합은 `lib/utils.ts`의 `cn()`을 사용한다
- 셸 레벨 공용 UX 컴포넌트는 `components/common`, `components/layout` 아래에 둔다
- `components/ui`는 기본 프리미티브 레이어이며, 모든 제품 섹션을 카드 크롬으로 감싸도 된다는 뜻이 아니다.
- 소비자용 소셜 화면은 기본적으로 섹션/구분선/미디어 중심 구성을 따르고, 카드가 필요한 경우는 경계 자체가 중요한 상황으로 제한한다.

## UX 규칙 참고 문서

- 제품 수준의 UX 방향은 `design/frontend/ux-principles.md`에 정리한다.
- 공개 소셜 라우트 패턴은 `design/frontend/social-surface-patterns.md`에 정리한다.
- 소비자용 웹 문구 규칙은 `design/frontend/writing-and-copy.md`에 정리한다.
- 비주얼 시스템 사용 규칙은 `design/frontend/visual-system-rules.md`에 정리한다.

## 현재 제약

- 현재 활성 테마 구현은 로컬 `ThemeProvider`이며, `apps/web`는 Next.js 전용 테마 헬퍼에 의존하지 않는다.
- UI 프리미티브 레이어는 비교적 일관적이지만, 라우트 페이지는 여전히 많은 오케스트레이션과 조건부 렌더링을 직접 책임진다.
- Storybook smoke verify는 upstream `storybook dev --smoke-test` invariant를 피하기 위해 repo-local wrapper가 one-shot static smoke build로 정규화한다.
