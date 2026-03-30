# Initiatives

Use one initiative file per large change area.

An initiative is larger than a task and should explain:

- the problem being solved
- intended end state
- scope and non-goals
- decomposition into smaller tasks
- design references
- review plan and PO acceptance lens

Naming:

```text
I-0001-short-name.md
```

Each initiative owns the canonical task list through `Task Breakdown`:

```text
tasks/todo/I-0001-010-...
tasks/active/I-0001-020-...
tasks/archive/I-0001-030-...
```

Recommended order:

1. Write or update the initiative first.
2. Create tasks in `tasks/todo/`.
3. Move task files through `active/` and `archive/` as execution progresses.
4. Keep `Task Breakdown` synchronized with the real task paths.

Use `INITIATIVE-TEMPLATE.md` when creating a new initiative.
