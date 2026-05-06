# Agent Self-Review Checklist

Run this checklist after implementation and before final verification or optional review.

Codex Stop-hook review automation is disabled. The checklist is a quality aid, not a review trigger.

## 1. Scope and Intent

- Does this changeset stay within the task's stated scope?
- Did I avoid mixing unrelated cleanup or opportunistic fixes into the same task?
- Does the intended outcome still match the task goal and done criteria?

## 2. Source of Truth

- Did I update the relevant design, domain, runbook, or task doc in the same task?
- Did I avoid using `README.md` as the only source of truth?
- Did I keep approved design intact instead of lowering it to match weak implementation?

## 3. Design Divergence

- If implementation still diverges from approved design, did I record that divergence explicitly?
- If the divergence remains unresolved, did I create a follow-up task?
- Did I avoid calling the task complete while known design debt is still hidden?

## 4. Code and Structure

- Does the code follow the relevant frontend/backend convention docs?
- Did I remove obvious duplication, dead branches, and temporary scaffolding within the task scope?
- Are naming, file placement, and module boundaries clearer rather than noisier after the change?

## 5. Verification

- Did I run every `verify` command listed in the task?
- Did I check any repo-wide guardrails affected by the change, such as lint, build, or focused tests?
- If I could not run a required verification step, did I record that explicitly in the task?

## 6. Review Routing

- Does this task need opt-in specialist or PO review?
- If the change affects user-visible flow, would UI/UX review materially reduce risk?
- If the change affects boundaries, performance, or major refactoring, should I request an additional reviewer role?

## 7. Commit Readiness

- Does the commit subject describe change intent with a normal type such as `feat`, `fix`, `refactor`, `docs`, or `ci`?
- Did I keep task tracking out of the commit subject and reserve it for trailers?
- If I am correcting already-shared history, am I using a dedicated `fix` or `revert` task and commit instead of hiding the mistake with rewritten history?
- Is the task ready to move to `archive/` in the same changeset as the final commit?

## Recordkeeping

Capture any important self-review outcome in the task file, especially:

- unresolved divergence
- verify limitations
- reasons for opt-in reviewer routing
- whether any review was deferred and why
