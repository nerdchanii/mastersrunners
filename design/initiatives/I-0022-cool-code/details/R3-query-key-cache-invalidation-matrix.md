# R3 Query Key Cache Invalidation Matrix

## TL;DR

- 핵심 문제: mutation success가 `fetchEvent()` 같은 수동 재조회와 silent failure로 흩어져 있다.
- 해결책: domain별 **key factory**, **exact invalidation**, **optimistic rollback ownership**을 matrix로 고정한다.
- 기대효과: mutation 후 stale UI와 과도한 refetch를 동시에 줄인다.

## Status

승인안. CC-020의 source-of-truth 후보.

## Cache Ownership

| Concern                 | Owner                                  | Rule                                                                                      |
| ----------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------- |
| global `defaultOptions` | `createAppQueryClient`                 | route/component/domain hook에서 중복 설정하지 않는다.                                     |
| key factory             | domain hook module                     | fetch 조건이 바뀌면 query key도 바뀐다.                                                   |
| `enabled` / `select`    | domain hook                            | params, tab, auth 조건을 명시한다.                                                        |
| optimistic cache write  | domain mutation hook                   | rollback에 필요한 previous cache snapshot을 hook이 소유한다.                              |
| toast / inline message  | route page hook 또는 feature composite | mutation error를 route boundary로 던지지 않는다.                                          |
| route loader prefetch   | route loader factory                   | direct `api.fetch` 대신 domain query option을 `queryClient.ensureQueryData()`로 실행한다. |

## Loader And Query Contract

```ts
export const userQueries = {
  detail: (userId: string) =>
    queryOptions({
      queryKey: userKeys.detail(userId),
      queryFn: () => api.fetch<UserDetail>(`/profile/${userId}`),
    }),
};

export const userDetailLoader =
  (queryClient: QueryClient) =>
  ({ params }: LoaderFunctionArgs) =>
    queryClient.ensureQueryData(userQueries.detail(params.userId!));
```

| Rule                                            | Reason                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------ |
| loader uses `ensureQueryData(queryOptions)`     | router loader data와 Query cache split을 막는다.                   |
| component uses same query option via `useQuery` | loader prefetch 결과를 cache hit로 읽는다.                         |
| mutation invalidates TanStack Query keys only   | revalidation owner를 단일화한다.                                   |
| loader must not own `staleTime` drift           | freshness는 domain query option 또는 global defaults에서 결정한다. |

## Key Shape

```ts
export const eventKeys = {
  all: ["events"] as const,
  list: (params?: EventListParams) => [...eventKeys.all, "list", params] as const,
  detail: (eventId: string) => [...eventKeys.all, "detail", eventId] as const,
  myResult: (eventId: string) => [...eventKeys.detail(eventId), "my-result"] as const,
  results: (eventId: string) => [...eventKeys.detail(eventId), "results"] as const,
};
```

## Invalidation Matrix

| Domain      | Mutation                 | Invalidates / Updates                                                                    | Avoid                                              |
| ----------- | ------------------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Event       | register/cancel          | `eventKeys.detail(eventId)`, `eventKeys.myResult(eventId)`, relevant lists               | default `eventKeys.all`                            |
| Event       | submit result            | `eventKeys.detail(eventId)`, `eventKeys.myResult(eventId)`, `eventKeys.results(eventId)` | manual `fetchEvent()`                              |
| Event       | link/unlink workout      | `eventKeys.detail(eventId)`, `eventKeys.myResult(eventId)`                               | broad list refetch unless list displays link state |
| Event       | delete                   | navigate, then `eventKeys.all`                                                           | staying on deleted detail                          |
| Challenge   | join/leave               | `challengeKeys.detail(challengeId)`, relevant lists                                      | local `setChallenge` patch without cache update    |
| Challenge   | update progress          | `challengeKeys.detail(challengeId)`, `challengeKeys.leaderboard(challengeId)`            | leaderboard silent failure                         |
| Comment     | create/delete            | `commentKeys.list(entityType, entityId)` or exact cache update                           | endpoint construction inside component             |
| Social Like | toggle                   | exact entity detail/feed key, optimistic rollback in domain hook                         | independent button-only count state                |
| Workout     | update visibility        | `workoutKeys.detail(workoutId)`, relevant workout/feed lists                             | select component owning PATCH                      |
| Profile     | edit/follow/tab reads    | profile detail/stats/tab keys by user id                                                 | tab data in route `useEffect` local arrays         |
| Crew Board  | create post/comment/like | board post detail/feed keys                                                              | board UI component owning cache policy             |

## Error Policy

| Data Type           | Error Surface                               | Retry                           |
| ------------------- | ------------------------------------------- | ------------------------------- |
| 필수 상세 데이터    | route/page error boundary                   | `QueryErrorResetBoundary` reset |
| 보조 탭/섹션 데이터 | inline error or section boundary            | inline `refetch`                |
| mutation            | toast or form inline error                  | user action retry               |
| background list     | keep previous data + non-blocking indicator | query retry/manual refresh      |

## References

- TanStack Query: [Invalidations from Mutations](https://tanstack.com/query/v5/docs/framework/react/guides/invalidations-from-mutations)
- TanStack Query: [Prefetching](https://tanstack.com/query/v5/docs/framework/react/guides/prefetching)
- React Router: [Data Loading](https://reactrouter.com/start/framework/data-loading)
- TanStack Query: [Important Defaults](https://tanstack.com/query/v5/docs/framework/react/guides/important-defaults)
- TkDodo: [Effective React Query Keys](https://tkdodo.eu/blog/effective-react-query-keys)
