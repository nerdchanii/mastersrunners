# TODO and FIXME Policy

Use `TODO`, `FIXME`, and similar markers only when the follow-up path is explicit.

## Rule

- Do not leave free-floating `TODO` or `FIXME` markers in the codebase.
- Every new `TODO` or `FIXME` must point to an existing or newly created task.
- If a follow-up task does not exist yet, create one before the current task is archived.

## Required Form

Prefer one of these forms:

```ts
// TODO(I-0006-060): explain the bounded follow-up
// FIXME(I-0006-090): explain the broken behavior or missing guard
```

If a task ID is not yet known, do not commit the marker yet.

## Cleanup Loop

- Review lingering `TODO` and `FIXME` markers during related task work.
- Remove the marker when the linked task lands.
- If the marker becomes stale or no longer valid, delete it instead of carrying it forward.
