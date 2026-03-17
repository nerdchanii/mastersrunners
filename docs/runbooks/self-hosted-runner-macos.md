# macOS Self-Hosted Runner

This runbook is retained as earlier-phase and fallback reference while the connector executor cutover remains staged.

The near-term `I-0003` work publishes connector state surfaces and thread-aware readiness, but it does not by itself prove that every `dev` PR fix path has fully cut over.  
Use [codex-connector-pr-fix.md](/Users/gim-yechan/project/mastersrunners/docs/runbooks/codex-connector-pr-fix.md) for the staged connector control surface, and treat this document as non-default guidance for branches or historical phases that still reference the earlier self-hosted lane.

Historical note:

- earlier review-harness phases used a `codex-runner` machine to execute `Codex PR Fix`
- connector-state publication and thread reconciliation now live in the branch-level PR lane
- full executor retirement remains contingent on the later cutover and smoke-validation tasks
- do not treat this file as the default source of truth for new connector-driven PR operations
