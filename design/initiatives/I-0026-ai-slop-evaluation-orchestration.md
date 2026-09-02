# I-0026: AI Slop Evaluation Orchestration

## Summary

Plan a deterministic multi-thread evaluation workflow that measures code/document coherence drift, classifies the repository review surface before scoring, and produces line-cited read-only reports.

## Problem

The repository needs a repeatable way to detect "AI slop": documents that no longer match code, source-of-truth collisions, stale workflow guidance, and low-signal generated prose. The current ask also requires the evaluation workflow itself to be explicit: thread roles, model choices, prompt templates, callback/report contracts, and file-scope classification before any scoring pass.

## Goals

- Preserve the initial user request in this initiative (`Original Request` below) so every agent can refer back to it from tracked history.
- Separate the work into deterministic prompt templates that background Codex threads can read by file path.
- Run repository-surface classification in two delegated passes using `gpt-5.5` with `thinking: medium`.
- Delegate rubric and metric design to `gpt-5.5` with `thinking: high`.
- Reserve `gpt-5.3-codex-spark` and `gpt-5.4-mini` as the evaluation models for later scoring/report normalization passes.
- Keep raw files read-only and require `path:#LXX` evidence in every analytical report.

## Non-Goals

- Do not edit application source as part of the evaluation workflow setup.
- Do not auto-fix detected slop in this task.
- Do not treat generated outputs as ground truth without line-cited repository evidence.

## Scope

- `.gitignore`
- `prompts/ai-slop/*.md`
- `design/initiatives/I-0026-ai-slop-evaluation-orchestration.md`
- `tasks/active/I-0026-010-meta-ai-slop-evaluation-orchestration.md`

## Task Breakdown

- `tasks/active/I-0026-010-meta-ai-slop-evaluation-orchestration.md`

## Success Criteria

- The repository has tracked prompt templates for classification, rubric design, evaluation, and report contracts.
- The templates define model selection, forbidden actions, evidence rules, and callback/report structure.
- At least the first delegated sessions are started from the templates with explicit callback prefixes.
- The current repository status report explains the pre-existing dirty cleanup commit and the remaining orchestration work.

## Original Request

Recorded 2026-06-18. Until 2026-09-02 this lived in an ignored local file (`prompts/user_requst.md`); it is now tracked here so that both Claude Code and Codex read the same ask.

- Read the codebase state and write a report on the current work state. Plan prompt templates plus an evaluation strategy first, then start the work in a new session.
- Detect "AI slop" where document coherence is broken. Review source code and documents three times per document.
- `node_modules` is out of scope. Classify required versus unnecessary files first, in two delegated classification passes.
- Rubric and metric selection is delegated to a stronger-reasoning model; classification to a medium-reasoning model; the actual evaluation passes to the two lighter evaluation models named in `prompts/ai-slop/strategy.md`.
- Write the prompts that agents will receive as templates, and have sessions read the templated documents deterministically by file path.
- Before evaluating, settle the evaluation strategy and how results are reported back: which model evaluates, with which prompt, against which criteria.
- Raw files are read-only. Analytical reports must cite evidence as `path:#LXX`.
- The codebase was dirty at the time; clean and commit the dirty state before starting the evaluation.
