# Reviewer Taxonomy

Use this guide to decide which reviewer roles to request for a task.

## Baseline Reviewers

- `docs-reviewer`
  - clarity, structure, cross-reference quality, and source-of-truth alignment
- `frontend-reviewer`
  - routing, state ownership, UI composition, loading/error handling, and accessibility basics
- `ui-ux-reviewer`
  - interaction flow, hierarchy, feedback states, and responsiveness for user-facing changes
- `backend-reviewer`
  - API contracts, validation, auth/authz, data integrity, and failure handling
- `harness-reviewer`
  - task boundaries, CI/hook behavior, automation impact, and invariant safety
- `po-reviewer`
  - user value, acceptance criteria, scope fit, and release risk

## Escalation Reviewers

- `architecture-reviewer`
  - use when a task changes module boundaries, layering, data flow, or cross-app contracts
- `refactor-reviewer`
  - use when a task primarily decomposes large files, splits responsibilities, or removes structural duplication
- `performance-reviewer`
  - use when a task affects query fanout, N+1 risk, render hotspots, caching, realtime throughput, or large-traffic behavior
- `naming-reviewer`
  - use for sweeping renames, public API naming changes, or terminology cleanups that can affect discoverability

## Routing Advice

- Start with the baseline reviewer set required by the task scope.
- Add escalation reviewers only when the change clearly triggers that concern.
- Do not request every reviewer by default; over-routing reduces signal quality.

## Examples

- docs-only policy change
  - `docs-reviewer` + `harness-reviewer` + `po-reviewer`
- route refactor with visible UI impact
  - `frontend-reviewer` + `ui-ux-reviewer` + `refactor-reviewer` + `po-reviewer`
- API boundary or repository pattern change
  - `backend-reviewer` + `architecture-reviewer` + `po-reviewer`
- feed or realtime scaling work
  - `backend-reviewer` and/or `frontend-reviewer` + `performance-reviewer` + `po-reviewer`

## Current Default

The repository should treat self-review as mandatory before specialist review.
Naming concerns should be checked in self-review first and escalated to `naming-reviewer` only when the naming surface is a major part of the task.
