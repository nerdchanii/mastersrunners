# Deployment Docs

Canonical deployment guidance now lives in the structured deployment harness docs.

## Read Here

- Runbook: `docs/runbooks/deployment.md`
- Rollback runbook: `docs/runbooks/rollback.md`
- Deployment architecture: `design/architecture/deployment.md`
- Execution workflow: `.github/workflows/deploy.yml`
- Verification script: `scripts/verify-deployment.sh`

## Notes

- `GET /health` is the public health endpoint used for deployment verification.
- The deployment workflow is the source of execution for production rollout.
- Runbooks explain operating procedure, prerequisites, and rollback.
