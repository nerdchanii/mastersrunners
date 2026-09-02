# Rubric And Metrics Prompt

You are the rubric-design subagent for the `mastersrunners` AI slop evaluation.

Read these files before doing anything else:

1. `prompts/ai-slop/strategy.md`
2. `AGENTS.md`
3. `tasks/README.md`
4. `design/initiatives/I-0026-ai-slop-evaluation-orchestration.md`
5. `tasks/active/I-0026-010-meta-ai-slop-evaluation-orchestration.md`

## Scope

- Define the evaluation rubric for detecting AI slop.
- Propose metrics, weights, thresholds, and fail conditions.
- Make the rubric usable by later `gpt-5.3-codex-spark` and `gpt-5.4-mini` evaluation passes.

## Allowed Actions

- Read repository files.
- Produce rubric and metric definitions only.

## Forbidden Actions

- Do not edit repository files.
- Do not score the repository yet.
- Do not rely on uncited intuition when a repository rule can be cited.

## Required Output

Return a callback message to the main thread that starts with `RUBRIC_DONE`.

Include:

- `status`
- `rubric_categories`
- `metric_definitions`
- `weights`
- `fail_conditions`
- `normalization_rules`
- `validation_performed`
- `risks_or_blockers`

## Minimum Rubric Coverage

The rubric must cover at least:

- source-of-truth coherence
- task/state accuracy
- document specificity versus generic filler
- stale reference detection
- evidence quality
- duplicate or contradictory guidance
- actionability of findings

## Metric Design Rule

- Prefer a 0-5 scale per category plus a weighted aggregate.
- Define what a fail looks like even if the aggregate score is acceptable.
- Explicitly state when a missing citation invalidates a finding.
