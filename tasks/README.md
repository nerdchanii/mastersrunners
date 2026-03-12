# Tasks

`tasks/` is the execution queue for the repository.

## Layout

```text
tasks/
  _templates/
  I-0001-harness-foundation/
    todo/
    active/
    archive/
```

## Rules

- Status is represented by folder location only.
- Do not duplicate task status inside file metadata.
- One Markdown file equals one executable task.
- A task should usually have one clear scope such as `api`, `web`, `db`, `docs`, `ci`, or `meta`.
- Every task must declare its required specialist reviewers.
- Every task requires PO review before commit.
- If a task discovers design divergence it cannot close, it must create a follow-up task instead of weakening design/docs.

## Naming

```text
<initiative-id>-<order>-<scope>-<slug>.md
```

Example:

```text
I-0002-010-meta-eslint-repair.md
```

## Lifecycle

1. Claim from `todo/`
2. Move to `active/`
3. Implement and update notes
4. Run self-review
5. Run `verify`
6. Complete specialist review
7. Complete PO review
8. Move to `archive/` in the same changeset that finalizes the task
9. Commit after review and verify are both satisfied

## Divergence Rule

- Approved design stays authoritative even when implementation falls behind.
- Unresolved divergence should be recorded in the task and delegated through a follow-up task.

## Templates

- `tasks/_templates/TASK-TEMPLATE.md`

## Guides

- `docs/guides/agent-self-review.md`
- `docs/guides/reviewer-taxonomy.md`
- `docs/guides/review-harness.md`
