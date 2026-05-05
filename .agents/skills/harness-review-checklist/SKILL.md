---
name: harness-review-checklist
description: Use when reviewing task, CI, script, or repository workflow changes for invariant safety and maintainability.
---

# Harness Review Checklist

Review in this order:

1. Check whether the change creates a second competing source of truth.
2. Check whether scripts, docs, and task conventions still point to the same workflow.
3. Check whether CI, hooks, and verification gates stay deterministic.
4. Check whether any new protocol or registry is narrow enough to maintain.
5. Flag hidden drift, weak validation, or soft enforcement where hard enforcement is expected.
