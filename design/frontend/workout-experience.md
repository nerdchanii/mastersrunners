---
doc_state: current
owner: frontend
last_verified: 2026-04-04
sources:
  - apps/web/src/components/workout/WorkoutAnalysisMap.tsx
  - apps/web/src/components/workout/WorkoutAnalysisCharts.tsx
  - apps/web/src/components/workout/WorkoutAttachmentPreview.tsx
  - apps/web/src/pages/posts/[id]/index.tsx
  - apps/web/src/pages/workouts/index.tsx
  - apps/web/src/pages/workouts/new/index.tsx
  - apps/web/src/pages/workouts/new/use-workout-entry.ts
  - apps/web/src/pages/workouts/detail/index.tsx
  - apps/web/src/pages/workouts/[id]/edit/index.tsx
  - apps/web/src/hooks/useWorkouts.ts
  - apps/web/src/lib/workout-analysis.ts
  - apps/web/src/hooks/useMessages.ts
---

# 워크아웃 경험

## 요약

워크아웃 UX는 인증된 상태에서의 기록 생성, 검토, 재사용을 중심으로 한다. 생성 흐름은 수기 입력과 FIT/GPX 업로드를 모두 지원하며, 이후 워크아웃은 게시글에 첨부하거나 이벤트 결과와 연결할 수 있다. 현재 상세 라우트는 분석 우선 구조를 따른다. GPS가 있으면 큰 경로 지도를 먼저 보여주고, 그 옆 또는 아래에 거리/시간/페이스 요약, 경로와 연결된 차트, 랩 리뷰를 순서대로 쌓는다.

## 라우트 모델

- `/workouts` lists the authenticated user's workout history
- `/workouts/new` creates a workout
- `/workouts/:id` shows workout detail
- `/workouts/:id/edit` edits an existing workout

모든 워크아웃 라우트는 보호된다.

## 생성 흐름

`/workouts/new`는 이중 모드 진입 경험이다.

- `file` 모드는 FIT 또는 GPX 파일을 업로드하고, 파싱한 뒤 정규화된 지표를 미리 보여준다
- `manual` 모드는 거리, 시간, 날짜, 메모, 공개 범위를 직접 입력받는다
- 수기 거리 입력은 UI에서는 킬로미터 단위로 받되, API 요청 전에는 미터 단위로 정규화한다

페이지 상태는 `useWorkoutEntry`가 오케스트레이션하며, 아래 책임을 가진다.

- drag-and-drop file state
- parse/upload progress
- metric normalization
- visibility choice
- form submission and cancellation

## 데이터와 재사용 모델

- 워크아웃 타입 옵션은 `/workout-types`에서 가져온다
- 게시글 작성기는 `useWorkouts`를 통해 기존 워크아웃을 재사용한다
- 게시글 상세는 게시글이 가진 이미지 미디어를 첨부 워크아웃 위에 계속 보여줘, 피드에서 상세로 들어왔을 때 본문 콘텐츠가 사라지지 않게 한다
- 게시글 상세의 첨부 워크아웃은 이제 `/workouts/:id`로 깊게 이동하기 전에, 경로 썸네일과 분석 중심 요약 칩을 포함한 더 풍부한 미리보기로 렌더링된다
- 비로그인 사용자는 공개 게시글 상세에서 이 첨부 워크아웃 미리보기를 볼 수 있지만, 미리보기를 눌렀을 때는 현재 게시글 페이지를 `/login`으로 날려버리지 말고 제자리 인증 다이얼로그를 열어야 한다
- 이벤트 결과 연결은 워크아웃 상세가 아니라 이벤트 상세 페이지에서 처리한다
- 현재 `/workouts/:id` 라우트는 저장된 경로, 랩, 포인트 단위 센서 데이터를 사용해, 해당 시계열이 있을 경우 지도 우선 보고서와 연결된 고도/심박/케이던스 차트를 렌더링한다
- `/workouts/:id` 상세 payload는 지도/랩 데이터 외에도 현재 사용자 기준 `liked`와 집계용 `likeCount`, `commentCount`를 안정적으로 포함해야 하며, 웹 상세는 이 social summary를 route body 안에서 바로 사용한다
- 차트 스크럽과 랩 선택은 하나의 공통 route-selection 모델을 공유해, 상세 화면이 나중에 더 깊은 분석 기능으로 확장될 수 있게 한다
- 이 분석 우선 방향은 러너 상세 화면의 현재 UX 계약 일부이며, 명시적인 후속 태스크 없이 일반적인 소셜 요약 카드 수준으로 낮춰서는 안 된다
- workout detail의 상단 hero 섹션은 큰 둥근 카드 하나로 지도와 메타를 감싸는 방식보다, 지도 media block과 우측 분석 메타가 divider 기반 레이아웃으로 이어지는 쪽을 우선한다
- 거리, 시간, 평균 페이스는 타일형 카드보다 한 줄에 안정적으로 읽히는 summary metrics여야 하며, 단위 표시는 줄바꿈 없이 값과 함께 붙어야 한다
- 작은 화면에서는 workout detail 첫 섹션이 과한 center-column 거터를 남기지 말고 edge-aligned surface처럼 보여야 한다. 다만 아바타나 액션처럼 내부 콘텐츠까지 화면 끝에 붙이는 것은 아니며, 콘텐츠 자체는 얇은 내부 패딩 안에서 정렬한다.
- 작은 화면의 지도는 첫 화면 대부분을 독점하지 않도록 세로 높이를 절제하고, 분석 메타와 하나의 연속된 상단 보고서처럼 읽히게 한다
- 날짜는 workout detail 상단에서 지도보다 먼저 보이는 단일 메타로 다루고, workout type이나 visibility 같은 badge성 라벨은 hero에서 기본 노출하지 않는다
- owner action은 3점 메뉴 안으로 숨기고, share action은 별도 share trigger가 카드 생성과 포스트 공유를 드롭다운으로 펼치는 조용한 상단 제어로 정리한다
- 세부 지표는 별도 섹션 제목 없이 바로 보여줘도 읽히는 것이 우선이며, 실제 AI 분석이 없는 상태에서 과한 “분석 리포트”류 헤더를 덧붙이지 않는다

## 공개 범위와 메타데이터

현재 워크아웃 레코드는 다음을 노출한다.

- 공개 범위 (`PRIVATE`, `FOLLOWERS`, `PUBLIC`)
- 메모
- 사진
- 원본 워크아웃 레코드가 이를 갖고 있다면, 파싱된 경로와 랩 지표도 이제 워크아웃 상세 UI 계약에 포함된다
- 데이터 모델 차원의 선택적 신발 연결

## 현재 제약

- 라우트 페이지는 훅/뷰모델 레이어에 완전히 위임하지 못하고 여전히 적지 않은 오케스트레이션을 직접 소유한다
- 워크아웃 레코드가 신발을 가리킬 수는 있지만, 신발 선택과 신발 리뷰 UX는 아직 1급 독립 화면이 아니다
- 이벤트 연결은 인접한 흐름일 뿐, 워크아웃 생성 과정에 통합된 단계는 아니다
- GPS나 센서 시계열이 없는 워크아웃은 별도 상세 레이아웃으로 갈라지지 않고, 의도적으로 부분 렌더링 방식으로 graceful degradation한다
- 현재 워크아웃 상세 보고서는 추세 비교, effort score, 과거 기록 오버레이 같은 장기 분석에는 아직 이르지 못한다
- 게시글 비디오는 이번 범위 밖이며, 워크아웃 첨부 스토리 안으로 끌어오지 않는다
