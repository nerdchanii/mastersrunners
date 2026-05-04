---
doc_state: current
owner: frontend
last_verified: 2026-05-04
sources:
  - apps/web/src/pages/crews/index.tsx
  - apps/web/src/pages/crews/new/index.tsx
  - apps/web/src/pages/crews/[id]/index.tsx
  - apps/web/src/pages/crews/[id]/settings/index.tsx
  - apps/web/src/pages/crews/[id]/activities/[activityId]/index.tsx
  - apps/web/src/pages/crews/[id]/activities/[activityId]/chat.tsx
  - apps/web/src/pages/crews/[id]/activities/[activityId]/qr-check-in.tsx
  - apps/web/src/pages/messages/index.tsx
  - apps/web/src/components/crew/CrewActivityList.tsx
  - apps/web/src/components/crew/CrewBoardList.tsx
  - apps/web/src/components/crew/CrewIdentityHero.tsx
  - apps/web/src/components/crew/CrewMemberList.tsx
  - apps/web/src/components/crew/GroupChat.tsx
  - apps/web/src/hooks/useCrewActivities.ts
  - apps/web/src/hooks/useCrews.ts
  - apps/web/src/hooks/useMessages.ts
  - apps/web/src/hooks/useGroupChat.ts
---

# 크루 경험

## 요약

크루 UX는 탐색, 멤버십 관리, 토론, 활동 일정, 출석, 채팅을 함께 다룬다. 상세 라우트가 운영 허브 역할을 하며, 현재 페이지는 더 분명한 1차/2차 위계를 사용해 멤버가 탭 구조에 압도되지 않고 빠르게 훑을 수 있게 한다.

## 라우트 모델

- `/crews` lists crews
- `/crews/new` creates a crew
- `/crews/:id` shows the crew hub
- `/crews/:id/settings` configures the crew
- `/crews/:id/activities/:activityId` shows an activity detail page
- `/crews/:id/activities/:activityId/edit` edits an activity
- `/crews/:id/activities/:activityId/chat` opens activity chat
- `/crews/:id/activities/:activityId/qr-check-in` handles QR attendance

비로그인 진입은 공개 탐색 우선을 유지한다.

- 비로그인 방문자에게 `/crews`는 `내 크루`를 여는 대신 기본적으로 `크루 찾기`를 보여준다
- 비로그인 상태에서 `내 크루`를 고르면 즉시 리다이렉트하지 않고 인증 유도 다이얼로그를 연다
- `/crews/:id`는 공개 탐색을 위해 로그인 없이도 읽을 수 있어야 한다
- 비로그인 상태의 크루 읽기 화면은 페이지가 기본적으로 마운트하는 공개 탐색 payload를 포함해야 한다
  - 지역 필터
  - 탐색 결과
  - 게시판 목록
  - 활동 목록
- 가입, 초대 진입, 활동 상세 진입, 게시판 deeper read 시도는 인증 유도 다이얼로그를 열고, 현재 크루 경로를 로그인 후 복귀 대상으로 보존한다
- 멤버 전용 채팅 데이터는 사용자가 실제 활성 멤버가 되기 전까지 조회하지 않는다
- 공개 크루 화면은 자신의 공개 범위를 정당화하기 위해 추가 설명 카피에 기대지 않는다. 읽을 수 있는 데이터와 게이트된 행동이 그 경계를 스스로 보여줘야 한다
- 로그인했지만 비멤버인 사용자도 현재 공개 계약에서는 목록까지만 읽는다. 활동 상세, 게시판 게시글, 크루 게시글, 채팅은 멤버십 경계 뒤에 남긴다.

## 크루 허브 구성

크루 상세 페이지는 최상단 탭을 먼저 보여주고, 크루 정체성 hero는 `홈` 탭 안에서만 보여준다.

- 크루 프로필 이미지와 커버 이미지를 서로의 fallback으로 재사용하지 않고, 각기 다른 역할로 다루는 hero 영역
- 1차 탭은 `홈`, `활동`, `게시판`, `멤버`를 기본으로 유지하고, 운영진에게만 `관리`, `가입대기`를 추가로 보여준다
- 활성 1차 탭은 굵은 텍스트와 짧은 하단 indicator로 표시해 현재 위치가 탭 바 안에서 바로 읽히게 한다
- `/crews/:id`는 `홈` 탭이며, hero와 가까운 예정 활동 2개를 보여준다
- `활동`, `게시판`, `멤버`, `관리`, `가입대기` 탭은 hero 없이 해당 작업 콘텐츠를 바로 보여준다
- `활동` 탭은 탭 바로 아래에 여백을 두고, 활동 목록을 날짜, 상태, 장소, 참석 인원이 빠르게 스캔되는 반복 카드로 보여준다
- 글쓰기와 활동 만들기는 탭 바 안에 고정하지 않고, 우측 하단 quick action으로 제공한다
- hero 안의 채팅 아이콘 버튼은 `/messages/crew/:crewId`로 바로 연결된다
- hero 안의 겹친 아바타 + 인원수 요약은 멤버 목록 시트로 이어진다
- 주 콘텐츠와 경쟁하지 않으면서 멤버 목록을 계속 보여주는 2차 멤버 패널
- 출석 통계와 승인 대기 멤버를 위한 별도 운영 패널
- 태그 관리는 구현된 feature로 남아 있지만 크루 허브 UI에서는 의도적으로 가려진다
- `/crews/:id?invite=1`로 들어온 초대 유입 사용자는 가입하거나 가입 요청이 대기 상태가 될 때까지 hero 위에서 가벼운 초대 설명을 계속 본다
- 비로그인 초대 유입 사용자는 인증 유도 다이얼로그를 거치더라도 로그인 후 복귀 대상으로 같은 초대 URL을 유지한다

