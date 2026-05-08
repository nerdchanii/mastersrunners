# `/profile`

## Top-down tree

```text
RootLayout
└── MainLayout
    └── ProfilePage
        ├── ProfileHeader
        │   ├── avatar + identity row
        │   ├── bio / crews / follower summary
        │   └── action area
        ├── ProfileAuxiliaryNotices
        └── ProfileTabs
            ├── sticky tab bar
            └── swipeable tab panels
                ├── posts
                │   └── PostFeedCard[]
                ├── workouts
                │   └── FeedCard[]
                └── crews
                    └── ProfileCrewPostCard[]
```

## Where spacing comes from

- Main mobile route padding comes from the profile-specific `MainLayout` branch: `px-0 py-0 pb-20`.
- `ProfilePage` itself adds no mobile horizontal padding; it only adds `space-y-5 pb-8`.
- `ProfileHeader` creates the first real gutter with `px-4 py-6 sm:px-6`, then internal `gap-6`, nested `gap-4`, avatar/text gap `gap-4 sm:gap-5`, and ad-hoc `mt-1.5`.
- Auxiliary notices sit outside the header but restore horizontal padding with `px-4 sm:px-6` and `space-y-2`.
- `ProfileTabs` tab bar uses sticky chrome with `px-4 sm:px-6`; each trigger adds `py-3`.
- The tab panels themselves are effectively edge-to-edge on mobile. Posts and workouts reuse `PostFeedCard` and `FeedCard`, so their spacing comes from those card internals rather than a panel container.
- `ProfileCrewPostCard` follows the same pattern: header `px-4 py-3`, body `px-4 pb-3`, action row `px-2 py-2`, optional gallery `mt-1`.

## Code-backed inconsistencies

- `/profile` gets a dedicated zero-horizontal-padding route shell in `MainLayout`; `/feed` also ends up edge-to-edge, but only by negating the default page gutter with `-mx-4`.
- The header and sticky tab bar both use `px-4`, but the feed cards under the tabs are truly edge-to-edge and reintroduce padding inside each card, so the page alternates between container gutters and card-owned gutters.
- Posts and workouts inside `/profile` inherit the same card spacing differences already present on `/feed` because `ProfileTabs` renders `PostFeedCard` for posts and `FeedCard` for workouts.
