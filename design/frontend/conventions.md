---
doc_state: target
owner: frontend
last_verified: 2026-03-12
sources:
  - apps/web/package.json
  - apps/web/src/router.tsx
  - apps/web/src/hooks
  - apps/web/src/pages
  - scripts/check-size-budgets.targets.json
---

# Frontend Conventions

This document defines the preferred frontend coding style for `apps/web`. Some legacy routes still diverge. Those gaps should be fixed with follow-up tasks instead of weakening this convention.

## Route Files

- Keep route entry files thin.
- `pages/**/index.tsx` should mostly compose hooks, sections, and presentational components.
- Route files should not perform direct `api.fetch` calls. Move request logic into route-local hooks, helper modules, or shared hooks.
- Route entry files should not import `@/lib/api-client` or TanStack Query primitives directly. Compose route-local or shared data helpers instead.
- Default exports are allowed for route entry files. Prefer named exports everywhere else.

## Data and State

- Server state belongs in TanStack Query hooks.
- Route-specific orchestration belongs in route-local hooks such as `useEventDetailPage.ts`.
- Shared domain hooks belong under `apps/web/src/hooks/`.
- Avoid mixing query orchestration, mutation side effects, modal state, and heavy JSX layout in a single file.

## UI Composition

- Reusable UI goes in `components/`.
- Route-only UI stays next to the route until it proves reusable.
- Use the existing Tailwind v4 and shadcn-style token system instead of repeating raw spacing or color values.
- Prefer clear section components over long anonymous JSX blocks.
- Social detail surfaces should prefer one continuous document with section dividers over stacked generic `Card` wrappers when the content is meant to read as one flow.
- Use native share affordances when the platform supports them; clipboard-only sharing is the fallback, not the default mobile behavior.

## Naming

- Name files by responsibility, not implementation trivia.
- Prefer names like `useProfileEditForm.ts` or `post-composer-steps.tsx`.
- Avoid vague names such as `helpers.ts`, `utils2.ts`, or `temp.tsx`.

## Readability Budget

- Page-entry files should stay within the repository readability budget.
- If a route exceeds the budget, keep the rule and open a follow-up task. Do not normalize the oversized file in design docs.