이제 페이지 전체 구조보다 멤버십 상태가 주요 affordance를 결정한다.

- 비멤버는 가입 요청 또는 바로 가입을 할 수 있다
- 활성 멤버는 hero 채팅 버튼과 공유 링크 액션을 사용할 수 있다
- owner/admin은 운영, 통계, 설정 액션을 본다
- admin/operator 도구는 멤버용 화면과 시각적으로 분리되어, 페이지를 훑을 때 먼저 관리 패널을 열어본 느낌이 들지 않도록 한다
- hero는 `공개/비공개`, `내 크루`, `가입 승인형`, `만든이` 같은 설명성 메타에 기대기보다 제목, 설명, 잠금 아이콘, 행동 차이로 상태를 보여준다
- 일반 멤버의 `크루 탈퇴`는 hero의 주 액션으로 세우지 않고, secondary action이나 overflow 안에서 확인 절차와 함께 다룬다
- 게스트와 비멤버에게는 크루 허브의 읽기 가능 범위가 summary + activity list + board list에 머물러야 한다
- 공지사항은 1차 탭이나 게시판 내부 진입점으로 분리하지 않고 게시판 탭의 통합 글 목록에서 일반 글과 함께 바로 보여준다
- 공지 글은 목록과 상세에서 `공지` label을 함께 표시하며, owner/admin은 게시판 글쓰기 폼의 `공지` 체크박스로 공지 글을 등록한다
- 크루 허브 탭과 작성 상태는 query가 아니라 path로 표현한다: `/crews/:id`, `/crews/:id/activities`, `/crews/:id/activities/new`, `/crews/:id/board`, `/crews/:id/board/new`, `/crews/:id/members`, `/crews/:id/manage`, `/crews/:id/pending`
- 게시판 글 상세 진입은 `/crews/:id/board/:boardId/posts/:postId`로 push해 뒤로가기와 직접 링크를 보존한다
- 가입대기는 운영진 전용 1차 탭으로 분리하고, 운영진이 아닌 사용자는 탭과 화면에 접근할 수 없다
- Storybook workbench에서는 참여 흐름을 `가입`, `승인`, `관리`, `출석`, `게시판`, `채팅`으로 나눠 보되, CTA tone과 destructive confirm wording은 같은 패턴을 공유해야 한다

### 크루 허브 라우트와 화면 도식

```text
/crews/:id
└── 홈
    ├── 크루 히어로
    ├── 크루 소개
    └── 가까운 예정 활동 2개

/crews/:id/activities
└── 활동

/crews/:id/board
└── 게시판

/crews/:id/board/:boardId/posts/:postId
└── 게시판 > 글 상세

/crews/:id/members
└── 멤버

/crews/:id/manage
└── 관리

/crews/:id/pending
└── 가입대기
```

```text
홈 탭

┌────────────────────────────────────┐
│ 홈 | 활동 | 게시판 | 멤버 | 관리 ... │
├────────────────────────────────────┤
│              히어로                │
│      커버 / 크루명 / 멤버 / CTA     │
├────────────────────────────────────┤
│ 크루 소개                           │
├────────────────────────────────────┤
│ 예정 활동 2개                       │
└────────────────────────────────────┘
```

```text
비홈 탭

┌────────────────────────────────────┐
│ 홈 | 활동 | 게시판 | 멤버 | 관리 ... │
├────────────────────────────────────┤
│        해당 탭 콘텐츠 바로 표시       │
│        히어로 미노출                 │
└────────────────────────────────────┘
```

### 생성 퍼널

- `/crews/new`는 모바일에서 문서 전체가 스크롤되지 않는 viewport-contained 퍼널이다.
- 앱 셸은 생성 라우트에서 header/bottom navigation이 차지하는 높이를 뺀 고정 작업 영역을 제공하고, 폼 본문만 내부 스크롤을 사용한다.
- 생성 퍼널은 별도 페이지 제목을 시각적으로 반복하지 않고, 현재 단계 제목과 진행률을 주 orientation으로 사용한다.

