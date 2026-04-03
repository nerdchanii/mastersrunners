# UI/UX Guardrail Review

Use this runbook when a task changes user-facing consumer web behavior.

## Purpose

Make UX review repeatable. The goal is to review against repository truth instead of relying on chat memory or individual taste alone.

## Source Docs

- `design/frontend/ux-principles.md`
- `design/frontend/social-surface-patterns.md`
- `design/frontend/writing-and-copy.md`
- `design/frontend/visual-system-rules.md`

## When to Use

Use this runbook for tasks that touch:

- `/feed`
- `/posts/:id`
- `/crews`, `/crews/:id`
- `/profile/:id`
- `/workouts/:id`
- public-entry auth prompts
- other consumer web routes with visible UX changes

## Frontend Review Checks

- does the route follow the documented public read versus protected action boundary?
- does the implementation preserve URL and route context where the pattern expects an in-place auth gate?
- does Back behave predictably for overlays, dialogs, and public-route detours?
- is the surface composed with clear layout hierarchy instead of default boxed wrappers?

## UI/UX Review Checks

- does the page show product content quickly instead of explaining itself first?
- is the copy concise, product-like, and free of demo or explainer tone?
- does the auth prompt appear at the correct moment of consequence?
- does the screen feel like a runner social product rather than a generic SaaS dashboard?
- if workout detail is involved, does it preserve the analysis-first direction?

## PO Review Checks

- does the change improve the intended runner community experience?
- are public and private boundaries still clear?
- does the screen help delivery of a better product rather than just a more described product?

## Task Hygiene

- user-facing web tasks should cite the relevant UX docs in `artifacts` or `Notes`
- if the task intentionally diverges from a UX rule, record the divergence explicitly and seed a follow-up task
