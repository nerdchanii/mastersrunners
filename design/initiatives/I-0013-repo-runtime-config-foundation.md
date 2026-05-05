# I-0013: Repo Runtime Config Foundation

## Summary

Introduce a repo-tracked runtime config foundation so the product can explicitly control public surface area and OAuth provider exposure without adding hidden database state or env-backed flag sprawl.

## Problem

The repo currently hides or exposes product and auth surfaces through a mix of route wiring and optional runtime credentials. Without a repo-owned runtime config source of truth, release posture can drift into either ad hoc secret-driven behavior or opaque out-of-band state.

## Goals

- add a typed, repo-tracked runtime config contract for public product surfaces
- expose one public runtime config endpoint that the web can trust
- make OAuth provider exposure explicit instead of inferring everything from secret presence
- remove Naver OAuth support from the active runtime surface

## Non-Goals

- adding a database-backed or admin-panel-backed flag system before the backoffice exists
- opening challenges or events in this task
- redesigning challenge or event UX beyond gating and hiding

## Scope

- `apps/api`
- `apps/web`
- `.github/workflows/deploy.yml`
- `.env.production.example`
- `docker-compose.prod.yml`
- `docs/runbooks/`
- `design/architecture/`
- `design/backend/`
- `design/frontend/`
- `tasks/`

## Design References

- `docs/runbooks/deployment.md`
- `docs/runbooks/environment-and-settings.md`
- `design/architecture/auth-session.md`
- `design/backend/auth-session.md`
- `design/backend/events-challenges.md`
- `design/frontend/events-challenges.md`

## Review Plan

- API/runtime config and auth gate behavior: `backend-reviewer`
- web route/nav gating and login surface behavior: `frontend-reviewer`
- user-facing visibility and launch-surface coherence: `ui-ux-reviewer`
- repo truth, deploy/env contract, and task-state hygiene: `harness-reviewer`
- PO review checks whether the public launch surface matches the intended crews/social/workout-first rollout

## Task Breakdown

- `tasks/archive/I-0013-010-repo-runtime-config-and-oauth-surface-pruning.md`

## Success Criteria

- the API publishes one public runtime config contract for feature and auth-provider availability
- web navigation, login, and route access respect the same feature gates
- challenges and events stay disabled by repo default until explicitly opened
- Kakao and Google remain the only supported OAuth providers, with Naver fully removed
