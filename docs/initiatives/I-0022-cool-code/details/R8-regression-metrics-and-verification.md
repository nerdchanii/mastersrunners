# R8 Regression Metrics And Verification

## TL;DR

- 핵심 문제: 리팩토링 대상이 route recovery, cache invalidation, UI decomposition을 동시에 건드릴 수 있다.
- 해결책: implementation task별 검증 초점을 분리하고 마지막 CC-300에서 회귀 묶음을 고정한다.
- 기대효과: 회귀 원인이 data policy인지 UI split인지 빠르게 좁혀진다.

## Metrics

| Metric         | Risk                                                      | Measurement                                                                |
| -------------- | --------------------------------------------------------- | -------------------------------------------------------------------------- |
| Bundle         | hook/helper split or barrel imports increase shared chunk | `pnpm --filter @masters/web build`, inspect emitted chunk diff when needed |
| Render         | finer query state increases render count                  | targeted route smoke and React profiler only when UI jank appears          |
| Cache          | broad invalidation creates excess refetch                 | query key exactness review and mutation tests                              |
| Loader         | direct loader fetch creates router/query cache split      | loader code review: `ensureQueryData(queryOptions)` only                   |
| Error Recovery | route fallback catches auxiliary errors                   | failure fixtures for detail vs auxiliary data                              |
| UX State       | decomposition breaks ephemeral state                      | Playwright/route tests for tab, composer, auth gate, back navigation       |
| Funnel History | step state and browser history drift                      | back/forward/reload checks for funnel flows                                |

## Task Verification Focus

| Task   | Required Focus                                                                |
| ------ | ----------------------------------------------------------------------------- |
| CC-010 | retry calls boundary/query reset before full reload fallback                  |
| CC-020 | no duplicate `defaultOptions`; key factories include fetch-changing variables |
| CC-030 | loader prefetch uses domain query options and `ensureQueryData` only          |
| CC-110 | event detail/myResult/results invalidation after mutations                    |
| CC-120 | challenge leaderboard inline failure; detail route failure recovery           |
| CC-130 | comment load/create/delete failure and success cache update                   |
| CC-150 | like rollback; workout visibility query freshness                             |
| CC-210 | crew board routed post, composer nonce, auth gate unchanged                   |
| CC-220 | profile tabs sticky/swipe/pane rendering unchanged                            |
| CC-230 | funnel abstraction manages typed steps, context, push/replace/back            |
| CC-231 | post composer back/forward and step context behavior                          |
| CC-232 | onboarding back/forward and validation behavior                               |
| CC-140 | profile auth redirect, profile stats, tab data cache behavior                 |
| CC-300 | lint, typecheck, web build, targeted route regression bundle                  |

## Acceptance Gates

| Gate          | Command / Check                                         |
| ------------- | ------------------------------------------------------- |
| Static        | `pnpm lint`                                             |
| Types         | `pnpm typecheck`                                        |
| Web build     | `pnpm --filter @masters/web build`                      |
| Focused tests | route/component specs added by each implementation task |
| Manual smoke  | route recovery, inline retry, mutation success refresh  |

## Non-Goals

- New global performance framework.
- Blanket React profiler requirement for every small refactor.
- Snapshot-only UI verification.
- Production deploy verification for docs-only changes.

## References

- TanStack Query: [Query Retries](https://tanstack.com/query/v5/docs/react/guides/query-retries)
- Vite: [Building for Production](https://vite.dev/guide/build)
- Repo guide: `docs/guides/agent-self-review.md`
