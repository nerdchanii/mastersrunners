---
doc_state: current
owner: backend
last_verified: 2026-04-02
sources:
  - packages/database/package.json
  - packages/database/src/index.ts
  - packages/database/prisma/schema.prisma
  - apps/api/src/database/database.service.ts
  - apps/api/src/database/database.module.ts
  - apps/api/src/workouts/workouts.service.ts
  - apps/api/src/workouts/repositories/workout.repository.ts
  - apps/api/src/profile/profile.service.ts
  - apps/api/src/feedback/feedback.controller.ts
  - apps/api/src/feedback/feedback.service.ts
  - apps/api/src/feedback/repositories/feedback.repository.ts
---

# Persistence Model

## Summary

PostgreSQL persistence is centralized through Prisma in `packages/database`, and the API consumes that client through `DatabaseService`.

For the Supabase-backed deployment path, the API runtime uses `DATABASE_URL` and Prisma CLI/operator flows prefer `DIRECT_URL` when it is present.

## Ownership

- `packages/database/prisma/schema.prisma` is the canonical relational model.
- `packages/database` builds and exports the Prisma client.
- `apps/api` does not define a separate ORM or duplicate schema layer.
- `DatabaseService` exposes the shared Prisma client as a global dependency.

## Current Data Shape

The schema currently concentrates multiple domains in one relational model:

- auth and accounts
- workouts, workout files, routes, laps, shoes
- posts and workout social interactions
- follow and block
- crews, attendance, boards, bans
- challenges and events
- conversations, messages, notifications
- feedback submissions for authenticated bug and improvement intake
- feedback follow-up references for the ops backoffice, plus a dormant operator-identity table retained for possible future staffing rules

## Feedback Intake Persistence

- `FeedbackSubmission` is the durable intake sink for the first in-product feedback flow.
- Every submission belongs to one authenticated `User`.
- The current stored fields are:
  - category
  - title
  - description
  - optional `currentPath`
  - optional `userAgent`
  - workflow `status`
  - optional `triageNote`
  - optional `reviewedAt`
  - optional `reviewedByOperatorEmail`
  - optional `handoffNote`
  - optional `handoffUpdatedAt`
  - optional `handoffUpdatedByOperatorEmail`
  - timestamps
- Operator review surfaces still read this same table instead of creating a second feedback pipeline.
- Triage status is bounded to the backoffice workflow: `NEW`, `IN_REVIEW`, `PLANNED`, `RESOLVED`, `DISMISSED`.
- The next operator flow is expected to run behind a single Access-protected `ops.<lane>.mastersrunners.com` host rather than on the public app host.
- The current dev ops runtime trusts Cloudflare Access as its sole gate and does not require a matching application-side operator allowlist row.
- `PlatformOperatorIdentity` still exists in the schema as dormant metadata for possible future staffing rules, and it still intentionally does not reuse the `User` table or add a role column there.
- `FeedbackFollowUpReference` stores manual task, initiative, issue, or generic link references against the submission root record.
- Future task/issue/initiative handoff metadata should stay attached to the same submission root record instead of forking feedback into a second tracker.

## Transaction Model

- persistence style is mixed: some domains go through repositories, while some services call `db.prisma` directly
- multi-record writes use Prisma transactions when needed
- transaction callback typing comes from `@masters/database`

## Current Constraints

- Generated client code under `packages/database/generated` is build output, not editable source.
- Runtime and Prisma CLI may intentionally use different connection URLs in deployment environments:
  - `DATABASE_URL` for pooled runtime access
  - `DIRECT_URL` for migrations, seed, and operator commands
- Most domain contracts still live close to Prisma models and Nest DTO/service logic. There is not yet a separate repository-wide domain-model package.
