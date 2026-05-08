# `apps/web` Pages Inventory (mobile layout category)

목적: “모든 페이지(라우트)가 어떤 상위 레이아웃 카테고리(= 기본 거터/예외 처리)를 타는지”를 빠르게 훑기 위한 인벤토리.

Source: `apps/web/src/router.tsx` 라우트 트리 요약은 `analysis/pages/route-map.md`에 정리되어 있음.

## Layout categories (as-is)

```text
A) AuthLayout: /login
B) MainLayout(default): 대부분 라우트 (mobile: px-4 py-4 pb-20)
C) MainLayout(profile surface): /profile, /profile/:id (mobile: px-0 py-0 pb-20)
D) MainLayout(crew hub surface): /crews/:id ... (mobile: px-0 py-0 pb-20)
E) MainLayout(chat): /messages... (mobile: h-svh, md:px-0 md:py-0)
F) MainLayout(viewport locked): /crews/new (mobile: height locked, px-0 py-0)
```

## Route → entry component (factual)

### AuthLayout

- `/login` → `apps/web/src/pages/login/index.tsx`

### MainLayout (default)

- `/` → redirect to `/feed` (no page component)
- `/auth/callback` → `apps/web/src/pages/auth/callback/index.tsx`
- `/feed` → `apps/web/src/pages/feed/index.tsx`
- `/crews` → `apps/web/src/pages/crews/index.tsx`
- `/challenges` → `apps/web/src/pages/challenges/index.tsx`
- `/challenges/:id` → `apps/web/src/pages/challenges/[id]/index.tsx`
- `/events` → `apps/web/src/pages/events/index.tsx`
- `/events/:id` → `apps/web/src/pages/events/[id]/index.tsx`
- `/posts/:id` → `apps/web/src/pages/posts/[id]/index.tsx`
- `/profile/:id` → `apps/web/src/pages/profile/[id]/index.tsx`
- `/search` → `apps/web/src/pages/search/index.tsx`
- `*` → `apps/web/src/pages/not-found/index.tsx`

### MainLayout (crew hub surface)

- `/crews/:id` → `apps/web/src/pages/crews/[id]/index.tsx`
  - `(index)` → `CrewHomePanel` (동일 파일/서브패널; 상세는 `analysis/pages/route-map.md`)
  - `activities` → `CrewActivitiesPanel`
  - `board` → `CrewBoardPanel`
  - `board/:boardId/posts/:postId` → `CrewBoardPanel`
  - `members` → `CrewMembersPanel`
  - (ProtectedRoute)
    - `activities/new` → `CrewActivityCreatePanel`
    - `board/new` → `CrewBoardCreatePanel`
    - `manage` → `CrewManagePanel`
    - `pending` → `CrewPendingMembersPanel`

### MainLayout (ProtectedRoute)

- `/workouts` → `apps/web/src/pages/workouts/index.tsx`
- `/workouts/new` → `apps/web/src/pages/workouts/new/index.tsx`
- `/workouts/:id` → `apps/web/src/pages/workouts/detail/index.tsx`
- `/workouts/:id/edit` → `apps/web/src/pages/workouts/edit/index.tsx`
- `/challenges/:id/edit` → `apps/web/src/pages/challenges/[id]/edit.tsx`
- `/events/:id/edit` → `apps/web/src/pages/events/[id]/edit.tsx`
- `/posts/new` → `apps/web/src/pages/posts/new/index.tsx`
- `/posts/:id/edit` → `apps/web/src/pages/posts/[id]/edit.tsx`
- `/profile` → `apps/web/src/pages/profile/index.tsx`
- `/profile/:id/connections` → `apps/web/src/pages/profile/[id]/connections/index.tsx`
- `/profile/:id/followers` → `apps/web/src/pages/profile/[id]/followers/index.tsx`
- `/profile/:id/following` → `apps/web/src/pages/profile/[id]/following/index.tsx`
- `/settings/profile` → `apps/web/src/pages/settings/profile/index.tsx`
- `/crews/new` → `apps/web/src/pages/crews/new/index.tsx`
- `/crews/:id/settings` → `apps/web/src/pages/crews/[id]/settings/index.tsx`
- `/crews/:id/activities/:activityId/qr-check-in` → `apps/web/src/pages/crews/[id]/activities/[activityId]/qr-check-in/index.tsx`
- `/crews/:id/activities/:activityId/edit` → `apps/web/src/pages/crews/[id]/activities/[activityId]/edit/index.tsx`
- `/crews/:id/activities/:activityId` → `apps/web/src/pages/crews/[id]/activities/[activityId]/index.tsx`
- `/challenges/new` → `apps/web/src/pages/challenges/new/index.tsx`
- `/events/new` → `apps/web/src/pages/events/new/index.tsx`
- `/messages` → `apps/web/src/pages/messages/index.tsx`
  - `crew/:crewId` → `apps/web/src/pages/messages/crew/[crewId]/index.tsx`
  - `crew/:crewId/activity/:activityId` → `apps/web/src/pages/messages/crew/[crewId]/activity/[activityId]/index.tsx`
  - `:id` → `apps/web/src/pages/messages/[id]/index.tsx`
- `/notifications` → `apps/web/src/pages/notifications/index.tsx`
- `/feedback` → `apps/web/src/pages/feedback/index.tsx`
- `/onboarding` → `apps/web/src/pages/onboarding/index.tsx`

## Notes

- 디테일 라우트 파라미터 이름은 `/posts/:id`, `/workouts/:id`로 구현되어 있다(`:postId`, `:workoutId`가 아님). 상세는 `analysis/pages/route-map.md` 참고.
