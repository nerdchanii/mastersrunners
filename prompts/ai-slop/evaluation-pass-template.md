# Evaluation Pass Template

Use this template for delegated evaluation subagents. If the contract gate is not cleared, the subagent may only return provisional output.

## Subagent Role

- Mechanical pass: deterministic candidate generation only.
- Judge pass 1: `gpt-5.3-codex-spark`, low thinking, provisional repeated measurement.
- Judge pass 2: `gpt-5.3-codex-spark`, low thinking, provisional repeated measurement.
- Judge pass 3: `gpt-5.3-codex-spark`, low thinking, provisional repeated measurement.
- Aggregation/adjudication: `gpt-5.4-mini`, low thinking, normalize only high-variance or disputed items.

## Required Reads

1. `prompts/ai-slop/strategy.md`
2. `prompts/ai-slop/contract-open-questions.md`
3. `prompts/ai-slop/developer-instructions.md`
4. `prompts/ai-slop/final-rubric-contract.md`
5. `prompts/ai-slop/final-classification-inventory.md`
6. confirm whether the rubric/inventory are approved or draft
7. `AGENTS.md`
8. the `Orchestration Rules` section of `prompts/ai-slop/developer-instructions.md`
9. `tasks/README.md`
10. `tasks/active/I-0026-010-meta-ai-slop-evaluation-orchestration.md`

## Gate

- If `prompts/ai-slop/contract-open-questions.md` still contains unresolved decisions, treat any scoring output as provisional.
- Do not present provisional scoring as the final repository report.

## Rules

- Raw files are read-only.
- Judge subagents must receive the same `MECHANICAL_DONE` candidate set from the main thread.
- Findings produced by the judge subagent must cite `path:#LXX`.
- Existing repository documents may use other citation or Markdown-link styles; that is not itself an AI-slop finding unless the document is an evaluation output governed by this contract.
- The evaluation report must separate evidence from inference.
- If a target file cannot be supported by line evidence, mark the finding invalid.
- If a claim depends on multiple files, cite each dependency separately.
- Do not silently expand scope beyond the final classified inventory; mark any newly discovered path as `out_of_inventory_candidate`.
- Repeated judge passes must use the same candidate set, rubric, output schema, and evidence rules.
- Do not let judge passes redefine scope, rubric, weights, output shape, or severity rules.

## Scoring Model

- Score each target independently before any cluster aggregation.
- Use a 0-5 scale for every rubric category.
- Prefer integers; use half-points only when evidence clearly falls between anchors.
- Compute `target_score_0_100` as `sum(category_score / 5 * category_weight)`.

Category weights:

- `source_of_truth_coherence`: 20
- `task_state_accuracy`: 15
- `evidence_quality`: 15
- `stale_reference_detection`: 12
- `duplicate_or_contradictory_guidance`: 12
- `specificity_vs_generic_filler`: 10
- `actionability_of_findings`: 10
- `scope_and_exclusion_discipline`: 6

## Normalization

- Apply document tier weights only when aggregating multiple targets:
- `tier_1`: AGENTS, tasks, design, domain, runbooks = 1.5
- `tier_2`: workflow prompts/scripts and task-owned operational docs = 1.25
- `tier_3`: ancillary docs = 1.0
- excluded files = 0 and must not enter the denominator
- Normalize severity separately from score:
- `critical`: hard fail or unsafe source-truth/task-state drift
- `high`: score below 70 or stale reference likely to mislead work
- `medium`: score 70-84 with actionable fix
- `low`: score 85-94 with minor cleanup
- `clean`: score 95-100

## Hard Fail And Cap Rules

- Any judge-produced finding without `path:#LXX` evidence is invalid.
- If invalid findings exceed 20 percent of a pass, fail `evidence_quality`.
- Any contradiction against the AGENTS source-of-truth map, task state rules, approved design truth, or domain/runbook ownership is a hard fail even if the aggregate score is otherwise acceptable.
- Any pass that scores excluded surfaces such as `node_modules`, `dist`, `out`, `.next`, generated database output, coverage, or binary assets as normal targets fails `scope_and_exclusion_discipline` unless generated diagnostics were explicitly requested.
- If `evidence_quality < 3`, cap the aggregate at 59.
- If `source_of_truth_coherence < 3`, cap the aggregate at 69.
- If `actionability_of_findings < 3`, cap the aggregate at 79.
- If a blocker cannot be proven or closed inside the repo and is not routed to `design/operating-rules/exceptions.md` or a follow-up task, fail `actionability_of_findings` and `source_of_truth_coherence`.
- For task-state claims, folder location is authoritative over duplicated status text or metadata.
- When docs and implementation diverge, do not lower approved design or domain truth to match code; record divergence or a follow-up task instead.

## Judge Required Output

Return a callback to the main thread with:

- `status`
- `pass_id`
- `contract_state`
- `target_ordering`
- `targets_reviewed`
- `scores_by_target`
- `scores_by_category`
- `weighted_scores`
- `aggregate_score_0_100`
- `severity`
- `judged_findings`
- `contradictions_or_gaps`
- `out_of_inventory_candidates`
- `invalid_findings`
- `validation_performed`
- `risks_or_blockers`

## Aggregation Required Output

Return a callback to the main thread with:

- `status`
- `contract_state`
- `passes_aggregated`
- `confirmed_findings`
- `provisional_findings`
- `rejected_findings`
- `variance_flags`
- `score_summary`
- `out_of_inventory_candidates`
- `evidence_quality_notes`
- `risks_or_blockers`

## Provisional Result Rule

- If the contract gate is not cleared, prepend the result with `provisional`.
