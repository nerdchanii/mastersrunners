---
doc_state: current
owner: harness
last_verified: 2026-03-14
sources:
  - AGENTS.md
  - docs/runbooks/harness-diagnostics.md
---

# Exceptions Register

Exceptions are only for repository controls that cannot be fully proven or closed inside the repository.

## Schema

- `id`: stable `EX-xxxx` identifier
- `related_principles`: one or more `P1`-`P12` principle ids from `harness-diagnostics`
- `repo_control`: stable label for the blocked repository control
- `reason_not_repo_controllable`: why the repo alone cannot satisfy the item
- `external_owner`: who controls the missing proof or setting
- `required_external_proof`: what evidence would close the exception
- `revisit_date`: next required review date
- `unblock_condition`: concrete condition for removing the exception

## Active Exceptions

### EX-0001

- `related_principles`: `P3`, `P10`
- `repo_control`: `branch-protection`
- `reason_not_repo_controllable`: GitHub branch protection and required status checks are repository-host settings, not files in the repo.
- `external_owner`: repository admin
- `required_external_proof`: screenshot or admin confirmation that main is protected and required checks match CI
- `revisit_date`: 2026-04-01
- `unblock_condition`: branch protection is enabled and recorded by external proof

### EX-0002

- `related_principles`: `P8`
- `repo_control`: `monitoring-live-hookup`
- `reason_not_repo_controllable`: monitoring vendor/project hookup and DSN configuration require external project provisioning and secrets.
- `external_owner`: project owner
- `required_external_proof`: active Sentry or equivalent project with DSN configured for web/api
- `revisit_date`: 2026-04-01
- `unblock_condition`: monitoring scaffold is connected to a live project and verified externally

### EX-0003

- `related_principles`: `P8`
- `repo_control`: `prod-alert-routing`
- `reason_not_repo_controllable`: alert routing and production notification destinations live outside the repository.
- `external_owner`: project owner
- `required_external_proof`: alert policy or routing destination for production errors
- `revisit_date`: 2026-04-01
- `unblock_condition`: alert routing is configured and externally verified
