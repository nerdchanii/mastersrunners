# R9 Router Loader Query Contract

## TL;DR

- 핵심 문제: React Router loader를 직접 fetch로 도입하면 router data와 TanStack Query cache가 나뉜다.
- 해결책: loader는 **domain query option**을 `queryClient.ensureQueryData()`로 prefetch하고 component는 같은 option을 `useQuery`로 읽는다.
- 기대효과: route-critical data prefetch, route error recovery, cache invalidation owner를 동시에 일관화한다.

## Status

승인안. CC-030의 source-of-truth 후보.

## Golden Rule

| Rule             | Required                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------- |
| loader fetch     | `queryClient.ensureQueryData(domainQueries.detail(id))`                                     |
| component read   | `useQuery(domainQueries.detail(id))`                                                        |
| mutation refresh | `queryClient.invalidateQueries({ queryKey })` or `setQueryData`                             |
| forbidden        | loader-level direct `api.fetch`, independent loader cache, component-side duplicate queryFn |

## Before

```ts
export async function eventLoader({ params }: LoaderFunctionArgs) {
  return api.fetch<EventDetail>(`/events/${params.eventId}`);
}

function EventPage() {
  const event = useLoaderData() as EventDetail;
  const eventQuery = useEvent(event.id);
  // router data and Query cache can diverge
}
```

## After

```ts
export const eventQueries = {
  detail: (eventId: string) =>
    queryOptions({
      queryKey: eventKeys.detail(eventId),
      queryFn: () => api.fetch<EventDetail>(`/events/${eventId}`),
    }),
};

export const eventDetailLoader =
  (queryClient: QueryClient) =>
  ({ params }: LoaderFunctionArgs) =>
    queryClient.ensureQueryData(eventQueries.detail(params.eventId!));

function EventPage() {
  const { eventId } = useParams();
  const eventQuery = useQuery(eventQueries.detail(eventId!));
  return <EventView event={eventQuery.data} />;
}
```

## Loader Scope

| Use Loader For                        | Keep In Query/Component |
| ------------------------------------- | ----------------------- |
| route-critical detail prefetch        | auxiliary tab data      |
| redirect/permission precondition      | user mutation state     |
| route-level error boundary trigger    | inline widget retry     |
| parent layout data needed by children | ephemeral UI state      |

## Layout And Outlet Contract

```ts
{
  path: "/events/:eventId",
  loader: eventDetailLoader(queryClient),
  element: <EventLayout />,
  errorElement: <RouteErrorBoundary />,
  children: [
    { index: true, element: <EventInfoPage /> },
    { path: "results", element: <EventResultsPage /> },
  ],
}
```

| Layer       | Owns                                            |
| ----------- | ----------------------------------------------- |
| loader      | Query cache prefetch only                       |
| layout      | `Outlet`, shared layout, route recovery surface |
| child page  | tab/section composition                         |
| domain hook | endpoint, query key, invalidation               |

## Refactoring Rules

- Route loader code must import query option factories, not `api-client`.
- Query option factory must be usable by both loader and `useQuery`.
- Loader result can be ignored by component if `useQuery` reads the same cache.
- Parent layout may pass already-read query data through `Outlet context`, but it must not become a second cache.
- Loader adoption is optional for non-critical widget data.

## Task Boundaries

| ID     | Task                                             | Scope                                      |
| ------ | ------------------------------------------------ | ------------------------------------------ |
| CC-030 | `I-0022-030-web-router-loader-query-contract.md` | query option factory and loader convention |
| CC-111 | event loader pilot                               | event detail critical data only            |
| CC-121 | challenge loader pilot                           | challenge detail critical data only        |
| CC-141 | profile loader pilot                             | after profile query migration              |

## Verification Focus

| Check                          | Expected                                      |
| ------------------------------ | --------------------------------------------- |
| loader source imports          | no direct `api-client` import                 |
| component source               | same query option used with `useQuery`        |
| mutation after loader prefetch | `invalidateQueries` refreshes visible data    |
| route error                    | loader query rejection reaches route boundary |

## References

- React Router: [Data Loading](https://reactrouter.com/start/framework/data-loading)
- React Router: [Error Boundaries](https://reactrouter.com/how-to/error-boundary)
- TanStack Query: [Prefetching](https://tanstack.com/query/v5/docs/framework/react/guides/prefetching)
- TanStack Query: [Query Options](https://tanstack.com/query/v5/docs/framework/react/guides/query-options)
- TkDodo: [Effective React Query Keys](https://tkdodo.eu/blog/effective-react-query-keys)
