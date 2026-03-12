---
doc_state: current
owner: frontend
last_verified: 2026-03-12
sources:
  - apps/web/package.json
  - apps/web/vite.config.ts
  - apps/web/src/globals.css
  - apps/web/src/lib/theme-context.tsx
  - apps/web/src/components/ui/button.tsx
  - apps/web/src/components/ui/sonner.tsx
  - apps/web/src/lib/utils.ts
---

# UI System

## Summary

The current UI stack is Tailwind CSS v4 plus shadcn-style primitives, with design tokens expressed as CSS custom properties in `globals.css`.

## Styling Stack

- Vite provides the build/runtime boundary for CSS and React.
- `globals.css` imports Tailwind, `tw-animate-css`, shadcn theme helpers, and Leaflet CSS.
- Color, radius, chart, and sidebar tokens are defined as CSS variables.
- Tailwind theme aliases are mapped to those variables through `@theme inline`.

## Theme Model

- `ThemeProvider` stores theme selection in `localStorage`.
- The DOM-level switch is a `.dark` class on `<html>`.
- `light`, `dark`, and `system` are the only supported modes today.

## Component Conventions

- reusable primitives live under `components/ui`
- variants are typically modeled with `class-variance-authority`
- class composition uses `cn()` from `lib/utils.ts`
- shell-level shared UX components live under `components/common` and `components/layout`

## Current Constraints

- `components/ui/sonner.tsx` still contains `"use client"` and hardcodes `theme="light"`, which does not fully mirror the custom theme context.
- `next-themes` remains in `apps/web/package.json`, but the active theme implementation is the local `ThemeProvider`.
- The UI primitive layer is fairly consistent, but route pages are still responsible for a lot of orchestration and conditional rendering.
