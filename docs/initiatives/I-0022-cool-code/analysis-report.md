# I-0022 Cool Code Analysis Report

## TL;DR

- 핵심 문제: 서버 상태, mutation 후속 처리, route orchestration, UI interaction, JSX가 같은 파일에 섞여 SLAP이 깨진다.
- 해결책: **query reset recovery**, **loader-prefetched query**, **key/invalidation matrix**, **feature composite/funnel split**을 implementation task로 쪼갠다.
- 기대효과: route reload 의존, silent failure, manual refetch, 대형 컴포넌트 회귀를 task 단위로 통제한다.

## Architecture Health Check

| Area       | Score | Diagnosis                                                                                                                                               |
| ---------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 응집도     |  4/10 | `useEventDetailPage`, `useChallengeDetailPage`, `CommentList`, `LikeButton`, `ShareToggle`, `CrewBoardList`, `ProfileTabs`가 여러 책임을 동시에 가진다. |
| 결합도     |  5/10 | route/component가 endpoint, query timing, mutation 후속 refetch를 직접 안다.                                                                            |
| 가독성     |  4/10 | `CrewBoardList` 826줄, `ProfileTabs` 683줄, route 예산 초과 파일이 변경 단위를 키운다.                                                                  |
| 예측가능성 |  5/10 | `useEffect` fetch, TanStack Query, hard reload retry, silent error가 혼재한다.                                                                          |

## Target Health Check

| Area       | Target | Expected Change                                                             |
| ---------- | -----: | --------------------------------------------------------------------------- |
| 응집도     |   8/10 | route, domain hook, feature composite, presentational leaf 책임을 분리한다. |
| 결합도     |   8/10 | endpoint와 cache policy를 domain hook으로 이동한다.                         |
| 가독성     |   8/10 | 대형 파일을 feature composite와 presentational section으로 분해한다.        |
| 예측가능성 |   8/10 | 필수/보조/mutation error와 invalidation 정책을 matrix로 고정한다.           |

## Core Findings

| Code Smell                                                                                              | Evidence                                                                                                                                         | Impact                                                                 | Tiny Step                                                                             |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Event detail hook이 endpoint, local state, mutation, refetch를 함께 소유                                | `apps/web/src/pages/events/[id]/useEventDetailPage.ts:54`, `:66`, `:70`, `:85`, `:113`, `:125`, `:139`, `:152`, `:175`, `:194`                   | API URL, cache, UX error가 route hook에 결합된다.                      | CC-110에서 필수 query, 보조 query, mutation invalidation을 나눠 migration한다.        |
| Challenge detail hook이 Event와 같은 imperative pattern 반복                                            | `apps/web/src/pages/challenges/[id]/useChallengeDetailPage.ts:42`, `:53`, `:65`, `:76`, `:84`, `:95`, `:107`, `:121`, `:135`                     | Event/Challenge 상세 동작 일관성이 깨진다.                             | CC-120에서 event migration contract를 반복 적용한다.                                  |
| domain hook이 있는데 detail route가 우회                                                                | `apps/web/src/hooks/useEvents.ts:36`, `:73`, `:81`; `apps/web/src/hooks/useChallenges.ts:38`, `:69`, `:77`                                       | key와 invalidation single source가 없다.                               | CC-020에서 key/cache/mutation convention을 먼저 고정한다.                             |
| `CommentList`가 endpoint, fetch, form state, delete mutation, rendering을 동시 소유                     | `apps/web/src/components/social/CommentList.tsx:35`, `:51`, `:63`, `:83`, `:104`, `:138`                                                         | 댓글 정책 변경이 UI 컴포넌트 변경으로 이어진다.                        | CC-130에서 `useComments`, `useCreateComment`, `useDeleteComment`로 분리한다.          |
| `LikeButton`이 optimistic state와 endpoint를 직접 소유                                                  | `apps/web/src/components/social/LikeButton.tsx:29`, `:53`, `:63`, `:72`                                                                          | query cache와 local optimistic state가 어긋날 수 있다.                 | CC-150에서 domain mutation hook이 optimistic cache write/rollback을 소유한다.         |
| `ShareToggle`이 workout PATCH와 error state를 직접 소유                                                 | `apps/web/src/components/workout/ShareToggle.tsx:23`, `:30`                                                                                      | 공개범위 변경 후 다른 workout query가 stale 상태로 남을 수 있다.       | CC-150에서 `useUpdateWorkoutVisibility`로 이동한다.                                   |
| `CrewBoardList`가 826줄 composite에서 route/default selection, composer, query, nested view를 함께 처리 | `apps/web/src/components/crew/CrewBoardList.tsx:28`, `:73`, `:92`, `:116`, `:305`, `:542`                                                        | composite root가 composition 외 책임까지 가진다.                       | CC-210에서 navigation hook과 board feed/posts/detail 파일을 분리한다.                 |
| `ProfileTabs`가 683줄 안에 sticky, swipe, tab panes, normalization을 함께 처리                          | `apps/web/src/components/profile/ProfileTabs.tsx:131`, `:182`, `:208`, `:241`, `:261`, `:491`                                                    | gesture policy와 rendering이 한 리뷰 단위에 묶인다.                    | CC-220에서 interaction hook과 tab pane을 분리한다.                                    |
| Crew detail route root가 fetch/action/context/hero composition을 함께 처리                              | `apps/web/src/pages/crews/[id]/index.tsx:54`, `:88`, `:201`, `:315`                                                                              | composite root가 자식 패널과 business state를 과도하게 공유한다.       | CC-210 이후 crew detail route hook/context 경계를 별도 task로 검토한다.               |
| Error retry가 query reset이 아니라 full reload에 의존                                                   | `apps/web/src/components/common/ErrorBoundary.tsx:38`; `apps/web/src/router.tsx:160`                                                             | SPA cache/retry policy를 사용하지 못한다.                              | CC-010에서 route/layout composite root에 reset-aware boundary를 둔다.                 |
| React Router loader 규칙이 없어 route-critical prefetch 기준이 없다                                     | `apps/web/src/router.tsx`는 lazy element 중심이고 loader contract가 없다.                                                                        | 직접 loader fetch가 도입되면 router data와 Query cache가 나뉠 수 있다. | CC-030에서 loader는 `ensureQueryData(queryOptions)`만 사용하도록 규칙화한다.          |
| funnel 구현이 surface마다 다르다                                                                        | `apps/web/src/components/ui/funnel.tsx:12`; `apps/web/src/pages/posts/new/use-post-composer.ts:37`; `apps/web/src/pages/onboarding/index.tsx:39` | browser history/back behavior와 step state가 일관되지 않다.            | CC-230에서 history-aware `useFunnel` abstraction을 만들고 CC-231/232로 migration한다. |

