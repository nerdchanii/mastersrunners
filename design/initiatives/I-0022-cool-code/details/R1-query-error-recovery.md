# R1 Query Error Recovery

## Status

승인안. 실제 `apps/web` 코드는 이번 initiative 문서 작업에서 수정하지 않는다.

## Intent

프론트엔드 리팩토링의 첫 단계는 Suspense 전면 전환이 아니라 query-aware recovery와 query convention을 세우는 것이다. 그 다음 상세 화면의 직접 fetch를 `useQuery/useMutation` hook으로 단계적으로 옮긴다.

이 방향은 Suspense와 ErrorBoundary 사용 자체를 피하는 것이 아니다. 목표는 route, section, tab, widget 단위로 boundary를 작게 나누어 각 데이터 성격에 맞는 fallback과 recovery UI를 제공하는 것이다. 반려 대상은 모든 query와 mutation을 같은 route-level fallback/error 정책에 묶는 blanket 전환이다.

## Scope

| 범위                            | 포함 여부 | 설명                                                                                                |
| ------------------------------- | --------- | --------------------------------------------------------------------------------------------------- |
| Query reset boundary            | 포함      | route error fallback의 "다시 시도"가 query error reset을 호출하도록 설계한다.                       |
| Query key convention            | 포함      | domain별 `keys`와 mutation invalidation 표를 만든다.                                                |
| Event detail migration          | 포함      | `useEventDetailPage`의 직접 fetch를 domain query hook으로 이동한다.                                 |
| Challenge detail migration      | 포함      | event detail과 동일한 패턴으로 migration한다.                                                       |
| CommentList migration           | 포함      | endpoint 구성, fetch, mutation을 comment hook으로 이동한다.                                         |
| Granular Suspense/ErrorBoundary | 포함      | 필수 route 데이터, 보조 섹션, 탭, 댓글처럼 recovery 범위가 다른 영역을 독립 fallback 단위로 나눈다. |
| Blanket Suspense                | 제외      | 상세 route 전체 UX 변경 위험이 크므로 채택하지 않는다.                                              |
| 대형 컴포넌트 split 동시 진행   | 제외      | query migration 회귀와 UI 분해 회귀를 분리하기 위해 별도 task로 둔다.                               |

## Design Rules

### Query Recovery

- `AppProviders`는 provider graph만 소유한다. route recovery를 provider layer로 올리지 않는다.
- route/layout composite root는 `QueryClientProvider`와 router context 아래에서 `QueryErrorResetBoundary`와 reset-aware `ErrorBoundary`를 함께 사용한다.
- "다시 시도"는 `window.location.reload()` 대신 boundary reset과 query reset을 우선 호출한다.
- 전체 reload는 fallback의 마지막 수단으로만 남긴다.
- 필수 상세 데이터는 route 또는 page-level error boundary에 연결한다.
- 보조 섹션과 탭은 더 작은 Suspense/ErrorBoundary 또는 inline recovery 단위로 분리한다.
- 보조 데이터는 inline retry와 loading state로 표현한다.

### Query Policy

| Data Type        | Loading                  | Error                                    | Retry                           |
| ---------------- | ------------------------ | ---------------------------------------- | ------------------------------- |
| 필수 상세 데이터 | route 또는 page skeleton | route error recovery                     | boundary reset                  |
| 독립 섹션 데이터 | section skeleton         | section error boundary 또는 inline error | section reset 또는 inline retry |
| 보조 탭 데이터   | tab 내부 skeleton        | tab 내부 empty/error state               | inline retry                    |
| mutation         | button pending           | toast 또는 form inline error             | 사용자가 재시도                 |
| background list  | 기존 데이터 유지         | non-blocking indicator                   | query retry 또는 manual refresh |

### Key And Invalidation

```ts
export const eventKeys = {
  all: ["events"] as const,
  list: (params?: EventListParams) => [...eventKeys.all, "list", params] as const,
  detail: (eventId: string) => [...eventKeys.all, "detail", eventId] as const,
  myResult: (eventId: string) => [...eventKeys.detail(eventId), "my-result"] as const,
  results: (eventId: string) => [...eventKeys.detail(eventId), "results"] as const,
};
```

| Mutation            | Invalidates                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------- |
| register event      | `eventKeys.detail(eventId)`, `eventKeys.myResult(eventId)`, relevant event lists         |
| cancel registration | `eventKeys.detail(eventId)`, `eventKeys.myResult(eventId)`, relevant event lists         |
| submit result       | `eventKeys.detail(eventId)`, `eventKeys.myResult(eventId)`, `eventKeys.results(eventId)` |
| link/unlink workout | `eventKeys.detail(eventId)`, `eventKeys.myResult(eventId)`                               |
| delete event        | `eventKeys.all` after navigation                                                         |

## Migration Sequence

1. CC-010에서 reset-aware `ErrorBoundary` 설계를 구현한다.
2. CC-020에서 event/challenge/comment/profile query key와 invalidation convention을 문서와 코드에 반영한다.
3. CC-110에서 `useEventDetailPage`의 필수 상세 데이터, 보조 results, my result, mutations를 domain query hook으로 분리한다.
4. CC-120에서 `useChallengeDetailPage`를 같은 규칙으로 migration한다.
5. CC-130에서 `CommentList`의 endpoint 구성, 댓글 조회, 등록, 삭제 mutation을 comment hook으로 이동한다.
6. CC-210과 CC-220에서 query migration과 독립적으로 대형 presentational component를 분해한다.
7. CC-140에서 profile route를 migration하되, `ProfileTabs` 분해 이후에 진행한다.
8. CC-300에서 route recovery, inline retry, mutation invalidation regression bundle을 고정한다.

`CC-*`는 initiative 내부 추적 ID다. 실행 task는 `tasks/todo/I-0022-###-web-*.md` 형식으로 만든다.

## Before/After Contract

| Before                                           | After                                                  |
| ------------------------------------------------ | ------------------------------------------------------ |
| route hook이 `api.fetch` endpoint를 직접 안다.   | domain hook이 endpoint와 query key를 소유한다.         |
| mutation 성공 후 `fetchEvent()`를 직접 호출한다. | mutation 성공 후 명시적 query invalidation을 호출한다. |
| 보조 데이터 실패가 무음 처리된다.                | 보조 데이터는 inline retry/empty state를 노출한다.     |
| route fallback retry가 full reload다.            | route fallback retry가 query reset을 우선 호출한다.    |

## Acceptance Criteria For Follow-up Tasks

- 직접 source 수정 task는 각 task 파일에 verify command를 명시한다.
- route error recovery 변경은 `QueryErrorResetBoundary` reset 동작을 검증한다.
- event/challenge migration은 mutation 성공 후 detail과 보조 query가 갱신되는지 검증한다.
- comment migration은 댓글 조회 실패, 등록 실패, 삭제 성공 후 갱신을 검증한다.
- 대형 컴포넌트 split은 UI 구조 변경과 query migration을 같은 task에 섞지 않는다.
