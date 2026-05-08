# I-0023 Mobile Shell Implementation Contract

## Scope

- target: `apps/web`
- focus: mobile route shell category, semantic width naming, shell-owned bottom inset contract

## Route Categories

- `contained`
  - default mobile page shell
  - owns outer `px-4 py-4` and `--mobile-shell-bottom-inset`
- `wide-surface`
  - edge-to-edge outer shell
  - used for `/profile`, `/profile/:id`, `/crews/:id` and crew hub child surfaces
- `full-height`
  - viewport-locked shell for `/messages*` and `/crews/new`
  - pages own internal scroll and sticky regions, but consume shell bottom tokens
- `feed-exception`
  - `/feed` only
  - keeps the gutter-breaking feed behavior as an explicit exception

## Semantic Width Names

- `content`
- `detail`
- `list`
- `form`
- `wide`

These names are exposed by the route shell resolver and attached to `MainLayout` as `data-mobile-width`. Numeric `max-w-*` values remain implementation details for now.

## Bottom Inset Contract

Shell tokens are defined once in `apps/web/src/components/layout/mobile-shell.ts`.

- `--mobile-shell-safe-area-bottom`
- `--mobile-shell-bottom-inset`
- `--mobile-shell-sticky-page-inset`
- `--mobile-shell-sticky-bottom-offset`
- `--mobile-shell-full-height-inset`
- `--mobile-shell-feedback-bottom-offset`

Consumers should use the exported class contracts instead of literal mobile safe-area math.

## Current Consumers

- `MainLayout`
  - route category and width resolution
  - outer page padding and viewport mode
- `BottomNav`
  - safe-area bottom padding
  - floating feedback button offset
- `pages/posts/new`
  - sticky action offset
  - create-flow bottom page inset
- `pages/workouts/new`
  - sticky action offset
  - create-flow bottom page inset
- `ChatComposer`
  - full-height composer inset
- `ChatViewportSkeleton`
  - full-height composer inset

## Guardrails

- reusable components should not recreate page-level outer gutters
- `/feed` is the only mobile gutter-breaking exception
- new route shells should resolve through `resolveMobileRouteShell(...)`
- new mobile safe-area spacing should use shell token exports, not inline `env(...)` or `calc(...)`