## Approved Direction

- `AppProviders`는 provider composition만 담당한다.
- query reset recovery는 `QueryClientProvider`와 router context 아래의 route/layout composite root가 담당한다.
- route loader는 직접 `api.fetch`하지 않고 domain query option을 `queryClient.ensureQueryData()`로 prefetch한다.
- domain query/mutation hook은 endpoint, key factory, `enabled`, `select`, invalidation, optimistic cache write/rollback을 담당한다.
- global cache defaults는 `createAppQueryClient`에 유지한다.
- feature composite root는 composition, ephemeral UI state, callback wiring만 담당한다.
- presentational component는 rendering과 event callback 호출만 담당한다.

## Refactoring Task Roadmap

| ID     | Task Name                            |   Impact |   Risk | Priority | Dependency           |
| ------ | ------------------------------------ | -------: | -----: | -------: | -------------------- |
| CC-010 | Route/layout query reset recovery    |     High | Medium |       P0 | 없음                 |
| CC-020 | Query key/cache/mutation convention  |     High |    Low |       P0 | 없음                 |
| CC-030 | Router loader query contract         |     High | Medium |       P0 | CC-020               |
| CC-110 | Event detail query migration         |     High | Medium |       P1 | CC-010, CC-020       |
| CC-120 | Challenge detail query migration     |     High | Medium |       P1 | CC-010, CC-020       |
| CC-130 | Comment query/mutation migration     |     High | Medium |       P1 | CC-020               |
| CC-150 | Social/workout interaction hooks     |   Medium | Medium |       P1 | CC-020               |
| CC-210 | CrewBoardList decomposition          | Med-High | Medium |       P1 | 없음                 |
| CC-220 | ProfileTabs decomposition            |   Medium | Medium |       P1 | 없음                 |
| CC-230 | Funnel abstraction and history       |     High | Medium |       P1 | 없음                 |
| CC-231 | Post composer funnel migration       |   Medium | Medium |       P1 | CC-230               |
| CC-232 | Onboarding funnel migration          |   Medium | Medium |       P1 | CC-230               |
| CC-140 | Profile route query migration        |     High |   High |       P2 | CC-020, CC-220       |
| CC-300 | Query regression verification bundle |     High | Medium |       P2 | implementation tasks |

## Before/After Showcase

### Before

```ts
const [comments, setComments] = useState<Comment[]>([]);
const endpoint =
  entityType === "workout" ? `/workouts/${entityId}/comments` : `/posts/${entityId}/comments`;

const fetchComments = async () => {
  setIsLoading(true);
  const data = await api.fetchSession(`${endpoint}?limit=50`);
  setComments(Array.isArray(data) ? data : data.data);
};

useEffect(() => {
  fetchComments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [entityType, entityId]);

await api.fetch(endpoint, { method: "POST", body: JSON.stringify(body) });
await fetchComments();
```

