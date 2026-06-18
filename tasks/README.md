# Tasks

`tasks/` is the execution queue for the repository.

## Layout

```text
tasks/
  _templates/
  todo/
  active/
  archive/
```

## Rules

- Status is represented by folder location only.
- Do not duplicate task status inside file metadata.
- One Markdown file equals one executable task.
- A task should usually have one clear scope such as `api`, `web`, `db`, `docs`, `ci`, or `meta`.
- Review is optional and task-specific. When needed, record the requested focus in the task body.
- If a task discovers design divergence it cannot close, it must create a follow-up task instead of weakening design/docs.
- Initiative grouping is handled by the task filename prefix and the matching initiative document's `Task Breakdown`, not by per-initiative directories.

## Naming

```text
<initiative-id>-<order>-<scope>-<slug>.md
```

Example:

```text
I-0002-010-meta-eslint-repair.md
```

## Lifecycle

1. Create the task in `tasks/todo/`
2. Move it to `tasks/active/`
3. Implement and update notes
4. Run self-review
5. Run `verify`
6. Run optional task-specific review if the task definition calls for it
7. Move it to `tasks/archive/` in the same changeset that finalizes the task
8. Commit after implementation and mechanical verification are both satisfied

## Relationship to Initiatives

- `design/initiatives/*.md` defines the large change area.
- Each initiative's `Task Breakdown` is the canonical list of related tasks.
- A task can be found by its `I-xxxx` prefix regardless of status folder.
- Tasks should link back to their parent initiative in frontmatter.

## Divergence Rule

- Approved design stays authoritative even when implementation falls behind.
- Unresolved divergence should be recorded in the task and delegated through a follow-up task.

## Parallel Work Rule

- If the current worktree already contains unrelated dirty changes, do not build new parallel work on top of it.
- Create a dedicated git worktree for each parallel task and integrate validated task-owned commits back by merge or cherry-pick.
- Preserve explicit task history during integration.

## Templates

- `tasks/_templates/TASK-TEMPLATE.md`

## Guides

- `docs/guides/agent-self-review.md`
- `docs/guides/parallel-worktree-workflow.md`
