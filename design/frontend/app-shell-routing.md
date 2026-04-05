---
doc_state: current
owner: frontend
last_verified: 2026-04-04
sources:
  - apps/web/src/main.tsx
  - apps/web/src/router.tsx
  - apps/web/src/pages/feed/index.tsx
  - apps/web/src/pages/onboarding/index.tsx
  - apps/web/src/pages/profile/index.tsx
  - apps/web/src/pages/settings/profile/index.tsx
  - apps/web/src/components/layout/Header.tsx
  - apps/web/src/components/common/BottomNav.tsx
  - apps/web/src/components/common/LoadingPage.tsx
  - apps/web/src/components/common/ErrorBoundary.tsx
---

# 앱 셸과 라우팅

## 요약

웹 앱은 하나의 라우터 트리, 하나의 메인 셸, 그리고 protected-route 래퍼를 조합하는 Vite SPA다.

## 진입 구성

`apps/web/src/main.tsx`는 다음을 마운트한다.

- `QueryClientProvider`
- `RouterProvider`
- global `Toaster`

`apps/web/src/router.tsx`의 라우터 트리는 세 개의 셸 레이어를 정의한다.

- `RootLayout`: `ThemeProvider -> AuthProvider -> Outlet`
- `AuthLayout`: login-only shell
- `MainLayout`: `Header`, centered `<main>`, `BottomNav`, `Suspense`, location-scoped `ErrorBoundary`

## 라우트 모델

공개 라우트는 다음을 포함한다.

- `/` redirect entry for the public feed
- `/login` login-only shell
- `/feed`
- `/crews`, `/crews/:id`
- `/events`, `/events/:id`
- `/challenges`, `/challenges/:id`
- `/posts/:id`
- `/profile/:id`
- `/search`

보호 라우트는 다음을 포함한다.

- `/workouts/*`
- `/posts/new`
- `/profile`
- `/profile/:id/followers`
- `/profile/:id/following`
- `/settings/profile`
- `/messages/*`
- `/notifications`
- `/feedback`
- crew activity edit/chat/check-in routes

이제 `/` 경로는 비로그인 사용자와 로그인 사용자 모두에게 `/feed`로 해석된다. 앱은 더 이상 소개 전용 랜딩 라우트를 따로 유지하지 않으며, 공개 피드 자체가 첫 진입 화면이 되고 로그인 이후의 앱 크롬도 그대로 유지된다.

대부분의 라우트 모듈은 `lazy(() => import(...))`로 지연 로딩된다.

## 라우트 가드

- `ProtectedRoute` reads `useAuth()`
- auth 부트스트랩 중에는 `LoadingPage`를 렌더링한다
- 인증되지 않은 접근은 `/login`으로 리다이렉트한다
- `/profile`, `/settings/profile`를 포함한 일부 보호 페이지는 `ProtectedRoute` 위에 페이지 전용 auth/bootstrap 로직을 추가로 유지한다
- `/profile/:id`는 공개 트리에 존재하며, 공개 계정은 비로그인 사용자도 직접 읽을 수 있다
- `/profile/:id/followers`, `/profile/:id/following`은 본인 전용 보호 라우트다

## 현재 제약

- 라우트 경로와 파일 경로가 항상 1:1은 아니다. 예를 들어 `/workouts/:id`는 `pages/workouts/detail/index.tsx`로 해석된다.
- `MainLayout`의 page-scoped `ErrorBoundary`는 navigation이 바뀌면 reset되어야 하며, 사용자가 fallback에서 다른 라우트로 이동했을 때 이전 오류 UI를 붙잡고 있으면 안 된다.
- 일부 큰 라우트 파일은 아직 오케스트레이션과 뷰 로직을 함께 담고 있으며, 이에 대한 가독성 후속 작업은 `I-0007`이다.
- 로그인 이후 셸 진입점에는 이제 데스크톱 헤더와 모바일 하단 셸에 전용 피드백 진입이 포함되어, 사용자가 제품을 떠나지 않고도 버그를 제보할 수 있다.
- 검색은 1급 셸 진입점이다.
  - 데스크톱 헤더는 직접 `/search` 링크를 노출한다
  - 모바일 하단 내비게이션은 라우트 지식 없이도 `/search`를 볼 수 있게 유지한다
  - 검색 페이지는 사용자 질의를 URL에 반영해 재진입과 뒤로가기에 맥락을 보존한다
  - 검색 화면은 설명용 helper panel보다 입력창과 결과 리스트를 먼저 보여주는 도구형 표면을 따른다
