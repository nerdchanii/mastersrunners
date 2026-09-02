# I-0027: Agent Harness Alignment (Claude Code + Codex)

## Summary

Bring the repository's agent harness back to a state where Claude Code and Codex read the same instructions, where shared settings are tracked and local settings are explicitly ignored, and where every guardrail the docs mention actually runs. This initiative implements the findings of `docs/reports/agent-harness-audit-2026-09-02.md`.

## Problem

- A gitignored `AGENTS.override.md` redefines the reading order, evaluation workflow, and model roles for Codex only. Claude never sees it, and the divergence is invisible in git history.
- Seven docs point at a `harness-diagnostics` skill that does not exist in the repository, in either user-level skill directory, or in any installed plugin. `exceptions.md` requires principle ids (`P1`–`P12`) that only that skill defined.
- There is no tracked `.claude/settings.json`. The local `settings.local.json` carries a signed JWT inside an allow rule and is kept out of git only by a machine-level global ignore.
- I-0026 artifacts (initiative, active task, `prompts/ai-slop/`) plus cleanups to `.gitignore`, `.codex/config.toml`, and the ast-grep skill have sat uncommitted since 2026-06-22. Local `dev` is 26 commits ahead of `origin/dev`, so the I-0025 harness retirement has never run through CI.
- `scripts/check-doc-frontmatter.sh` and `scripts/check-size-budgets.sh` are referenced by operating rules but wired into nothing.
- The pre-push hook runs the full `pnpm ci:local`, and its knip step fails on existing `apps/web` code at `dev` HEAD. Every push is blocked unless `--no-verify` is used, which is the likely cause of the 26-commit local drift.
- Retired-harness residue remains: `tasks/reviews/README.md` calls itself canonical and links deleted `reviewers/` schemas; `.codex/hooks.json` is an empty placeholder; `.claude/commands/project-status.md` calls subagent types that do not exist.

## Goals

- One instruction source for both agents: `AGENTS.md` plus a new `## Agent Harness Map` section. No override file.
- Tracked shared settings for both agents (`.claude/settings.json`, cleaned `.codex/config.toml`) and repository-level ignore rules for local-only files.
- One role/model table (`design/operating-rules/agent-roles.md`) that other docs reference by role name only.
- Harness principles and the audit procedure defined inside the repository, not in an external skill.
- Skill parity: `.agents/skills/<name>/` is the source, `.claude/skills/<name>/SKILL.md` forwards to it.
- Every guardrail script mentioned in docs runs in both `scripts/ci-local.sh` and `.github/workflows/ci.yml`.
- Working tree closed: I-0026 artifacts either committed with `prompts/` registered in `AGENTS.md`, or explicitly dropped.

## Non-Goals

- Changing user-level configuration under `~/.claude` or `~/.codex`. The report records observations there for context only.
- Re-introducing the review harness retired by I-0025.
- Rewriting `prompts/ai-slop/` content beyond removing hardcoded model names.
- Deleting `tasks/reviews/**` history.

## Scope

- `AGENTS.md`, `.gitignore`
- `.claude/settings.json` (new), `.claude/skills/ast-grep/SKILL.md` (new forwarder), `.claude/commands/project-status.md` (delete, local)
- `.codex/config.toml`, `.codex/hooks.json`
- `.agents/skills/ast-grep/**`
- `design/operating-rules/agent-roles.md` (new), `design/operating-rules/harness-principles.md` (new), `design/operating-rules/exceptions.md`
- `docs/runbooks/harness-diagnostics.md`, `tasks/reviews/README.md`, `tasks/README.md`
- `scripts/ci-local.sh`, `.github/workflows/ci.yml`
- I-0026 artifacts under `design/initiatives/`, `tasks/active/`, `prompts/`

## Task Breakdown

| Task       | Priority | Title                                        | Closes                       |
| ---------- | -------- | -------------------------------------------- | ---------------------------- |
| I-0027-010 | P0       | Harness dirty-state closeout                 | F-09, F-11, F-13, F-17, F-18 |
| I-0027-030 | P0       | Claude Code shared settings baseline         | F-05, F-06, F-07, F-08       |
| I-0027-020 | P1       | AGENTS.md harness map and role table         | F-01, F-03, F-04, F-12       |
| I-0027-050 | P1       | Retired-harness residue and guardrail wiring | F-02, F-14, F-15, F-16       |
| I-0027-040 | P2       | Codex config and skill parity                | F-10, F-11 (forwarder)       |

I-0027-010 and I-0027-030 are independent. I-0027-020 and I-0027-050 start after I-0027-010 lands, because they edit files that the dirty tree also touches.

## Success Criteria

- `git status` on `dev` is clean and `origin/dev` equals `dev`.
- `grep -rn "AGENTS.override" AGENTS.md .gitignore` returns nothing, and `test ! -f AGENTS.override.md` passes.
- `grep -n "harness-diagnostics" AGENTS.md README.md docs/README.md design/operating-rules/*.md` only points at `docs/runbooks/harness-diagnostics.md`, and that runbook contains no `$harness-diagnostics` invocation.
- `test -f .claude/settings.json && ! grep -q "eyJ" .claude/settings.local.json` passes.
- `git check-ignore -q .claude/settings.local.json .claude/worktrees/x` passes from the repository `.gitignore` alone.
- `scripts/ci-local.sh` and `ci.yml` both invoke `check-doc-frontmatter.sh` and `check-size-budgets.sh`, and `pnpm ci:local` passes.
- No file under `prompts/`, `design/initiatives/`, or `design/operating-rules/` contains a literal model identifier outside `agent-roles.md`.
- Every `revisit_date` in `exceptions.md` is in the future or the exception is closed.
