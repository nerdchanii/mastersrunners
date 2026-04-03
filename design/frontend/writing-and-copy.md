---
doc_state: current
owner: frontend
last_verified: 2026-04-03
sources:
  - design/frontend/ux-principles.md
  - design/frontend/social-surface-patterns.md
  - apps/web/src/pages/feed/index.tsx
  - apps/web/src/components/common/AuthGateDialog.tsx
  - docs/reports/i-0014-ui-bug-board.md
---

# Writing and Copy

## Summary

Consumer web copy should behave like product UI, not like marketing commentary or a narrated prototype. Use short, concrete language that supports orientation, state, and action.

## Allowed Copy Roles

- orientation
  - tells the user where they are or what the section contains
- state
  - explains loading, empty, error, or visibility status
- consequence
  - explains what will happen if an action is blocked or delayed
- action
  - labels the next possible step

## Rules

- keep headings literal and scannable
- prefer one short sentence over stacked explanation
- do not restate what a visible button, tab, or list already makes obvious
- write auth prompts around the blocked action, not around brand persuasion
- empty states should be neutral and specific, not motivational by default

## Banned Patterns

- sample/demo framing inside the product UI
- copy that explains the existence of the UI instead of helping use it
- pre-emptive signup persuasion on public reading surfaces
- vague guidance that duplicates the surrounding controls

## First-Wave Banned Phrases

These phrases are blocked by automation in `apps/web/src`:

- `샘플 공개 피드`
- `공개 샘플 게시글`
- `먼저 둘러보세요`

If product needs one of these strings in a non-user-facing context such as tests or docs, keep it out of `apps/web/src`.

## Preferred Rewrites

- bad: `샘플 공개 피드`
- better: no label at all, or a concrete social/context label only when needed

- bad: `먼저 둘러보세요`
- better: remove the sentence unless the UI truly needs orientation that the layout cannot provide

- bad: `공개 크루와 피드는 로그인 없이도 둘러볼 수 있습니다`
- better: let the navigation and available actions demonstrate that rule, and only explain the boundary at the action that requires login

## Review Questions

- does the copy help operate the screen, or merely explain the product?
- if we delete this sentence, does the UI still make sense?
- would this line sound at home in a live social app, or only in a demo?
