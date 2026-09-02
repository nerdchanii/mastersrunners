# AI Slop Evaluation Contract Open Questions

This file records the decision points that must be explicitly agreed before any evaluation result is treated as authoritative.

## Why This Exists

The initial request asked for:

- strategy before evaluation
- how results should be reported
- prompt templates for agent threads
- model choice examples
- evaluation criteria examples

It did not fully lock:

- the exact rubric categories
- category weights
- the exact output schema per model
- whether classification outputs should be final contracts or draft proposals
- how broad the scoring surface should be for archive and historical report material

## Decisions Needed

1. Model roles

- Is `gpt-5.3-codex-spark` only a fast first-pass scorer?
- Is `gpt-5.4-mini` only a normalization/review pass?
- Should either model be allowed to redefine rubric details, or only apply an approved rubric?

2. Rubric contract

- Are fixed numeric weights desired?
- If yes, should they be user-approved before use?
- If no, should the rubric stay qualitative with severity bands only?

3. Output contract

- What exact sections should every model output?
- Should outputs be strict YAML/Markdown bullets/free prose?
- Must every pass output aggregate scores, or only findings with evidence?

4. Classification surface

- Should `tasks/archive/**` and `docs/reports/history/**` be sampled only, or fully scored?
- Should lower-truth orientation docs always be included, or only when they conflict with source-of-truth files?

5. Final report shape

- Should the final report prioritize findings only?
- Should it include scorecards?
- Should it separate confirmed issues from provisional issues?

## Current Status

- The existing rubric/inventory/result documents in `prompts/ai-slop/` should be treated as proposed drafts, not approved truth.
- Any completed evaluation pass before this contract is settled is provisional and must not be treated as the final report.
