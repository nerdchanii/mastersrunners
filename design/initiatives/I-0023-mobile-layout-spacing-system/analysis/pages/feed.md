# `/feed`

## Top-down tree

```text
RootLayout
└── MainLayout
    └── FeedPage
        ├── feed shell (`-mx-4`, mobile full-bleed)
        ├── sticky tab bar (authenticated only)
        └── content
            ├── guest showcase list
            │   └── GuestFeedPostCard
            │       ├── UserAvatar row
            │       ├── post body
            │       ├── hashtag row
            │       ├── WorkoutAttachmentPreview list
            │       └── action row
            ├── loading / empty states
            └── InfiniteScroll list
                ├── PostFeedCard[]
                │   ├── header row
                │   ├── optional workout summary / carousel
                │   ├── text + hashtags
                │   ├── optional image gallery
                │   └── action row
                └── FeedCard[]
                    ├── header row
                    ├── workout stat hero
                    ├── optional memo
                    └── action row
```

## Where spacing comes from

- Main mobile route padding comes from `MainLayout` default non-profile/non-crew rule: `px-4 py-4 pb-20` in `apps/web/src/router.tsx`.
- `FeedPage` cancels the parent horizontal padding on mobile with `-mx-4` and keeps its own content full-bleed until `md`, while still using `mt-4` above the active content block.
- The authenticated tab bar is `sticky` with no horizontal inset of its own; each tab uses `py-3`.
- Guest cards add their own spacing with `px-4 py-5`, then internal `mt-3`, `mt-2`, `mt-4`, and `space-y-3`.
- `PostFeedCard` spacing is mostly internal component padding: header `px-4 py-3`, workout block `px-4 pb-1`, text block `px-4`, action row `px-2 py-2`, plus ad-hoc `pt-2`, `mt-3`, `space-y-2`, and `pb-2` in the workout carousel.
- `FeedCard` uses header `px-4 py-3`, stat hero `mx-4 p-3`, optional memo `px-4 pt-3`, and action row `px-2 py-1`.
- Attached workout previews inside guest cards bring another layer of internal padding: `rounded-[24px] ... px-4 py-4`, plus internal `space-y-3`, `gap-4`, and `grid gap-3`.

## Code-backed inconsistencies

- `/feed` is the only audited page here that explicitly negates the main mobile gutter with `-mx-4`; `/profile` and `/crews` keep their own page containers, and detail pages add their own inner `px-4`.
- Post and workout feed cards do not share the same vertical rhythm: `PostFeedCard` action row is `py-2`, while `FeedCard` action row is `py-1`.
- Post cards use full-width content blocks with `px-4`, but workout stat summaries inside `FeedCard` are inset again with `mx-4 p-3`, creating a second horizontal gutter inside the same card.
