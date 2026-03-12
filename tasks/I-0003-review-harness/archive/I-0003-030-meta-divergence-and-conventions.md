---
id: I-0003-030
title: Codify divergence handling and code/commit conventions
parent: I-0003-review-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
  - frontend-reviewer
  - backend-reviewer
po_review: required
depends_on:
  - I-0003-010
  - I-0003-020
blocked_by: []
verify:
  - pnpm format:check
  - bash scripts/check-task-review-metadata.sh
  - rg -n "Commit Conventions|Design Divergence Handling|do not lower" AGENTS.md design docs tasks
artifacts:
  - AGENTS.md
  - design/operating-rules/document-states.md
  - design/operating-rules/commit-conventions.md
  - design/frontend/conventions.md
  - design/backend/conventions.md
  - docs/guides/design-divergence-workflow.md
  - docs/guides/review-harness.md
  - tasks/_templates/TASK-TEMPLATE.md
  - tasks/README.md
  - docs/checklists/harness-scorecard.md
---

## Goal

Codify the repository rule that approved design is not downgraded to match weak implementation, and define explicit coding/commit conventions for the web, API, and harness workflow.

## Done Criteria

- AGENTS and operating-rules docs explain how to handle implementation/design divergence
- commit message structure is documented and task IDs are moved to trailers instead of replacing commit intent
- frontend and backend conventions are documented in design docs
- task template and review guide mention divergence follow-up behavior
- scorecard reflects the new coding-convention source of truth

## Notes

- This is a governance and design-doc task, not a code behavior change.
- Conventions may be stricter than the current codebase; when the code diverges, keep the design truth and open a follow-up task.
- Do not rewrite existing historical commit messages.

## Self Review

- Scope and intent: limited to harness/design docs, task workflow, and scorecard evidence for coding conventions.
- Source of truth: approved design truth is preserved; divergence is now explicitly tracked instead of being normalized into design.
- Design divergence: unresolved implementation gaps are redirected into follow-up tasks rather than lowering docs.
- Verification: `pnpm format:check`, `bash scripts/check-task-review-metadata.sh`, and the task-level `rg` check passed.
- Review routing: this task touched harness rules plus frontend/backend convention docs, so it required harness, docs, frontend, backend, and PO review lenses.

## Review Focus

- Specialist reviewers should check: the rules are specific enough to guide future agent work without rewriting reality.
- PO reviewer should check: the policy preserves source-of-truth quality and makes task/commit history easier to understand.

## Handoff

- If this lands, follow-up work should use the new commit convention and create explicit follow-up tasks for any newly discovered design divergence.

## Attempt Log

- 2026-03-12: created after agreeing that `task(...)` is not an adequate commit intent signal and that design docs must not be downgraded to match poor implementation.
- 2026-03-12: added commit conventions, divergence handling rules, frontend/backend convention docs, and the divergence workflow guide.

## Review Notes

- Specialist review: `harness-reviewer` found no blocking issues. The new rules align with the existing task workflow and keep commit intent separate from task tracking. `docs-reviewer` found no blocking issues. The new docs preserve source-of-truth quality by explicitly separating approved design from implementation divergence. `frontend-reviewer` found no blocking issues. The frontend conventions are stricter than legacy routes but still realistic for the current Vite, React Router, and TanStack Query setup. `backend-reviewer` found no blocking issues. The backend conventions fit the current NestJS and Prisma layering direction without pretending every module already conforms.
- PO review: `po-reviewer` found no blocking issues. The new policy improves traceability, makes follow-up work easier to route to agents, and removes the ambiguity caused by task IDs appearing where commit intent should live.
