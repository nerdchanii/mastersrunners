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
4. Run `verify`
5. Complete specialist review
6. Complete PO review
7. Move to `archive/` in the same changeset that finalizes the task
8. Commit after review and verify are both satisfied

## Templates

- `tasks/_templates/TASK-TEMPLATE.md`
