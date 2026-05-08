# R2 SLAP Layering And Route Composition

## TL;DR

- 핵심 문제: route, hook, composite, leaf가 같은 파일에서 서로 다른 추상화 레벨을 처리한다.
- 해결책: **provider**, **route/layout composite**, **route page hook**, **domain hook**, **feature composite**, **presentational leaf**를 분리한다.
- 기대효과: composite root는 composition만 담당하고 endpoint/cache/auth redirect를 모르게 된다.

## Status

승인안. Critic review 반영본.

## Layer Contract

| Layer                       | Owns                                                                                      | Must Not Own                                              | Evidence Target                                |
| --------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------- |
| `AppProviders`              | provider graph, `QueryClientProvider`, theme/auth/realtime/toaster                        | route fallback, route retry, query reset UI               | `apps/web/src/app/app-providers.tsx`           |
| Route/Layout Composite Root | `Outlet`, Suspense fallback, reset-aware ErrorBoundary, layout-level recovery             | endpoint, query key, invalidation, optimistic cache write | `apps/web/src/router.tsx`                      |
| Route Page Hook             | params, active tab, navigation callback, route auth gate orchestration                    | API URL, cache defaults, mutation rollback                | `useEventDetailPage`, `useChallengeDetailPage` |
| Domain Query/Mutation Hook  | endpoint, key factory, `enabled`, `select`, invalidation, optimistic cache write/rollback | modal state, route redirect, JSX                          | `apps/web/src/hooks/*`                         |
| Feature Composite Root      | section composition, ephemeral UI state, callback wiring, data-to-prop shaping            | endpoint, query key, auth redirect                        | `CrewBoardList`, future split roots            |
| Presentational Leaf         | deterministic rendering, local DOM event callback                                         | fetch, query primitive, cache policy                      | tab panes, cards, forms                        |

## SLAP Score

| Surface          | Current | Target | Primary Violation                                                        |
| ---------------- | ------: | -----: | ------------------------------------------------------------------------ |
| Event detail     |    4/10 |   8/10 | fetch/mutation/refetch/local UI state in route hook                      |
| Challenge detail |    4/10 |   8/10 | Event detail pattern duplicated                                          |
| CommentList      |    3/10 |   8/10 | endpoint/fetch/form/delete/rendering in one component                    |
| CrewBoardList    |    4/10 |   8/10 | board navigation, composer state, query hooks, nested views in 826 lines |
| ProfileTabs      |    5/10 |   8/10 | sticky, swipe, normalization, panes in 683 lines                         |

## Critic Amendments

- `QueryErrorResetBoundary first` does not mean `AppProviders` owns route recovery.
- replacement composite roots are not forced into presentational-only leaves.
- domain mutation hooks own optimistic cache writes because rollback requires query-key knowledge.
- global query defaults stay in `createAppQueryClient`; domain hooks justify only domain-specific freshness.
- `CC-*` IDs stay initiative-local; canonical execution uses `tasks/todo/I-0022-###-web-*.md`.

## References

- React: [Keeping Components Pure](https://react.dev/learn/keeping-components-pure)
- React: [useEffect](https://react.dev/reference/react/useEffect)
- TanStack Query: [QueryErrorResetBoundary](https://tanstack.com/query/v5/docs/framework/react/reference/QueryErrorResetBoundary)
- Repo convention: `design/frontend/conventions.md`
