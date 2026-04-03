---
doc_state: current
owner: frontend
last_verified: 2026-04-03
sources:
  - design/frontend/ui-system.md
  - design/frontend/conventions.md
  - design/frontend/ux-principles.md
  - docs/reports/i-0014-ui-bug-board.md
  - apps/web/src/components/post/PostCard.tsx
  - apps/web/src/pages/posts/[id]/index.tsx
  - apps/web/src/pages/crews/[id]/index.tsx
---

# Visual System Rules

## Summary

The consumer app should feel calm, precise, and product-led. The default layout is section, divider, list, and media block. Card wrappers are the exception, not the baseline.

## Surface Hierarchy

- primary content should dominate through spacing, typography, and media, not by wrapping every section in chrome
- supporting tools, operator controls, and secondary metadata may use stronger containment
- mobile and desktop should preserve the same hierarchy even when layouts stack

## Card Usage Rules

### Default: no card

Prefer plain layout blocks for:

- public feed rows
- post detail main document flow
- workout detail report sections
- crew detail primary content tabs
- profile identity surfaces

### Allowed card use

Cards are allowed when the card itself is the interaction or the boundary matters:

- dialogs and popovers
- settings/operator panels
- highly scoped secondary utilities
- explicit picker or chooser surfaces

### Avoid

- card-inside-card composition
- using rounded border boxes as the default wrapper for every page region
- turning analytics/detail reading surfaces into dashboard mosaics

## Typography and Labels

- product names, runner identity, section headings, and metric numbers should carry hierarchy first
- support text should remain quieter and shorter than action labels
- do not use decorative label chips to compensate for weak layout structure

## Empty and Error States

- empty states should stay light
- use one short sentence plus one relevant action when needed
- avoid promotional copy on routine product states

## Motion and Feedback

- motion should sharpen affordance or preserve context
- dialogs and drawers should feel deliberate but fast
- hover/press states should clarify interactivity, not decorate static content

## Review Questions

- is this card necessary, or is it hiding weak layout decisions?
- does the screen still read clearly if borders and shadows are reduced?
- is the primary content obvious without extra badges or explainer labels?
