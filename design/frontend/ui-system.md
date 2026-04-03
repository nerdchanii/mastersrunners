---
doc_state: current
owner: frontend
last_verified: 2026-03-12
sources:
  - apps/web/package.json
  - apps/web/vite.config.ts
  - apps/web/src/globals.css
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

## 테마 모델

- `ThemeProvider`는 테마 선택값을 `localStorage`에 저장한다.
- DOM 레벨 전환은 `<html>`의 `.dark` 클래스로 처리한다.
- 현재 지원하는 모드는 `light`, `dark`, `system` 세 가지뿐이다.

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

- `components/ui/sonner.tsx`는 아직 `"use client"`를 포함하고 `theme="light"`를 고정하고 있어, 커스텀 테마 컨텍스트를 완전히 반영하지 못한다.
- `next-themes`는 여전히 `apps/web/package.json`에 남아 있지만, 현재 활성 테마 구현은 로컬 `ThemeProvider`다.
- UI 프리미티브 레이어는 비교적 일관적이지만, 라우트 페이지는 여전히 많은 오케스트레이션과 조건부 렌더링을 직접 책임진다.
