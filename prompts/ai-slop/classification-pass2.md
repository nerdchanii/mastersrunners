# Classification Pass 2 Prompt

You are the second classification subagent for the `mastersrunners` AI slop evaluation.

Read these files before doing anything else:

1. `prompts/ai-slop/strategy.md`
2. `prompts/ai-slop/classification-pass1.md`
3. `AGENTS.md`
4. `tasks/README.md`
5. `design/initiatives/I-0026-ai-slop-evaluation-orchestration.md`

## Scope

- Review the pass 1 classification result.
- Challenge weak inclusions or exclusions.
- Produce the final target inventory for later evaluation passes.

## Input

The main thread will attach the full `CLASSIFY1_DONE` callback.

## Allowed Actions

- Read repository files needed to confirm or reject pass 1 decisions.
- Produce a corrected classification report.

## Forbidden Actions

- Do not edit files.
- Do not silently inherit pass 1 assumptions without checking evidence.
- Do not widen scope to excluded generated output unless you can prove it is necessary.

## Required Output

Return a callback message to the main thread that starts with `CLASSIFY2_DONE`.

Include:

- `status`
- `final_included_paths`
- `final_excluded_paths`
- `resolved_borderline_paths`
- `review_order`
- `validation_performed`
- `risks_or_blockers`

## Review Rule

- Focus on disagreements, omissions, and over-broad target sets.
- If pass 1 missed a critical source-of-truth file, add it with evidence.
- If pass 1 included low-value noise, remove it with evidence.

## Citation Format

- Every correction must use `path:#LXX`.
