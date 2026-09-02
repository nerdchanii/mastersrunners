# Proposed Rubric Contract

This file captures the current proposed rubric derived from the `RUBRIC_DONE` callback.
It is not an approved final contract until the open decision points in `prompts/ai-slop/contract-open-questions.md` are settled.

## Categories

- `source_of_truth_coherence`
- `task_state_accuracy`
- `evidence_quality`
- `stale_reference_detection`
- `duplicate_or_contradictory_guidance`
- `specificity_vs_generic_filler`
- `actionability_of_findings`
- `scope_and_exclusion_discipline`

## Category Weights

- `source_of_truth_coherence`: 20
- `task_state_accuracy`: 15
- `evidence_quality`: 15
- `stale_reference_detection`: 12
- `duplicate_or_contradictory_guidance`: 12
- `specificity_vs_generic_filler`: 10
- `actionability_of_findings`: 10
- `scope_and_exclusion_discipline`: 6

## Score Anchors

- `5`: no material slop; specific, current, source-aligned, line-cited
- `4`: minor issue; low impact; evidence sufficient
- `3`: moderate issue or ambiguity; target usable with neighboring truth checks
- `2`: significant drift, contradiction, stale reference, or generic filler
- `1`: severe drift or repeated uncited or contradictory guidance
- `0`: target cannot be trusted because it conflicts with authoritative truth, lacks required evidence, or violates scope/read-only rules

## Hard Fail Rules

- Any evaluator-produced finding without `path:#LXX` evidence is invalid.
- Pre-existing repository documents are not invalid merely because their own internal references use Markdown links, absolute paths, `path:line`, or shorthand line references.
- If invalid findings exceed 20 percent of a pass, the pass fails `evidence_quality`.
- Any contradiction against the AGENTS source-of-truth map, task state rules, approved design truth, or domain/runbook ownership is a hard fail even if the aggregate score is otherwise acceptable.
- Any pass scoring excluded surfaces such as `node_modules`, `dist`, `out`, `.next`, generated database output, coverage, or binary assets as normal targets fails `scope_and_exclusion_discipline` unless generated diagnostics were explicitly requested.

## Aggregate Caps

- If `evidence_quality < 3`, cap aggregate at 59.
- If `source_of_truth_coherence < 3`, cap aggregate at 69.
- If `actionability_of_findings < 3`, cap aggregate at 79.

## Normalization

- Score each target independently before cluster aggregation.
- Prefer integers; use half-points only when evidence clearly falls between anchors.
- Compute `target_score_0_100` as `sum(category_score / 5 * category_weight)`.
- Tier weights for aggregation only:
- `tier_1`: AGENTS, tasks, design, domain, runbooks = 1.5
- `tier_2`: workflow prompts/scripts and task-owned operational docs = 1.25
- `tier_3`: ancillary docs = 1.0
- Excluded files = 0 and must not enter the denominator.

## Severity Bands

- `critical`: hard fail or unsafe source-truth/task-state drift
- `high`: score below 70 or stale reference likely to mislead work
- `medium`: score 70-84 with actionable fix
- `low`: score 85-94 with minor cleanup
- `clean`: score 95-100

## Interpretation Rules

- If an evaluator-produced claim depends on multiple files, each dependency must have its own `path:#LXX` line citation.
- Do not score legacy/source document citation style as malformed evidence unless that document is itself an evaluation output created under this contract or explicitly claims to follow this contract.
- When docs and implementation diverge, do not lower approved design or domain truth to match code; record divergence or a follow-up task instead.
- For task-state claims, folder location is authoritative over duplicated status text or metadata.
- If a blocker cannot be proven or closed inside the repo and is not routed to `design/operating-rules/exceptions.md` or a follow-up task, fail `actionability_of_findings` and `source_of_truth_coherence`.
