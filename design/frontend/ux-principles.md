---
doc_state: current
owner: frontend
last_verified: 2026-04-03
sources:
  - design/frontend/app-shell-routing.md
  - design/frontend/crew-experience.md
  - design/frontend/social-profile.md
  - design/frontend/workout-experience.md
  - docs/reports/i-0014-ui-bug-board.md
  - apps/web/src/pages/feed/index.tsx
  - apps/web/src/pages/posts/[id]/index.tsx
  - apps/web/src/pages/crews/index.tsx
  - apps/web/src/pages/crews/[id]/index.tsx
---

# UX Principles

## Summary

These principles define how the consumer web app should feel and behave as a runner-focused social product. They are not visual mood notes. They are product-level UX rules for public entry, social reading, participation boundaries, and runner-detail surfaces.

## Product Posture

- `mastersrunners` is a social product for runners, not a campaign landing page.
- the first-touch experience should feel like entering a live community product
- the app should prefer real content, real actions, and real route context over explanatory chrome
- runner records, route maps, laps, and analysis should feel first-class, not secondary attachments

## Core Rules

### 1. Content first

- public surfaces should open with content, not with a hero, explainer block, or conversion wall
- if the UI itself already explains the next step, do not add a second explanatory paragraph
- section copy should orient or constrain, not narrate the product back to the user

### 2. Explore first, participate later

- anonymous visitors may browse public feed, public post detail, public crews, and other explicitly public reads
- auth prompts should appear when the visitor crosses into participation, such as joining, posting, liking, commenting, chatting, or opening protected detail
- do not interrupt public reading with premature login redirects

### 3. Keep route context intact

- public-route participation gates should prefer in-place dialogs over route handoffs
- browser Back should return users to what they perceived as their previous view
- overlays, dialogs, and lightboxes must not create confusing detours or trap users on auth routes

### 4. Social surfaces should feel real, not demo-like

- public social views should look like a limited real product, not a sample gallery
- avoid labels that announce placeholder intent inside the UI
- if mock or fallback content is necessary, render it with product-respecting hierarchy and without demo language

### 5. Runner detail is analysis, not decoration

- workout detail should lead with route map and key metrics when the data exists
- charts, laps, and point-linked inspection are part of the runner promise, not optional garnish
- post-linked workouts should preview that analysis direction instead of collapsing into a generic stat card

### 6. Utility over promotion on product surfaces

- headings should say what the section is or what the user can do there
- avoid aspirational banner copy on routine app surfaces
- empty states should be short, neutral, and action-oriented

## External Rationale

- Apple HIG `Launching` favors getting users into the real experience quickly instead of stretching the pre-use phase.
- Apple `Writing for interfaces` favors concise, clear, task-oriented language.
- Baymard research on sign-in flows and browser Back behavior supports preserving user intent and perceived page history.
- Material guidance on dialogs and empty states supports using dialogs sparingly and keeping state copy brief.
- Strava, COROS, and similar runner products treat social feed, privacy boundaries, and activity detail as one continuous product experience, not as separate marketing surfaces.

## Review Questions

- does this screen show product content quickly, or does it explain before it shows?
- is auth being asked for at the participation boundary, or too early?
- will browser Back behave like the user expects from the current visible state?
- does the surface read like a live runner product rather than a sample app?
- does workout detail honor the runner-analysis promise?
