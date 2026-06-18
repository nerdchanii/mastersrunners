# Correction Commit Flow

Use this runbook when a bad change already exists in pushed or merged history and the team needs the recovery to stay visible in `git log`.

## Goal

Preserve operational truth. Do not hide a bad shared commit by silently replacing it.

## Decision Rule

### Stay inside the current task branch

Use the current task branch without a special correction commit when the bad change has **not** been pushed or merged yet.

- keep fixing the task locally
- do not publish broken intermediate states to `dev`
- review and integrate only the corrected task outcome

### Land a follow-up `fix` commit

Use a new `fix(...)` commit when the intended direction is still correct and the safest path is to repair it forward.

Typical signals:

- the feature should remain on
- the regression is narrow and understood
- the correction is safer than rolling the whole change back
- the team wants the original change and the repair to stay visible as separate history

Required handling:

1. Create a dedicated follow-up task.
2. Record the original bad commit SHA in the task notes.
3. Commit the recovery with a normal `fix(...)` subject.
4. Add a `Fixes: <commit_sha>` trailer.
5. Archive the correction task separately from the original task.

### Land a `revert` commit

Use `revert(...)` when the fastest safe move is to restore the last known good state.

Typical signals:

- production or `dev` is unhealthy now
- the blast radius is broad or not yet understood
- rollback is lower risk than trying to patch forward under time pressure
- the team needs the deploy lane to recover before re-attempting the feature

Required handling:

1. Create a dedicated rollback task unless an existing open rollback task already tracks the incident.
2. Run `git revert <bad_commit_sha>`.
3. Commit the rollback with a `revert(...)` subject.
4. Add a `Reverts: <commit_sha>` trailer.
5. Create a follow-up task before re-landing the capability.

## What Not To Do

- do not force-push away a bad shared commit
- do not amend an already-pushed task commit just to hide the mistake
- do not fold the correction into an unrelated task
- do not use a revert commit as the only documentation; record the reason in the task as well

## Task and Review Expectations

- The original task stays archived as the record of what landed.
- The correction gets its own task, review notes, and verification evidence.
- Review routing follows the recovery scope.
  - repo/meta correction: workflow review + product review
  - user-facing web correction: frontend review + UI/UX review + product review
  - API or DB correction: backend review + product review

## Commit Examples

Forward fix:

```text
fix(web): recover guest crew navigation after public-entry rollout

Task: I-0014-320
Initiative: I-0014
Fixes: 5f5adea
Review: frontend, backend, UI/UX, and product risk checked
Verify: pnpm ci:local
```

Rollback:

```text
revert(api): roll back broken workout detail payload change

Task: I-0014-330
Initiative: I-0014
Reverts: a1b2c3d
Reason: workout detail requests return 500 in dev after deploy
Review: backend and product risk checked
Verify: pnpm ci:local
```
