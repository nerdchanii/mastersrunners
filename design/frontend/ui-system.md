---
doc_state: current
owner: frontend
last_verified: 2026-05-05
sources:
  - apps/web/package.json
  - apps/web/vite.config.ts
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
- `globals.css`는 Tailwind, `tw-animate-css`, shadcn 테마 헬퍼, Leaflet CSS를 import한다.
- color, radius, chart, sidebar 토큰은 CSS 변수로 정의된다.
- Tailwind 테마 별칭은 `@theme inline`을 통해 해당 변수에 매핑된다.
- UI primitive는 특정 프레임워크 전용 경계나 라우터 전제에 묶지 않고, 현재 `apps/web` 런타임에서 바로 재사용 가능한 일반 React 컴포넌트로 유지한다.

## 테마 모델

- `ThemeProvider`는 테마 선택값을 `localStorage`에 저장한다.
- DOM 레벨 전환은 `<html>`의 `.dark` 클래스로 처리한다.
- 현재 지원하는 모드는 `light`, `dark`, `system` 세 가지뿐이다.
- 앱은 `AppProviders`를 통해 theme/query/auth shell을 공유한다.
- `components/ui/sonner.tsx`는 현재 active theme를 따라가므로, 토스트 색과 surface tone은 실앱 테마 규칙을 따른다.

## UI 검증 기준

- Storybook은 `I-0020`에서 퇴역했다. UI 검증의 현재 truth는 실앱 라우트, Playwright 계약, 설계 문서, reviewer protocol이다.
- `/feed`, `/posts/:id`, `/profile/:id`, `/crews/:id`, `/workouts/:id` 같은 실제 라우트 계약은 실앱과 Playwright로 검증한다.
- component-level polish가 필요하면 해당 컴포넌트를 실제 라우트 또는 좁은 test harness에서 검토하고, 장기 기준은 `design/frontend/visual-system-rules.md`와 관련 도메인 문서에 반영한다.
- 상태가 UX를 바꾸는 surface는 happy path 하나로 끝내지 않고, 권한 차이, 데이터 유무, 로딩/빈 상태, 주요 overlay open 상태를 실앱 흐름이나 Playwright 시나리오에서 확인한다.
- fetch나 브라우저 API를 품은 화면은 ad hoc mock UI를 늘리기보다 API fixture, route-level test, Playwright mock을 사용해 재현한다.
- 라우트 수준 검토가 필요한 경우에는 section 간 위계, action rhythm, copy tone, panel composition을 실제 viewport에서 확인한다.
- 반복되는 UX 기준은 특정 화면에만 고정하지 않고, 유사한 surface 전반에서 재사용 가능한 규칙으로 문서화한다.

## 컴포넌트 컨벤션

- 재사용 가능한 프리미티브는 `components/ui` 아래에 둔다
- variant는 보통 `class-variance-authority`로 모델링한다
- 클래스 조합은 `lib/utils.ts`의 `cn()`을 사용한다
- 셸 레벨 공용 UX 컴포넌트는 `components/common`, `components/layout` 아래에 둔다
- `components/ui`는 기본 프리미티브 레이어이며, 모든 제품 섹션을 카드 크롬으로 감싸도 된다는 뜻이 아니다.
- 소비자용 소셜 화면은 기본적으로 섹션/구분선/미디어 중심 구성을 따르고, 카드가 필요한 경우는 경계 자체가 중요한 상황으로 제한한다.
- 새 surface를 만들 때는 "어떤 컴포넌트를 더 추가할까"보다 "이 화면이 기존 surface language를 얼마나 재사용하고, 어디서만 새 예외를 허용할까"를 먼저 판단한다.
- 특정 피드백에서 나온 수정 요청은 그대로 규칙으로 승격하지 않는다. 반복되는 문제를 추상화해 spacing, hierarchy, action prominence, copy tone, state visibility 같은 판단 기준으로 문서화한다.

## UX 규칙 참고 문서

- 제품 수준의 UX 방향은 `design/frontend/ux-principles.md`에 정리한다.
- 공개 소셜 라우트 패턴은 `design/frontend/social-surface-patterns.md`에 정리한다.
- 소비자용 웹 문구 규칙은 `design/frontend/writing-and-copy.md`에 정리한다.
- 비주얼 시스템 사용 규칙은 `design/frontend/visual-system-rules.md`에 정리한다.

## 현재 제약

- 현재 활성 테마 구현은 로컬 `ThemeProvider`이며, `apps/web`는 Next.js 전용 테마 헬퍼에 의존하지 않는다.
- UI 프리미티브 레이어는 비교적 일관적이지만, 라우트 페이지는 여전히 많은 오케스트레이션과 조건부 렌더링을 직접 책임진다.
- Storybook 제거 이후 component isolation이 필요한 경우에는 새 도구를 먼저 도입하지 말고, 실제 라우트 검증으로 충분한지 확인한 뒤 별도 initiative로 평가한다.