- 메시지는 보호된 앱 허브다.
  - `/messages`와 `/messages/:id`는 같은 목록-대화 흐름으로 읽혀야 한다
  - 메시지 허브는 방 정체성, 필터, 검색을 먼저 보여주고 과한 소개 문구에 기대지 않는다
  - 대화 상세는 room meta, 메시지 흐름, 입력 레일을 조용한 product shell 안에서 유지한다
- 첫 진입 라우트는 공개 피드 우선이다.
  - `/`는 `/feed`로 해석된다
  - `/feed`는 비로그인 사용자도 접근 가능한 공개 진입 라우트다
  - 게스트 `/feed`는 별도 데스크톱 설명 rail 없이 하나의 메인 콘텐츠 컬럼으로 유지한다
  - 게스트 `/feed`는 현재 단계에서 실시간 전체 공개 피드를 보장하는 화면이 아니라, 큐레이션 프리뷰 또는 제한된 목 데이터 표면으로 운영할 수 있다
  - 게스트 `/feed` 화면은 스스로를 샘플, 프리뷰, 데모 콘텐츠라고 라벨링하지 않는다
  - `/feed` 프리뷰에 보이는 affordance는 실제로 동작하거나 인증 게이트로 이어져야 하며, 죽은 링크처럼 보이면 안 된다
  - 이 진입점에서의 공개 탐색은 `/crews`, 공개 게시글 상세 등으로 이어질 때 `/login?next=...`를 거치지 않고 현재 라우트 위에서 계속 진행되어야 한다
  - 더 깊은 참여 액션은 전체 `/login` handoff보다 온페이지 인증 다이얼로그를 우선한다
  - 공개 게시글 안의 워크아웃 preview는 비로그인 사용자가 `/workouts/:id`로 바로 이동하는 대신 현재 게시글 라우트를 유지한 채 인증 다이얼로그를 열어야 한다
  - 공개 프로필 `/profile/:id`는 헤더, 게시글, 크루 표면까지 직접 읽을 수 있어야 하며, 팔로우/메시지 같은 행동은 제자리 auth gate로 막아야 한다
  - 팔로우 그래프 목록 `/profile/:id/followers`, `/profile/:id/following`은 공개 프로필 surface에 포함되지 않으며, 본인 세션에서만 직접 연다
  - 공개 크루 `/crews/:id`는 summary, activity list, board list까지만 직접 읽을 수 있어야 하며, activity detail과 board posts 같은 deeper read는 멤버십 또는 auth gate 뒤에 남긴다
  - 공개 라우트의 다이얼로그와 오버레이는 인증 우회 동선을 만드는 대신, 사용자가 기대하는 브라우저 뒤로가기 동작을 보존해야 한다
  - 사용자가 피드로 바로 가고 싶다면 onboarding은 건너뛸 수 있다
- 로그인 사용자의 모바일 내비게이션은 이제 생성 진입점을 직접 소유한다.
  - 분리된 게시글 전용 FAB는 제거되었다
  - 중앙 생성 트리거는 `/posts/new` 또는 `/workouts/new`를 고르는 바텀시트 선택기를 연다
  - 두 생성 라우트 모두, 사용자가 셸로 다시 나가지 않고도 흐름을 바로잡을 수 있게 가벼운 전환 스위치를 노출한다
- 작성기 라우트는 모바일 내비게이션 위에 자체 로컬 셸 레일을 유지한다.
  - `/posts/new`는 단계 라벨 없는 상단 진행 바와 하단 고정 액션 레일을 사용한다
  - `/posts/new` 사진 선택은 브라우저 제약 안에서 gallery-first를 따른다
    - 사진 단계는 일반적인 업로드 프롬프트보다 기기 사진 선택기를 여는 행동을 전면에 둔다
    - 선택된 미디어는 3열 그리드에 안착하고 이후 작성 단계에서도 계속 보여야 한다
  - `/posts/new` 텍스트 작성은 본문, 해시태그, 가벼운 멘션을 하나의 주 텍스트 영역으로 처리한다
    - 해시태그는 별도 필드가 아니라 같은 입력창에서 파싱한다
    - 가벼운 멘션은 1차 범위에서 자동완성 태깅 없이도 미리보기 수준으로 다룰 수 있다
  - `/workouts/new`는 취소/저장 액션을 스크롤 끝이 아니라 동일한 하단 레일 영역에 유지한다
