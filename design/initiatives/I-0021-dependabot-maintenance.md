# I-0021: Dependabot Maintenance

## Summary

Keep Dependabot update PRs mergeable by applying focused compatibility fixes and merging only green branches.

## Problem

Dependabot can open multiple small platform updates plus a large dependency batch at the same time. Those PRs need an orderly merge sequence so stale merge refs, lockfile drift, and tool baseline changes do not hide real failures.

## Goals

- Revalidate Dependabot PRs against current `dev`.
- Merge only PRs with passing GitHub checks.
- Add narrow compatibility fixes when bulk dependency updates expose legitimate repository gaps.
- Record verification and review evidence in task closeout state.

## Non-Goals

- Replace Dependabot configuration.
- Broaden dependency update scope beyond the existing open PRs.
- Weaken typecheck, Knip, build, or deployment checks to make updates pass.

## Scope

- Dependabot GitHub Actions PRs.
- Dependabot npm workspace batch PRs.
- Dependency lockfile and package metadata needed for those updates.
- Task and review evidence for merge decisions.

## Design References

- `design/operating-rules/commit-conventions.md`
- `docs/runbooks/harness-diagnostics.md`
- `.github/dependabot.yml`

## Review Plan

- repository/dependency workflow work: workflow review
- package/runtime dependency contract changes: backend review when API dependency metadata changes
- PO review checks that only green, low-risk updates are merged and that failed checks are not bypassed

## Task Breakdown

- `tasks/archive/I-0021-010-repo-dependabot-pr-cleanup.md`
- `tasks/archive/I-0021-020-ci-api-docker-runtime-smoke.md`

## Success Criteria

- Target Dependabot PRs are updated against current `dev`.
- GitHub Actions update PRs merge only after checks pass.
- The bulk npm workspace PR carries any required compatibility fixes and passes local plus remote verification before merge.
- Task closeout records verification, specialist review, and PO review evidence.

## Progress Notes

- 2026-05-05: Created initiative for coordinated cleanup of the open Dependabot PR set.
- 2026-05-05: Merged the four small GitHub Actions Dependabot PRs after branch update and green checks: `#18`, `#26`, `#21`, and `#34`.
- 2026-05-05: Added compatibility fixes to the npm workspace batch PR `#39`, revalidated it against the updated `dev`, and merged it only after CI plus Cloudflare Pages checks were green.
- 2026-05-05: Follow-up PO review found `#34` was merged before its Cloudflare Pages checks completed. The process exception is tracked as `EX-0008`.
- 2026-05-06: User confirmed `#34` ultimately finished correctly because all checks passed after merge, and approved archiving the task with the timing issue preserved in `EX-0008`.
- 2026-05-06: Opened follow-up task after `#39` merge commit passed CI but failed the dev Deploy workflow because the API Docker runtime still executed `dist/main.js` while the Nest SWC build emitted `dist/src/main.js`.
