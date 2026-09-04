# AI Slop Evaluation Strategy

Status: draft strategy, not an approved scoring contract.

## Purpose

Define a deterministic, read-only evaluation workflow for repository coherence. "AI slop" means low-signal or contradictory material such as:

- docs that disagree with code or task state
- duplicated source-of-truth instructions
- generated prose that says little and cites nothing
- workflow guidance that points to removed files or retired behavior

## Repository Reading Order

Every evaluation thread should read these first:

1. `AGENTS.md`
2. `tasks/README.md`
3. `tasks/active/`
4. `design/initiatives/`
5. `design/`
6. `docs/domain/`
7. `docs/runbooks/environment-and-settings.md`
8. `docs/runbooks/`

## Hard Exclusions

Do not review or classify these as evaluation targets unless the task explicitly asks for build/generated diagnostics:

- `**/node_modules/**`
- `apps/web/dist/**`
- `apps/web/out/**`
- `apps/web/.next/**`
- `apps/web/playwright-report/**`
- `apps/web/test-results/**`
- `apps/api/dist/**`
- `packages/*/dist/**`
- `packages/database/generated/**`
- `apps/api/src/coverage/**`
- `**/coverage/**`
- binary assets unless a document directly depends on them

## Subagent Pass Structure

All passes are delegated to subagents. The main thread owns orchestration,
candidate-set stability, and final aggregation review.

1. Classification subagent pass 1
   - Model: `gpt-5.5`
   - Thinking: `medium`
   - Goal: separate relevant review surface from obvious exclusions and identify risky clusters.
2. Classification subagent pass 2
   - Model: `gpt-5.5`
   - Thinking: `medium`
   - Goal: challenge pass 1, resolve borderline paths, and output the final review inventory.
3. Rubric and metrics subagent
   - Model: `gpt-5.5`
   - Thinking: `high`
   - Goal: propose scoring rubric, metric weights, and fail conditions.
4. Mechanical check subagent
   - Goal: produce one deterministic candidate set for all judge passes.
5. Judge subagent pass 1
   - Model: `gpt-5.3-codex-spark`
   - Goal: first provisional rubric-guided measurement over the shared candidate set.
6. Judge subagent pass 2
   - Model: `gpt-5.3-codex-spark`
   - Goal: second provisional rubric-guided measurement over the same candidate set.
7. Judge subagent pass 3
   - Model: `gpt-5.3-codex-spark`
   - Goal: third provisional rubric-guided measurement over the same candidate set.
8. Aggregation/adjudication subagent
   - Model: `gpt-5.4-mini`
   - Goal: normalize only repeated-pass variance and disputed items.

## Contract Gate

Before any evaluation result is treated as authoritative, confirm:

1. rubric contract
2. report/output contract
3. classification surface boundary

Use `prompts/ai-slop/contract-open-questions.md` as the unresolved-decision register.

## Review Count Rule

Each target document should be reviewed three times by repeated judge
subagents over the same mechanical candidate set:

1. judge pass 1
2. judge pass 2
3. judge pass 3

## Evidence Rule

- Raw repository files are read-only.
- Do not propose direct edits inside raw evidence.
- Every finding written by an evaluation worker must cite exact evidence with `path:#LXX`.
- The `path:#LXX` format is an output contract for evaluation claims, not a retroactive formatting requirement for every pre-existing source document.
- Do not flag an existing source, design, report, or runbook solely because its own links use another line-reference style, unless that document explicitly claims to comply with this evaluation evidence contract.
- Prefer one precise line citation per claim instead of broad summaries.
- If a claim depends on multiple files, cite each file separately.

## Reporting Contract

Every delegated thread must return a message to the main thread with:

- `status`
- `scope`
- `findings` or `classified_paths`
- `validation_performed`
- `risks_or_blockers`

Callback prefixes:

- `CLASSIFY1_DONE`
- `CLASSIFY2_DONE`
- `RUBRIC_DONE`
- `EVALA_DONE`
- `EVALB_DONE`
- `BLOCKED`

## Output Shape

Use flat bullets only. No nested bullets.

Required sections:

1. `Included`
2. `Excluded`
3. `Borderline`
4. `Key risks`
5. `Next action`
