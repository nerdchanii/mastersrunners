# R5 Social Interaction Hooks

## TL;DR

- 핵심 문제: `CommentList`, `LikeButton`, `ShareToggle`이 UI component 안에서 endpoint와 mutation policy를 소유한다.
- 해결책: comments, likes, workout visibility를 domain mutation hook으로 옮기고 UI는 callback과 표시 상태만 사용한다.
- 기대효과: social interaction cache drift와 silent mutation failure를 줄인다.

## Target Surfaces

| Surface       | Evidence                                                                   | Smell                                     | Target Hook                                            |
| ------------- | -------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------ |
| `CommentList` | `apps/web/src/components/social/CommentList.tsx:51`, `:63`, `:104`, `:138` | endpoint + fetch + form + delete + render | `useComments`, `useCreateComment`, `useDeleteComment`  |
| `LikeButton`  | `apps/web/src/components/social/LikeButton.tsx:29`, `:53`, `:63`, `:72`    | button-local optimistic state             | `useToggleSocialLike` or domain-specific mutation hook |
| `ShareToggle` | `apps/web/src/components/workout/ShareToggle.tsx:23`, `:30`                | select-local PATCH and error              | `useUpdateWorkoutVisibility`                           |

## Responsibility Split

| Concern                               | Owner                                |
| ------------------------------------- | ------------------------------------ |
| endpoint path                         | domain hook                          |
| query key                             | domain hook                          |
| optimistic cache write/rollback       | domain mutation hook                 |
| toast/inline message                  | feature composite or route page hook |
| input text/reply target/delete dialog | feature composite                    |
| visual button/select/thread           | presentational component             |

## Comment After Contract

```ts
function CommentList({ entityType, entityId }: CommentListProps) {
  const comments = useComments({ entityType, entityId, limit: 50 });
  const createComment = useCreateComment({ entityType, entityId });
  const deleteComment = useDeleteComment({ entityType, entityId });

  return (
    <CommentThread
      comments={comments.data ?? []}
      isLoading={comments.isLoading}
      error={comments.error}
      onRetry={comments.refetch}
      onCreate={createComment.mutateAsync}
      onDelete={deleteComment.mutateAsync}
    />
  );
}
```

## Non-Goals

- 댓글 UX redesign.
- optimistic update 전면 도입.
- post/workout API contract 변경.
- route-level Suspense blanket 적용.

## Verification Focus

| Case                              | Expected                                        |
| --------------------------------- | ----------------------------------------------- |
| comment load failure              | inline error + retry                            |
| comment create failure            | input state preserved + inline/toast error      |
| comment delete success            | exact comment list cache updates or invalidates |
| like toggle failure               | optimistic rollback                             |
| workout visibility update success | detail/list/feed query stale state 제거         |

## References

- React: [Keeping Components Pure](https://react.dev/learn/keeping-components-pure)
- TanStack Query: [Mutations](https://tanstack.com/query/v5/docs/react/guides/mutations)
- TkDodo: [React Query Error Handling](https://tkdodo.eu/blog/react-query-error-handling)
