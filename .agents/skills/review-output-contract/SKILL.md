---
name: review-output-contract
description: Use when writing specialist or PO review results so the output follows the repository review artifact contract.
---

# Review Output Contract

When you perform a repository review:

1. List findings first, ordered by severity.
2. Use only `high`, `medium`, or `low` severities.
3. Include concrete file references whenever possible.
4. After findings, provide a single decision:
   - `approved`
   - `changes_requested`
5. End with residual risks or follow-up notes.
6. If there are no findings, say `no findings` explicitly instead of leaving the section implicit.
7. Do not implement fixes while acting as a reviewer.