### After

```ts
const commentsQuery = useComments({ entityType, entityId, limit: 50 });
const createComment = useCreateComment({
  onSuccess: () => queryClient.invalidateQueries({ queryKey: commentKeys.list(entityType, entityId) }),
});
const deleteComment = useDeleteComment({
  onSuccess: () => queryClient.invalidateQueries({ queryKey: commentKeys.list(entityType, entityId) }),
});

return (
  <CommentThread
    comments={commentsQuery.data ?? []}
    isLoading={commentsQuery.isLoading}
    error={commentsQuery.error}
    onRetry={commentsQuery.refetch}
    onCreate={createComment.mutateAsync}
    onDelete={deleteComment.mutateAsync}
  />
);
```

### Expected Diff Shape

```diff
- component owns endpoint construction, fetch, mutation, local server state
+ domain hooks own endpoint, query key, invalidation, mutation lifecycle

- useEffect drives server data flow
+ query key drives server data flow

- mutation success manually calls fetchComments()
+ mutation success invalidates commentKeys.list(entityType, entityId)
```

## Trade-off & Mitigation

| Trade-off          | Risk                                                                       | Mitigation                                                                                                     |
| ------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Bundle             | hook/helper 파일 증가와 broad barrel export로 shared chunk가 커질 수 있다. | route lazy split 유지, domain별 직접 import, 대형 UI split과 query migration 분리.                             |
| Render             | query state 세분화로 render 횟수가 늘 수 있다.                             | `enabled`, `select`, stable callback, tab query lazy enable 적용.                                              |
| Cache              | hook별 `staleTime`/`gcTime` drift가 생길 수 있다.                          | global defaults는 `createAppQueryClient`; domain-specific freshness는 근거 있는 예외만 허용.                   |
| Invalidation       | broad `*.all` invalidation이 과도한 refetch를 만들 수 있다.                | exact detail/child key 우선, delete/navigation만 broad invalidation 허용.                                      |
| Loader cache split | loader에서 직접 fetch하면 router data와 Query cache가 분리된다.            | loader는 domain query option을 `ensureQueryData`로 prefetch하고 component는 같은 `useQuery` option을 사용한다. |
| Funnel history     | history state와 React state가 어긋나면 back/forward UX가 깨진다.           | funnel id, step query param, history state context를 single abstraction에서 관리한다.                          |
| Error UX           | 보조 데이터 실패까지 route error로 승격될 수 있다.                         | 필수 데이터는 route recovery, 보조 데이터는 inline retry, mutation 실패는 toast/inline error.                  |

## Research Basis

| Standard                                   | Source                                                                                                                                                                                 | Applied Rule                                                                         |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Effect는 external system synchronization용 | [React useEffect](https://react.dev/reference/react/useEffect), [React Hooks](https://react.dev/reference/react/hooks)                                                                 | server data flow를 `useEffect`로 직접 orchestration하지 않는다.                      |
| render purity                              | [React Keeping Components Pure](https://react.dev/learn/keeping-components-pure)                                                                                                       | presentational leaf는 deterministic rendering과 callback 호출만 담당한다.            |
| query error reset                          | [TanStack QueryErrorResetBoundary](https://tanstack.com/query/v5/docs/framework/react/reference/QueryErrorResetBoundary)                                                               | fallback retry는 query reset을 우선한다.                                             |
| mutation invalidation                      | [TanStack Invalidations from Mutations](https://tanstack.com/query/v5/docs/framework/react/guides/invalidations-from-mutations)                                                        | mutation success는 related query invalidation 또는 cache write로 후속 처리한다.      |
| loader prefetch                            | [React Router Data Loading](https://reactrouter.com/start/framework/data-loading), [TanStack Query Prefetching](https://tanstack.com/query/v5/docs/framework/react/guides/prefetching) | route loader는 Query cache를 prefetch하고 cache owner를 TanStack Query로 단일화한다. |
| Suspense scope                             | [React Suspense](https://react.dev/reference/react/Suspense), [TanStack Suspense](https://tanstack.com/query/v5/docs/framework/react/guides/suspense)                                  | route 전체 blanket fallback 대신 route/section/tab/widget boundary를 선택한다.       |
| SPA deployment                             | [Vite Static Deploy](https://vite.dev/guide/static-deploy.html), [Vite Shared Options](https://vite.dev/config/shared-options/)                                                        | Vite SPA routing fallback은 host config/runbook 영역으로 유지한다.                   |
| funnel history                             | [use-funnel repository](https://github.com/toss/use-funnel), [@use-funnel browser integration](https://deepwiki.com/toss/use-funnel/3.3-browser-integration)                           | multi-step flow는 typed step/context와 browser history abstraction으로 통일한다.     |
