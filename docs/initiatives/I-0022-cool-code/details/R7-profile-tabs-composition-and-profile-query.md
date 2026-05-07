# R7 Profile Tabs Composition And Profile Query

## TL;DR

- 핵심 문제: `ProfileTabs` UI decomposition과 profile route query migration이 서로 다른 리스크인데 현재 같은 surface에 얽혀 있다.
- 해결책: `ProfileTabs` split을 먼저 끝낸 뒤 profile route 직접 fetch를 domain hooks로 옮긴다.
- 기대효과: layout/gesture 회귀와 server-state/cache 회귀를 분리한다.

## Current Hotspots

| Surface       | Evidence                                                                                      | Smell                                                   |
| ------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `ProfileTabs` | `apps/web/src/components/profile/ProfileTabs.tsx:131`, `:182`, `:208`, `:241`, `:261`, `:491` | sticky, swipe, tab panes, normalization in 683 lines    |
| profile route | `apps/web/src/pages/profile/index.tsx:99`, `:110`, `:145`, `:148`                             | profile/stats/tab data in route `useEffect` local state |

## Sequencing

| Task   | Dependency     | Scope                                         |
| ------ | -------------- | --------------------------------------------- |
| CC-220 | 없음           | `ProfileTabs` interaction and pane split only |
| CC-140 | CC-020, CC-220 | profile route query migration                 |

## Target Split

| Unit                        | Owns                                                 |
| --------------------------- | ---------------------------------------------------- |
| `useProfileTabsInteraction` | active tab safety, sticky visibility, swipe gesture  |
| `ProfileTabBar`             | tab trigger rendering                                |
| `ProfilePostsPane`          | posts pane rendering                                 |
| `ProfileWorkoutsPane`       | workouts pane rendering                              |
| `ProfileCrewsPane`          | crews pane rendering                                 |
| `useMyProfilePage`          | auth route orchestration and domain hook composition |
| profile domain hooks        | profile detail, stats, tab data query keys           |

## Query Migration Contract

```diff
- route useEffect fetches profile, crews, follower preview
- route useEffect fetches active tab data
+ domain hooks expose profile detail/stats/follower preview/tab queries
+ activeTab participates in query key or enabled condition
+ route keeps auth redirect and navigation callbacks only
```

## Verification Focus

| Flow                            | Expected                               |
| ------------------------------- | -------------------------------------- |
| unauthenticated profile route   | login redirect preserved               |
| posts/workouts/crews tab switch | no stale cross-tab render              |
| sticky tab scroll               | existing visibility behavior preserved |
| mobile swipe                    | existing threshold behavior preserved  |

## References

- React: [useEffect](https://react.dev/reference/react/useEffect)
- TanStack Query: [Query Functions](https://tanstack.com/query/v5/docs/react/guides/query-functions)
- TkDodo: [Effective React Query Keys](https://tkdodo.eu/blog/effective-react-query-keys)
