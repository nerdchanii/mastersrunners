# R6 Crew Board And Crew Detail Composition

## TL;DR

- 핵심 문제: `CrewBoardList`와 crew detail root가 composition 외에 selection, route defaults, query, action, context shaping을 동시에 처리한다.
- 해결책: query migration 없이 먼저 **feature composite split**과 **ephemeral navigation hook**을 분리한다.
- 기대효과: crew board UI 회귀와 data/cache migration 회귀를 분리한다.

## Current Hotspots

| File                         | Evidence                                                                                                                | Smell                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `CrewBoardList.tsx`          | `:28` large props, `:73` query, `:92` default selection effect, `:305` composer effect, `:542` repeated composer effect | board navigation, composer state, query, nested views in 826 lines |
| `pages/crews/[id]/index.tsx` | `:54` fetch/state, `:88` actions, `:201` hero composition, `:315` large outlet context                                  | route root owns business state and panel context                   |

## Target Split

| Unit                     | Owns                                                          |
| ------------------------ | ------------------------------------------------------------- |
| `useCrewBoardNavigation` | selected board/post, routed defaults, composer nonce handling |
| `CrewBoardRoot`          | feature composition and ephemeral UI state wiring             |
| `CrewBoardFeed`          | feed section composition                                      |
| `CrewBoardPosts`         | board post list composition                                   |
| `CrewBoardPostDetail`    | post detail composition                                       |
| `CrewBoardComposerEntry` | composer open/close entry point                               |
| crew detail page hook    | crew detail route params, permission/auth orchestration       |

## Sequencing

| Step    | Scope                               | Guardrail                    |
| ------- | ----------------------------------- | ---------------------------- |
| CC-210a | extract navigation hook             | no endpoint/key changes      |
| CC-210b | split feed/posts/detail files       | no query migration           |
| CC-210c | shrink prop chains                  | preserve public behavior     |
| future  | crew detail route context hardening | separate task after UI split |

## Composite Rule

- Composite root may own composition and ephemeral UI state.
- Composite root must not own endpoint, query key, invalidation, auth redirect.
- If a child needs domain data, pass data/callbacks or use an existing domain hook at an approved composite boundary.

## Verification Focus

| Flow                     | Expected                                |
| ------------------------ | --------------------------------------- |
| direct routed board post | same post opens                         |
| board switch             | selected board state preserved          |
| composer nonce           | opens once, closes on inactive panel    |
| auth-gated board access  | existing auth dialog behavior unchanged |

## References

- Repo convention: `design/frontend/conventions.md`
- React: [Keeping Components Pure](https://react.dev/learn/keeping-components-pure)
