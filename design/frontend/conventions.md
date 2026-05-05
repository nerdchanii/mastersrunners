---
doc_state: target
owner: frontend
last_verified: 2026-05-05
sources:
  - apps/web/package.json
  - apps/web/src/router.tsx
  - apps/web/src/hooks
  - apps/web/src/pages
  - apps/web/src/components
  - scripts/check-size-budgets.targets.json
---

# 프론트엔드 컨벤션

이 문서는 `apps/web`의 권장 프론트엔드 코딩 스타일을 정의한다. 일부 레거시 라우트는 아직 이 기준에서 벗어나 있으며, 그런 차이는 컨벤션을 낮추는 대신 후속 태스크로 정리해야 한다.

## 라우트 파일

- 라우트 진입 파일은 가볍게 유지한다.
- `pages/**/index.tsx`는 훅, 섹션, 프레젠테이셔널 컴포넌트를 조합하는 역할에 집중한다.
- 라우트 파일에서 직접 `api.fetch`를 호출하지 않는다. 요청 로직은 라우트 전용 훅, 헬퍼 모듈, 또는 공용 훅으로 옮긴다.
- 라우트 진입 파일이 `@/lib/api-client`나 TanStack Query 프리미티브를 직접 import하지 않도록 한다. 대신 라우트 전용 또는 공용 데이터 헬퍼를 조합한다.
- 라우트 진입 파일은 default export를 허용한다. 그 외 위치에서는 named export를 우선한다.

## 데이터와 상태

- 서버 상태는 TanStack Query 훅에서 다룬다.
- 라우트별 오케스트레이션은 `useEventDetailPage.ts` 같은 라우트 전용 훅에 둔다.
- 공용 도메인 훅은 `apps/web/src/hooks/` 아래에 둔다.
- 하나의 파일 안에 쿼리 오케스트레이션, mutation 부수효과, 모달 상태, 무거운 JSX 레이아웃을 한꺼번에 섞지 않는다.

## UI 구성

- 재사용 가능한 UI는 `components/`에 둔다.
- 특정 라우트에서만 쓰는 UI는 재사용 필요가 분명해질 때까지 라우트 옆에 둔다.
- reusable primitive와 stable presentational section도 실앱/테스트 기준으로 유지하며, Storybook 퇴역 이후 `*.stories.tsx` co-location을 현재 기본값으로 두지 않는다.
- raw spacing이나 color 값을 반복하기보다, 기존 Tailwind v4와 shadcn 스타일 토큰 시스템을 사용한다.
- 이름 없는 긴 JSX 블록보다 역할이 분명한 섹션 컴포넌트를 우선한다.
- 소셜 상세 화면은 콘텐츠가 하나의 흐름으로 읽혀야 할 때, 제네릭 `Card`를 여러 장 쌓기보다 하나의 연속된 문서와 섹션 구분선 구성을 우선한다.
- 공개 소셜 화면은 설명용 크롬보다 콘텐츠 우선 레이아웃을 따라야 한다. 주요 콘텐츠만으로 화면이 서는 경우 helper block이나 promo rail을 추가하지 않는다.
- 게스트 참여 경계는 underlying route가 공개 읽기 화면인 경우, 즉시 라우트 리다이렉트보다 온페이지 인증 다이얼로그를 우선한다.
- 소비자용 웹 카피는 `design/frontend/writing-and-copy.md`를 따른다. 샘플/데모 톤과 과잉 설명형 UI를 피한다.
- 플랫폼이 지원한다면 네이티브 공유 affordance를 우선 사용한다. 클립보드 복사만 하는 공유는 모바일 기본 동작이 아니라 fallback이다.
- 날짜 선택은 폼 곳곳에 native `type="date"`를 흩뿌리기보다 `components/ui/` 아래 공용 date-picker 래퍼를 통해 처리한다.

## UI 검증 운용

- 시각 polish, typography, spacing, theme 검토는 실제 라우트와 대표 viewport에서 확인한다.
- 인증 경계, 브라우저 뒤로가기, 라우트 전환, data loader 계약 검증은 실라우트와 Playwright로 확인한다.
- isolated component 확인이 필요하면 production provider 구조를 중복하지 말고, 실앱에서 쓰는 provider와 fixture helper를 좁게 재사용한다.
- fixture와 mock은 외부 API 호출 없이 재현 가능한 deterministic data를 사용하되, Storybook 전용 fixture 계층은 만들지 않는다.
- interactive component는 정적 렌더 확인 하나로 끝내지 말고, open/close/select/auth gate 같은 대표 상태를 route-level test나 focused browser check로 드러낸다.
- raw object prop을 임시 UI control에 노출하기보다 route/page 상태를 통해 검증한다.

## 네이밍

- 파일 이름은 구현 디테일이 아니라 책임 기준으로 짓는다.
- `useProfileEditForm.ts`, `post-composer-steps.tsx` 같은 이름을 선호한다.
- `helpers.ts`, `utils2.ts`, `temp.tsx`처럼 모호한 이름은 피한다.

## 가독성 예산

- 페이지 진입 파일은 저장소의 가독성 예산 안에 머물러야 한다.
- 특정 라우트가 예산을 넘는다면 규칙을 낮추지 말고 후속 태스크를 만든다. 설계 문서에서 큰 파일을 정상처럼 문서화하지 않는다.
