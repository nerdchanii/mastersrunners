# `/crews`

## Top-down tree

```text
RootLayout
└── MainLayout
    └── CrewsPage
        ├── page container
        ├── header row
        ├── Tabs
        │   ├── TabsList
        │   ├── "my" panel
        │   │   └── MyCrewsList
        │   │       ├── login / empty / loading state
        │   │       └── CrewCard list
        │   └── "explore" panel
        │       └── CrewExplore
        │           ├── optional recommended section
        │           ├── region filter section
        │           ├── optional sub-region filters
        │           ├── sort row
        │           └── loading / empty / CrewCard list
        └── AuthGateDialog
```

## Where spacing comes from

- Main mobile route padding starts from `MainLayout` default `px-4 py-4 pb-20`.
- `CrewsPage` adds a second container layer with `container max-w-4xl mx-auto py-6 space-y-6`; there is no explicit `px-*` in the page component, so horizontal spacing depends on the `container` utility plus the route shell.
- `TabsContent` for both panels adds `mt-6`.
- `MyCrewsList` uses `space-y-3` for lists and skeletons; card states rely on `CardContent` padding such as `py-8` or `py-4`.
- `CrewExplore` adds `space-y-6` between major sections, then local margins like `mb-3` on headings and `mb-4` on filter groups.
- Filter chips use `flex flex-wrap gap-2`; list blocks use `space-y-2` for recommended crews and `space-y-3` for the main crew list.
- `CrewCard` internal spacing comes from `CardContent className="py-4 flex items-center gap-4"` and the icon block `w-12 h-12`.

## Code-backed inconsistencies

- `/crews` is the only audited page here using a `container` wrapper in the page component on top of the default route shell, rather than going edge-to-edge (`/feed`, `/profile`) or using a simple `max-w-* px-4` wrapper (`/posts/:postId`).
- Both crew lists and filters are page-container driven, not card-stack driven. That differs from `/feed` and `/profile`, where most spacing is owned by repeated feed-card components.
- The vertical spacing pattern is more margin-based (`mt-6`, `mb-3`, `mb-4`) than the detail pages, which rely more on bordered sections with `pt-*`/`pb-*`.
