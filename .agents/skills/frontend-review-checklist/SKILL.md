---
name: frontend-review-checklist
description: Use when reviewing web changes for routing, auth gating, state ownership, loading/error handling, and accessibility basics.
---

# Frontend Review Checklist

Review in this order:

1. Confirm the task scope matches the touched routes and components.
2. Check routing, `next` preservation, modal versus redirect behavior, and public/protected boundaries.
3. Check loading, error, and empty states for regressions.
4. Check component and hook boundaries for dead branches or confusing ownership.
5. Check buttons, links, labels, and keyboard paths for accessibility basics.