빠른 스캔을 위해 1차 탭 순서는 고정한다.

1. 홈
2. 활동
3. 게시판
4. 멤버
5. 관리
6. 가입대기

### 설정 셸

- `/crews/:id/settings`는 이제 상세 hero와 같은 프로필/커버 프레이밍을 사용해 읽기 모드와 편집 모드 모두에서 크루 정체성이 일관되게 느껴지도록 한다.
- 기본 편집 폼은 왼쪽/메인 컬럼에 두고, 멤버 관리, 승인 대기, 차단 목록은 별도 운영 카드로 분리한다.
- 운영자는 같은 설정 폼 안에서 profile-image URL과 cover-image URL을 직접 수정할 수 있고, 각 슬롯에 대한 live preview를 본다.
- 단순 텍스트 입력은 의도를 숨기지 않으면서도 화면 소음을 줄일 수 있다면 placeholder와 보조 카피를 활용한다.
- 파괴적 owner 액션은 일반 편집 폼과 시각적으로 분리해 유지한다.
- 활성 멤버는 크루 허브에서 안정적인 공유 링크를 바로 복사하거나 공유할 수 있어야 한다.
- owner/admin 화면은 설정에서도 같은 공유 링크 액션을 계속 노출해, 운영자가 크루 URL을 수동 복사하지 않도록 한다.
- 현재 초대 URL 계약은 `/crews/:id?invite=1`이며, 비로그인 사용자가 이를 열면 로그인 흐름은 그 목적지를 보존하고 인증 후 같은 초대 진입으로 돌려보내야 한다.

## UI의 활동 모델

크루 활동은 메인 크루 허브에서 분리되어, 라우트 전용 상세/유틸리티 페이지로 나뉜다.

- detail page
- edit page
- QR check-in page
- activity chat page

활동 상세 라우트는 `I-0007`에서 슬림화됐지만, 여전히 라우트 전용 뷰 모델을 중심으로 여러 멤버십/출석 동작을 오케스트레이션한다.

현재 출석 진입점은 의도적으로 분리되어 있다.

- RSVP한 멤버는 자신의 체크인을 위해 QR check-in 라우트를 사용한다
- owner/admin과 manage 권한이 있는 popup host는 수동/operator check-in 액션을 계속 사용할 수 있다
- 활동 상세 페이지는 일반 멤버에게 self manual check-in을 노출하지 않아야 한다

## 채팅과 실시간성

- 크루 채팅과 활동 채팅은 group-chat 훅 위에 구축된다
- DM은 SSE를 쓰지만, 크루/활동 채팅은 여전히 group-chat polling 모델에 의존한다
- 이제 크루 채팅과 활동 채팅은 generic room name 대신 라우트가 소유한 라벨과 카피를 사용한다
- 메인 `/messages` 허브는 이제 크루/활동 채팅방을 명시적인 방 정체성과 함께 계속 보여준다
  - 크루 방은 `크루명`으로 렌더링하고 썸네일을 아바타로 사용한다
  - 활동 방은 `크루명 / 활동명`으로 렌더링한다
- 메시지 허브에서 크루 또는 활동 방을 선택하면, 모든 방을 DM thread처럼 취급하지 않고 해당 크루/활동 채팅 화면으로 다시 라우팅한다
- raw `crewId`, `activityId`, 또는 fallback conversation id는 크루용 채팅 헤더나 empty state에 노출하지 않는다
- 활동 채팅 라우트 접근 권한은 의도적으로 활동 상세 CTA와 정렬한다
  - `RSVP`
  - `CHECKED_IN`
  - 크루 admin/owner
  - manage 권한이 있는 popup host
- 이 접근 규칙 밖의 사용자는 편집 가능한 채팅 입력창 대신, 설명 상태와 복귀 액션을 본다

## 현재 제약

- `/crews/:id`는 아직 전용 hook/query owner 대신 페이지 레벨 직접 fetch를 수행한다
- 크루 허브의 범위는 여전히 넓지만, 페이지는 이제 세 개의 1차 탭 표면과 2차 운영 영역으로 나뉘어 있다
- 가입 승인과 활동 운영은 구현되어 있지만 상태가 하나의 공유 crew query 레이어로 아직 정규화되지는 않았다
- 태그 관리는 구현된 feature지만 현재 크루 허브 UI에서 가려져 있으며, 별도 UX 재개방 task 전까지 운영 표면에 노출하지 않는다
- group chat은 여전히 10초마다 polling하므로, 스크롤 동작은 새로고침 중에도 이전 메시지를 읽는 사용자를 보호해야 한다
