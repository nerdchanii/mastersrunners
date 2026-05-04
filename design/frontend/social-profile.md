---
doc_state: current
owner: frontend
last_verified: 2026-04-05
sources:
  - apps/web/src/pages/profile/index.tsx
  - apps/web/src/pages/profile/[id]/index.tsx
  - apps/web/src/pages/profile/[id]/followers/index.tsx
  - apps/web/src/pages/profile/[id]/following/index.tsx
  - apps/web/src/pages/settings/profile/index.tsx
  - apps/web/src/components/profile/ProfileHeader.tsx
  - apps/web/src/components/profile/ProfileTabs.tsx
  - apps/web/src/pages/onboarding/index.tsx
  - apps/web/src/hooks/useMessages.ts
---

# 소셜 및 프로필 경험

## 요약

프로필 화면은 보호된 내 프로필 라우트와, 다른 사용자를 위한 공개 라우트 경로로 나뉜다. 공개 프로필은 로그인 없이도 읽을 수 있지만, 행동과 보호된 목록 진입은 auth gate 또는 privacy shell로 경계를 드러낸다. 이 화면은 팔로우 상태, 프로필 편집, DM 진입, 탭 기반 콘텐츠 탐색을 함께 다룬다.

현재 배포된 헤더는 커버 이미지 hero보다 평평한 정체성 표면에 가깝다. 프로필은 장식용 fallback 커버 미디어를 억지로 만들기보다 avatar, 이름, bio, PB, 액션, 수치 정보를 우선해야 한다.

## 라우트 모델

- `/profile`은 로그인한 현재 사용자의 프로필이다.
- `/profile/:id`는 공개 라우트 트리에 존재하며, 공개 계정이라면 비로그인 사용자도 직접 읽을 수 있다.
- `/profile/:id/followers`, `/profile/:id/following`은 본인 세션에서만 여는 보호된 팔로우 목록 라우트다.
- `/settings/profile`은 프로필 메타데이터를 수정하는 전용 편집 폼이다.

공개 프로필 라우트는 요청한 사용자 id가 현재 세션과 같으면 `/profile`로 다시 돌려보낸다.

## 현재 상호작용 모델

### 팔로우 라이프사이클

- 공개 계정은 즉시 팔로우할 수 있다
- 비공개 계정은 팔로우 대기 상태로 전환된다
- 게스트가 `팔로우`, `팔로우 요청`을 누르면 현재 프로필 URL을 유지한 채 인증 다이얼로그를 연다
- 언팔로우는 파괴적 행동이며, 페이지 상태에서 팔로워 수를 optimistic update한다

### 메시지 진입

- 공개 프로필 헤더는 기존 DM을 열거나 새 대화를 만들 수 있다
- 비공개 계정의 잠긴 프로필 셸에서는 메시지 CTA를 노출하지 않는다
- 현재 DM 부트스트랩은 대상 참여자 id를 담아 `/conversations`에 POST하는 방식으로 이뤄진다
- 프로필 헤더는 모바일에서도 기본적으로 카드 래퍼를 두지 않고, 내부 간격과 구분선으로 위계를 만든다
- `/profile`과 `/profile/:id`의 본문은 모바일에서 앱 셸의 외부 gutter 없이 프로필 표면이 viewport edge에 맞닿도록 렌더링한다
- 프로필 헤더는 5K, 10K, 하프, 풀 PB를 가능한 경우 직접 보여준다

### 탭 모델

현재 타인 프로필 페이지는 페이지 전용 fetch를 통해 공개 계약에 맞는 탭만 직접 소유한다.

- `posts`
- `crews`

공개 타인 프로필에서는 workout 탭을 숨긴다. 각 탭은 공용 라우트 레벨 query 레이어를 쓰지 않고, 활성화될 때 자기 목록을 개별 조회한다. 이 정책은 UI만의 편의 처리에 그치지 않으며, foreign profile API 응답도 workout aggregate를 0으로 고정해 profile surface 밖의 workout 힌트를 만들지 않는다.

### 온보딩 입력

첫 방문 온보딩 플로우는 전체 프로필 편집기보다 의도적으로 가볍다.

- `name`은 필수다
- `bio`는 선택이며 한 줄 소개에 매핑된다
- `region`, `subRegion`은 선택이다
- PB 필드는 `5K`, `10K`, `HM`, `FM` 기준으로 선택이다
- `isPrivate`는 온보딩 마지막 단계에서 명시적으로 고른다
- 사용자가 먼저 피드로 가고 싶다면 로그인 후 이 흐름을 건너뛸 수 있다

전용 프로필 편집 폼은 이후 사용자를 온보딩으로 다시 보내지 않고도 같은 지역, PB, 공개 범위 필드를 수정할 수 있어야 한다.

## 현재 데이터 소유 구조

- auth와 current-user bootstrap은 여전히 `AuthProvider` 안에 있다
- `/profile/:id`는 팔로우 상태, 탭 상태, 탭 fetch를 로컬에서 직접 소유한다
- 재사용 가능한 시각 구조는 `ProfileHeader`, `ProfileTabs`로 나뉜다
- 팔로워/팔로잉 목록 페이지는 모달 오버레이가 아니라 별도 라우트지만, 현재 정책에서는 본인만 직접 연다. 타인 프로필에서 이 경계는 공개 surface가 아니라 프로필 헤더 수치까지만 드러난다.
- 타인 프로필 API는 공개 읽기가 허용되더라도 workout aggregate를 사실상 비노출로 다룬다. 현재 헤더 수치 surface는 `게시물`, `팔로워`, `팔로잉`, `크루`까지만 product truth다.

## 현재 제약

- 프로필 화면은 전용 hook/query 레이어 대신 여전히 페이지 로컬 `api.fetch()` 호출을 사용한다
- 비공개 계정 노출 여부는 API 응답 형태로 강제되므로, 라우트는 부분 프로필 데이터에 대한 방어적 처리가 필요하다
- 내 프로필과 타인 프로필은 아직 하나의 통합 view-model을 공유하지 않는다
- 배경 이미지 편집은 여전히 전용 설정 폼에 남아 있지만, 공개 프로필 헤더는 더 이상 그 필드를 필수 프레젠테이션 크롬으로 취급하지 않는다
- 온보딩은 더 이상 러닝 레벨이나 주 종목 거리를 정식 프로필 필드로 다루지 않는다
- 비공개 계정의 잠긴 프로필 셸은 최소 정체성만 보여주며, 공개 크루/게시글을 부분 노출하는 더 세밀한 privacy 옵션은 아직 없다
- 모바일 프로필과 피드는 앱 셸 기본 거터 위에 다시 박스형 래퍼를 덧씌우지 않도록, edge-aligned 소비자용 소셜 표면을 우선한다
