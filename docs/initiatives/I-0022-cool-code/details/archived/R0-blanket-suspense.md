# R0 Blanket Suspense

## Status

반려안. 기록 보존용 문서이며 후속 구현의 기준으로 사용하지 않는다.

## Original Proposal

모든 route data hook을 `useSuspenseQuery`로 바꾸고, query와 mutation에 blanket `throwOnError`를 적용한다. route 수준 `<Suspense>`와 `<ErrorBoundary>`가 loading/error를 일괄 처리하도록 만든다.

## Why It Was Rejected

| 결정                                            | 반려 이유                                                                                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| blanket `useSuspenseQuery`                      | 필수 상세 데이터와 보조 탭 데이터를 같은 fallback으로 묶어 results/leaderboard 같은 보조 영역 실패까지 route 전체 UX를 바꿀 수 있다. |
| blanket `throwOnError`                          | 댓글 작성, 참가 신청, 좋아요 같은 사용자 mutation 실패가 toast/form error 대신 route fallback으로 승격될 수 있다.                    |
| query migration과 대형 컴포넌트 split 동시 진행 | 회귀 원인이 fetch 정책 변경인지 UI 분해인지 분리하기 어렵다.                                                                         |
| full-page error 중심 recovery                   | 현재 fallback의 retry가 `window.location.reload()`에 의존하므로 SPA query cache reset의 장점을 살리지 못한다.                        |

이 반려는 Suspense와 ErrorBoundary 자체를 반대하는 결정이 아니다. route, section, tab, widget 단위로 fallback과 recovery 범위를 나누는 granular boundary 전략은 R1의 후속 목표로 유지한다.

## Risk Examples

### 보조 탭 실패가 route 실패로 승격

```ts
const results = useSuspenseQuery({
  queryKey: eventKeys.results(eventId),
  queryFn: () => api.fetch(`/events/${eventId}/results`),
  throwOnError: true,
});
```

이 형태는 event detail 자체는 정상이어도 results 탭 fetch 실패가 전체 route error로 보일 수 있다. 보조 탭 데이터는 inline retry가 더 적합하다.

### 사용자 mutation 실패가 navigation-scale error로 승격

```ts
const register = useMutation({
  mutationFn: () => api.fetch(`/events/${eventId}/register`, { method: "POST" }),
  throwOnError: true,
});
```

참가 신청 실패는 사용자가 버튼을 다시 누를 수 있는 toast 또는 inline error가 적합하다. route boundary로 던지면 recovery 범위가 실제 실패 범위보다 커진다.

## Preserved Lessons

- Suspense는 필수 상세 데이터처럼 route 진입을 막아야 하는 데이터에만 제한적으로 검토한다.
- 보조 섹션이나 탭은 작은 Suspense/ErrorBoundary 또는 inline recovery로 독립시킬 수 있다.
- mutation error는 기본적으로 사용자 action의 맥락에서 처리한다.
- error boundary를 개선하려면 먼저 query reset과 연결해야 한다.
- 대형 컴포넌트 분해는 data migration과 별도 task로 둔다.

## Replacement

대체안은 [../R1-query-error-recovery.md](../R1-query-error-recovery.md)다. R1은 query-aware route error recovery와 plain `useQuery/useMutation` migration을 먼저 수행한다.
