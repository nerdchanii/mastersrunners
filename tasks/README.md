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
- Active tasks may have one sidecar runtime file named `<task-id>.runtime.yaml` in the same folder.
- The sidecar runtime file is continuity-only. It may mirror branch, worktree, lease, and PR observations, but it never decides task completion, review satisfaction, or archive state.
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
3. If the task uses repo-native continuity, create or refresh `<task-id>.runtime.yaml`
4. Implement and update notes
5. Run self-review
6. Run `verify`
7. Complete specialist review
8. Complete PO review
9. Move to `archive/` in the same changeset that finalizes the task
10. Commit after review and verify are both satisfied

Bootstrap note:

- `pnpm task:intake` defaults to scaffolding new work in `todo/`.
- `--state active` is only for a supervising agent that is claiming the task immediately in the same session and will follow with `pnpm task:start`.

## Divergence Rule

- Approved design stays authoritative even when implementation falls behind.
- Unresolved divergence should be recorded in the task and delegated through a follow-up task.

## Parallel Work Rule

- If the current worktree already contains unrelated dirty changes, do not build new parallel work on top of it.
- Create a dedicated git worktree for each parallel task and integrate reviewed commits back by merge or cherry-pick.
- Preserve explicit task history during integration.

## Templates

- `tasks/_templates/TASK-TEMPLATE.md`

## Guides

- `docs/guides/agent-self-review.md`
- `docs/guides/parallel-worktree-workflow.md`
- `docs/guides/reviewer-taxonomy.md`
- `docs/guides/review-harness.md`
- `docs/runbooks/task-supervisor.md`
