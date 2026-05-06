# Design Divergence Workflow

Use this guide when the implementation and approved design are out of sync.

## Core Rule

Do not lower approved design or domain docs to match a weak implementation.

## Relationship Map

```text
design/docs
   │
   │ approved truth / intended design
   ▼
implementation(code)
   │
   ├─ matches design
   │    └─ verify -> optional review -> archive -> commit
   │
   └─ diverges from design
        ├─ keep design/docs intact
        ├─ record Current Divergence
        ├─ create follow-up task
        └─ delegate to an agent
```

## Flow

```text
[work in progress]
   ↓
[compare implementation against approved design]
   ↓
{does code match design?}
   ├─ yes
   │   ↓
   │ [run verify]
   │   ↓
   │ [optional task-specific review]
   │   ↓
   │ [archive task]
   │   ↓
   │ [commit]
   │
   └─ no
       ↓
   [do not weaken design/docs]
       ↓
   [record divergence]
       ↓
   [create follow-up task]
       ↓
   [delegate to agent]
       ↓
   [agent implements fix]
       ↓
   [run verify]
       ↓
   [optional task-specific review]
       ↓
   [archive task]
       ↓
   [commit]
```

## Practical Notes

- Use the task system to record the gap. Do not hide it in ad hoc chat.
- If a workaround is temporary, say so explicitly and link the follow-up task.
- Commit intent should still use normal commit conventions such as `fix`, `refactor`, or `docs`. Task IDs belong in trailers.
