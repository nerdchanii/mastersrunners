# `/workouts/:workoutId`

## Top-down tree

```text
RootLayout
└── MainLayout
    └── WorkoutDetailPage
        ├── top action row
        ├── date row
        ├── hero section
        │   └── two-column grid
        │       ├── map / empty-map panel
        │       └── workout summary rail
        │           ├── user / type / shoe
        │           ├── primary metric grid
        │           ├── optional highlight metrics
        │           ├── optional memo
        │           └── like / comment row
        ├── optional analysis charts section
        │   └── WorkoutAnalysisCharts
        ├── optional lap analysis section
        │   └── WorkoutLapSplitTable
        └── comments section
            └── CommentList
```

## Where spacing comes from

- Main mobile route padding starts from `MainLayout` default `px-4 py-4 pb-20`.
- `WorkoutDetailPage` adds page-level vertical rhythm with `space-y-6 pb-10`, but no extra mobile page gutter beyond child sections.
- The top action row uses `px-4 pt-2`; the date row uses `px-4`.
- The hero section has `border-b pb-8`; inside it, the mobile grid uses `gap-8`.
- The map panel is full-width on mobile with no inner padding unless the empty state is shown, where the fallback adds `px-6`; the floating cursor overlay adds `bottom-4 left-4 right-4 px-4 py-3`.
- The right-hand summary rail adds its own mobile gutter with `px-4 sm:px-5`, then internal `space-y-6`, metric grid `gap-4`, highlight grid `gap-x-4 gap-y-4`, memo `pt-4`, and like/comment row `pt-1`.
- Analysis and lap sections each start with `border-t pt-6`; the lap header adds `mb-4`.
- `WorkoutAnalysisCharts` adds another container layer: outer `space-y-5`, header card `px-4 py-3`, chart wrappers with `pt-5` and `mb-4`.

## Code-backed inconsistencies

- `/workouts/:workoutId` keeps the default route gutter and then reintroduces explicit `px-4` inside multiple child rows, unlike `/feed` and `/profile`, which rely more heavily on edge-to-edge sections with card-owned padding.
- The summary rail is padded on mobile (`px-4 sm:px-5`) while the map panel is flush to the section edge; that creates asymmetry within the same hero section before the layout reaches `lg`.
- This page mixes several different section-spacing patterns in one surface: `space-y-6` at page level, `gap-8` inside the hero grid, `pt-6` section starts, and nested cards with their own `px-4 py-3`.
