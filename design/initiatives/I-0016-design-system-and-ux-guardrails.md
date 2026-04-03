# I-0016: Design System and UX Guardrails

## Summary

Turn the consumer web app's UX direction into durable repository truth by defining research-backed product UX rules, visual-system rules, copy rules, and lightweight automated guardrails. The immediate goal is not a full UI repaint. It is to stop explanation-heavy, demo-like, and inconsistent interaction patterns from reappearing while keeping the app aligned with a runner-focused social product.

## Problem

The repository already has strong route and feature docs, but it does not yet have one explicit UX control plane for:

- public exploration versus participation boundaries
- interface copy tone
- when card wrappers are allowed
- how browser back behavior should work around auth prompts and overlays
- how runner-detail surfaces should behave compared with generic social cards

Without that system, product feedback has to be re-explained task by task, and user-facing regressions can return even when the code is otherwise correct.

## Goals

- define current UX principles for the consumer web app in one place
- anchor those principles in external UX guidance plus runner-product references
- document route-level public social patterns for feed, posts, crews, profile, and auth prompts
- define first-wave writing and copy rules that block demo-like or over-explanatory language
- define visual-system rules for card usage, hierarchy, and surface composition
- add narrow automated guardrails that catch banned copy and public-entry UX regressions

## Non-Goals

- redesign every screen in one batch
- build a full token/component design system before product rules are clear
- change API contracts or database schema
- bring `apps/ops-web` into the first-wave UX rule set

## Scope

- `design/frontend/ux-principles.md`
- `design/frontend/social-surface-patterns.md`
- `design/frontend/writing-and-copy.md`
- `design/frontend/visual-system-rules.md`
- `design/frontend/conventions.md`
- `design/frontend/ui-system.md`
- `design/frontend/app-shell-routing.md`
- `design/frontend/workout-experience.md`
- `design/frontend/crew-experience.md`
- `design/frontend/social-profile.md`
- `design/frontend/README.md`
- `docs/runbooks/ui-ux-guardrail-review.md`
- `docs/guides/review-harness.md`
- `tasks/_templates/TASK-TEMPLATE.md`
- `apps/web/src/pages/feed/index.tsx`
- `apps/web/e2e/public-entry-auth.spec.ts`
- `apps/web/e2e/ux-contract.spec.ts`
- `apps/web/e2e/helpers/public-entry-fixtures.ts`
- `scripts/check-ux-copy-patterns.mjs`
- `scripts/ci-local.sh`
- `.github/workflows/ci.yml`
- `package.json`

## Design References

- `design/frontend/app-shell-routing.md`
- `design/frontend/workout-experience.md`
- `design/frontend/crew-experience.md`
- `design/frontend/social-profile.md`
- `design/frontend/conventions.md`
- `design/frontend/ui-system.md`
- `docs/reports/i-0014-ui-bug-board.md`

## External References

- Apple Human Interface Guidelines, Launching: https://developer.apple.com/design/human-interface-guidelines/launching/
- Apple Human Interface Guidelines, Onboarding: https://developer.apple.com/design/human-interface-guidelines/onboarding
- Apple, Writing for interfaces: https://developer.apple.com/videos/play/wwdc2022/10037/
- Baymard, Account Sign-In Flows: https://baymard.com/blog/account-sign-in-flows
- Baymard, Back Button Expectations: https://baymard.com/blog/back-button-expectations
- Material Design, Dialogs: https://m1.material.io/components/dialogs.html
- Material Design, Empty States: https://m1.material.io/patterns/empty-states.html
- Strava Support, Viewing Activities: https://support.strava.com/hc/en-us/articles/216917457-Viewing-Activities
- Strava Support, Activity Privacy Controls: https://support.strava.com/hc/en-us/articles/216919377-Activity-Privacy-Controls
- Strava Support, Clubs on the Mobile App: https://support.strava.com/hc/en-us/articles/221622188-Clubs-on-the-Mobile-App
- COROS Help Center, Activity List and Activity Summary: https://support.coros.com/hc/en-us/articles/360039842452-Activity-List-and-Activity-Summary

## Review Plan

- UX foundation docs and user-facing guardrails: `frontend-reviewer`, `ui-ux-reviewer`, `docs-reviewer`
- repo automation and task-template changes: `harness-reviewer`
- PO review checks whether the resulting system keeps the app aligned with a runner-first social product instead of a marketing-first shell

## Task Breakdown

- `tasks/archive/I-0016-010-meta-web-ux-guardrail-foundation.md`
- `tasks/todo/I-0016-020-web-public-social-surface-alignment.md`
- `tasks/todo/I-0016-030-web-copy-and-auth-gate-alignment.md`
- `tasks/todo/I-0016-040-meta-ux-guardrail-checks-expansion.md`

## Success Criteria

- the consumer web app has one documented UX rule set that future tasks can cite
- public social routes share one explicit contract for reading, gating, and back-navigation behavior
- the repo defines banned copy patterns for obvious demo/explainer language
- CI/local checks catch first-wave banned phrases and public-entry regressions
- future user-facing web tasks can be reviewed against specific UX docs instead of chat memory alone

## Progress Notes

- 2026-04-03: seeded the initiative after product feedback made it clear that current frontend conventions were too code-centric and did not protect UX quality or product tone on public social surfaces.
