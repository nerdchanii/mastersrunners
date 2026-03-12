---
doc_state: current
owner: backend
last_verified: 2026-03-12
sources:
  - apps/api/src/feed/feed.controller.ts
  - apps/api/src/feed/feed.service.ts
  - apps/api/src/feed/repositories/feed.repository.ts
  - apps/api/src/posts/posts.controller.ts
  - apps/api/src/post-social/post-social.controller.ts
  - apps/api/src/workout-social/workout-social.controller.ts
  - apps/api/src/notifications/notifications.controller.ts
  - apps/api/src/notifications/notifications.service.ts
  - apps/api/src/notifications/repositories/notification.repository.ts
---

# Social Feed and Notifications

## Summary

The backend splits social behavior into feed aggregation, content ownership, interaction modules, and notification delivery.

## Public API Boundaries

- `FeedController`
  - read-only feed endpoints for post and workout timelines
- `PostsController`
  - post creation, editing, deletion, and author-owned post management
- `PostSocialController`
  - post likes, comments, and replies
- `WorkoutSocialController`
  - workout likes and comments
- `NotificationsController`
  - notification list, unread count, read actions, and SSE stream

## Module Responsibilities

- `FeedModule`
  - builds personalized feed pages from follow relationships and visibility filters
  - strips blocked users before aggregation
- `PostsModule`
  - owns post lifecycle and linked asset/workout relationships
- `PostSocialModule`
  - owns post interaction writes and comment threading
- `WorkoutSocialModule`
  - owns workout interaction writes
- `NotificationsModule`
  - stores notification records and streams them over SSE when connections exist

## Contract Notes

- Feed endpoints are cursor-based and cap page size in the controller boundary.
- Feed responses expose `isLiked` and count data already mapped into SPA-friendly shapes.
- Notification delivery is dual-path:
  - durable persistence through `NotificationRepository`
  - best-effort realtime fan-out through `NotificationsSseService`

## Current Constraints

- Feed aggregation still depends directly on repository-level response shaping rather than a separate domain view-model package.
- Notification fan-out is in-process SSE only; external push channels are not wired in-repo.
