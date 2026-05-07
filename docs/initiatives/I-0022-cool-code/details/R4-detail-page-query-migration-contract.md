# R4 Detail Page Query Migration Contract

## TL;DR

- 핵심 문제: Event/Challenge detail hooks가 API calls, loading/error, mutation, manual refetch를 모두 처리한다.
- 해결책: 필수 detail query, 보조 query, mutation invalidation을 단계별로 migration한다.
- 기대효과: route hook은 `id`, `tab`, `navigate` orchestration만 남긴다.

## Scope

| Surface          | Current Evidence                                                                        | Target                                                |
| ---------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Event detail     | `apps/web/src/pages/events/[id]/useEventDetailPage.ts:54`, `:66`, `:113`, `:152`        | `useEventDetailQueries`, event mutation hooks         |
| Challenge detail | `apps/web/src/pages/challenges/[id]/useChallengeDetailPage.ts:42`, `:53`, `:95`, `:135` | `useChallengeDetailQueries`, challenge mutation hooks |

## Migration Sequence

| Step | Event                                             | Challenge                               | Risk                          |
| ---- | ------------------------------------------------- | --------------------------------------- | ----------------------------- |
| A    | 필수 detail query migration                       | 필수 detail query migration             | route fallback behavior       |
| B    | `myResult`/`results` 보조 query migration         | leaderboard 보조 query migration        | inline retry/empty state      |
| C    | register/cancel/result/link mutation invalidation | join/leave/progress/delete invalidation | stale cache                   |
| D    | route hook local server state 제거                | route hook local server state 제거      | tests expecting loading flags |

## Before

```ts
const [event, setEvent] = useState<EventDetail | null>(null);
const [error, setError] = useState<string | null>(null);

const fetchEvent = useCallback(async () => {
  const data = await api.fetch<EventDetail>(`/events/${eventId}`);
  setEvent(data);
}, [eventId]);

const registerEvent = useCallback(async () => {
  await api.fetch(`/events/${eventId}/register`, { method: "POST" });
  await fetchEvent();
}, [eventId, fetchEvent]);
```

## After

```ts
const eventQuery = useEvent(eventId);
const myResultQuery = useEventMyResult(eventId, { enabled: eventQuery.isSuccess });
const resultsQuery = useEventResults(eventId, {
  enabled: activeTab === "results",
  throwOnError: false,
});

const registerMutation = useRegisterEvent({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    queryClient.invalidateQueries({ queryKey: eventKeys.myResult(eventId) });
  },
});
```

## Acceptance Criteria

- route hook no longer imports `api-client`.
- mutation success no longer calls local `fetch*()` for server-state refresh.
- 필수 detail failure는 route/page recovery로 연결한다.
- 보조 query failure는 inline retry state를 노출한다.
- implementation task는 event와 challenge를 한 PR에 섞지 않는다.

## References

- TanStack Query: [Query Functions](https://tanstack.com/query/v5/docs/react/guides/query-functions)
- TanStack Query: [Invalidations from Mutations](https://tanstack.com/query/v5/docs/framework/react/guides/invalidations-from-mutations)
- TkDodo: [React Query as a State Manager](https://tkdodo.eu/blog/react-query-as-a-state-manager)
