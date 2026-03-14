# Harness Diagnostics

Use `$harness-diagnostics` as the repository's on-demand harness audit tool.

This repository no longer keeps a standing in-repo score snapshot. Run diagnostics when you need a fresh view of maturity, drift, or cleanup candidates.

## When to Run It

- Run `Audit` before or after major harness changes when you need a current maturity snapshot.
- Run `Maintenance` when docs, automation, or source-of-truth boundaries may have drifted.
- Run diagnostics before retiring a harness surface, changing an operating rule, or opening a cleanup initiative that spans multiple docs or scripts.

## Recommended Modes

- `Audit`: use when you need a current score, principle-by-principle readout, or a quick roadmap.
- `Maintenance`: use when you suspect drift, stale references, or legacy control surfaces.

For this repository, `Setup` is usually not the primary mode because the baseline harness already exists.

## Reporting Policy

- You do not need to save every diagnostics run.
- Save a report in `docs/reports/` only when the output becomes durable evidence for a cleanup, migration, milestone, or release-quality decision.
- Keep transient one-off checks in the working task notes instead of turning every run into a permanent repo artifact.

## Escalation Rules

- If diagnostics finds a repo-controlled cleanup item, create or update a task in `tasks/`.
- If diagnostics finds a blocker that cannot be closed in-repo, update `design/operating-rules/exceptions.md`.
- If diagnostics finds a readability budget exception, update `scripts/check-size-budgets.targets.json` in the same task that accepts or removes the exception.

## Operator Notes

- Treat diagnostics output as evidence, not as a standing source of truth by itself.
- Durable product rules still belong in `docs/domain/`.
- Durable technical design still belongs in `design/`.
- Runtime procedures still belong in `docs/runbooks/`.
