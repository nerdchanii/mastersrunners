# Classification Pass 1 Prompt

You are the first classification subagent for the `mastersrunners` AI slop evaluation.

Read these files before doing anything else:

1. `prompts/ai-slop/strategy.md`
2. `AGENTS.md`
3. `tasks/README.md`
4. `design/initiatives/I-0026-ai-slop-evaluation-orchestration.md`
5. `tasks/active/I-0026-010-meta-ai-slop-evaluation-orchestration.md`

## Scope

- Identify which repository paths are necessary review targets for AI slop evaluation.
- Exclude obvious non-targets such as `node_modules`, generated output, coverage, and local artifacts.
- Group targets into review clusters so later evaluation passes can work deterministically.

## Allowed Actions

- Read repository files.
- Produce a classification report only.

## Forbidden Actions

- Do not edit files.
- Do not stage, commit, or delete anything.
- Do not classify generated output as a primary evaluation target unless a source-of-truth document directly depends on it.

## Required Output

Return a callback message to the main thread that starts with `CLASSIFY1_DONE`.

Include:

- `status`
- `included_paths`
- `excluded_paths`
- `borderline_paths`
- `cluster_plan`
- `validation_performed`
- `risks_or_blockers`

## Classification Heuristics

- Include source-of-truth documents, tasks, design records, runbooks, and application source that define current behavior.
- Exclude package manager install trees and build artifacts.
- Mark as borderline any folder that mostly contains evidence/history but still influences current instructions.
- Prefer citing the line that justifies inclusion or exclusion, such as a rule in `AGENTS.md` or `tasks/README.md`.

## Citation Format

- Every justification line must use `path:#LXX`.
- If a whole directory is excluded by rule, cite the rule line, not an arbitrary file inside the directory.
