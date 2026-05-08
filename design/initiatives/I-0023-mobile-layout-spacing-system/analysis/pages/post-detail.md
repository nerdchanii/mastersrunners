# `/posts/:postId`

## Top-down tree

```text
RootLayout
└── MainLayout
    └── PostDetailPage
        ├── page container
        ├── top action row
        └── post detail document
            ├── post section
            │   └── PostCard
            │       ├── UserAvatar
            │       ├── body text
            │       ├── hashtag row
            │       ├── image gallery
            │       └── action row
            ├── optional connected workouts section
            │   └── WorkoutAttachmentPreview[]
            └── comments section
                └── CommentSection
                    ├── heading
                    └── CommentList
```

## Where spacing comes from

- Main mobile route padding starts from `MainLayout` default `px-4 py-4 pb-20`.
- `PostDetailPage` adds another page wrapper layer with `mx-auto max-w-2xl px-4 py-6`.
- The top-level stack uses `space-y-4`.
- The document frame itself has no internal page padding, only `overflow-hidden border-y`; each child section adds its own `px-1 py-5 sm:px-2`.
- `PostCard` then adds another internal rhythm layer: `space-y-4`, border-top action area with `pt-3`, hashtag `gap-1.5`, and whatever spacing `PostImageGallery` brings.
- The connected-workouts section adds `mb-4` above the preview list and `space-y-3` between `WorkoutAttachmentPreview` cards.
- Each `WorkoutAttachmentPreview` adds its own `px-4 py-4`, `space-y-3`, `gap-4`, and `gap-2`.
- `CommentSection` adds `space-y-4` between its heading and `CommentList`.

## Code-backed inconsistencies

- `/posts/:postId` keeps the default route gutter and then adds another `px-4` page wrapper, unlike `/feed` and `/profile`, which are edge-to-edge on mobile.
- The detail document uses `px-1` section padding before rendering `PostCard`, which already manages its own spacing; this is a different pattern from feed cards, which usually start directly at `px-4`.
- Connected workouts here use `WorkoutAttachmentPreview` cards with `rounded-[24px] px-4 py-4`, while workout summaries on feed/profile post cards use flatter `rounded-xl p-3` summary blocks.
