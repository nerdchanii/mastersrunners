# Layout System Audit (as-is)

## Scope

`apps/web` 모바일 기준 레이아웃/여백 결정이 발생하는 “상위 쉘/래퍼”를 사실 위주로 정리한다.

## Layout Primitives / Responsibilities

### 1) Router `MainLayout`

File: `apps/web/src/router.tsx`

- 역할: 대부분의 라우트에서 공통 앱 쉘(헤더/바텀네비/`main`)을 제공하고, **페이지 바깥 여백/컨테이너/높이/하단 여백(pb)** 를 pathname 조건으로 결정한다.

관측된 클래스 분기(요약):

- 기본(대부분의 비-채팅/비-locked/비-예외 라우트)
  - `mx-auto max-w-5xl`
  - `px-4 py-4 pb-20 md:py-6 md:pb-6`
- Crew hub surface 라우트
  - `px-0 py-0 pb-20 md:pb-0`
- Profile surface 라우트(`/profile`, `/profile/:id`)
  - `px-0 py-0 pb-20 md:pb-6`
- Chat 라우트(`/messages...`)
  - `h-svh md:h-[calc(100svh-3.5rem)] md:px-0 md:py-0`
- Viewport-locked 라우트(`/crews/new`)
  - `flex h-[calc(100svh-4rem)] ... px-0 py-0`

ASCII:

```text
App -> MainLayout -> main(컨테이너/패딩/pb를 라우트별로) -> page component
```

### 2) `Header` (desktop)

File: `apps/web/src/components/layout/Header.tsx`

- 역할: 데스크톱 전용 상단 내비 쉘.
- 관측: 모바일에서는 숨김(`md:block`)이며, 내부 컨테이너를 별도로 정의한다.
  - `mx-auto ... max-w-5xl ... px-4`

### 3) `BottomNav` (mobile)

File: `apps/web/src/components/common/BottomNav.tsx`

- 역할: 모바일 하단 고정 내비(실제 높이/세이프에어 포함).
- 관측: `BottomNav` 자체는 `pb-[env(safe-area-inset-bottom)]`를 갖고, 페이지 콘텐츠는 `MainLayout`의 `pb-20` 등으로 “별도 보정”을 한다.

### 4) `ChatSplitLayout`

File: `apps/web/src/components/chat/ChatSplitLayout.tsx`

- 역할: 메시지 영역 전용 full-height 레이아웃 쉘.
- 관측: `MainLayout`이 chat 모드에서 height/padding 정책을 바꾸고, 그 위에 `ChatSplitLayout`이 다시 full-height/flex 레이아웃을 적용한다.

### 5) Profile surface 자체 리듬

Files:

- `apps/web/src/pages/profile/index.tsx`
- `apps/web/src/components/profile/ProfileHeader.tsx`
- `apps/web/src/components/profile/ProfileTabs.tsx`

- 역할: `MainLayout(px-0 ...)` 이후, 페이지 내부에서 `px-4 / sm:px-6` 등으로 가로 거터와 섹션 리듬을 재구축한다.
- 관측: sticky tabs에서 상단 오프셋을 CSS 변수로 관리한다(`--profile-tabs-mobile-top` 등).

### 6) Crew hub surface 자체 리듬

Files:

- `apps/web/src/pages/crews/[id]/index.tsx`
- `apps/web/src/pages/crews/[id]/CrewHubPanels.tsx`
- `apps/web/src/components/crew/CrewIdentityHero.tsx`

- 역할: `MainLayout(px-0 ...)` 이후, 패널/홈 섹션에서 `px-4`, `px-5`, `sm:px-10` 등으로 거터를 재구축한다.

## Common Spacing Patterns (observed)

### Outer page gutters (route shell)

- 기본 라우트: `px-4 py-4 pb-20` (모바일)
- 예외 라우트(프로필/크루 허브): `px-0 py-0 pb-20` (모바일)

### Max-width containers

관측된 전략이 혼재:

- `mx-auto max-w-*` (예: `max-w-5xl`, `max-w-2xl`, `max-w-3xl`, `max-w-4xl`)
- Tailwind `container max-w-*`

### Repeated vertical stacks

- `space-y-4`, `space-y-6`가 페이지 루트/섹션에서 반복 사용됨.

### Bottom spacing / safe-area compensation

- 라우트 쉘: `pb-20`
- 페이지/플로우별 추가 보정(예: `pb-32` 등)
- 컴포넌트 내 `pb-[env(safe-area-inset-bottom)]` 및 `calc(env(safe-area-inset-bottom)+...)` 패턴 존재

## Red Flags (factual)

- 라우트별 spacing 정책이 `MainLayout` 내부 pathname 분기(조건문)에 암묵적으로 존재한다.
- 동일한 Tailwind spacing literal(`px-4`, `pb-20`, `space-y-4/6`, `max-w-*`)이 여러 페이지/컴포넌트에서 반복된다.
- `/feed`는 라우트 쉘의 `px-4`를 `-mx-4`로 상쇄해 full-bleed를 만들며, 다른 페이지들은 “상쇄 없이 내부에서 재거터링”하는 방식이 많다(상세는 `analysis/pages/feed.md` 참고).
- 바텀네비 높이/세이프에어가 `BottomNav`/`MainLayout`/개별 페이지에 분산되어 “하단 여백”의 근거가 단일하지 않다.
