# I-0019: Secret Manager Runtime Boundary Hardening

## Summary

Reduce the Cloud Run runtime secret inventory to the strict-protection minimum without weakening the existing `DATABASE_URL` versus `DIRECT_URL` boundary. Keep only sensitive runtime credentials in Secret Manager, move policy and public URL values to GitHub environment variables, and clean up stale dev secrets and versions.

## Problem

The current deploy workflow and bootstrap script still treat JWT TTLs, `R2_PUBLIC_URL`, and disabled OAuth providers as Secret Manager values. That keeps unnecessary secrets alive in dev, inflates active secret versions, and leaves the operator contract inconsistent with the current Kakao-only runtime posture.

## Goals

- Keep strict-protection runtime secrets in Secret Manager and keep `DIRECT_URL` out of Cloud Run runtime.
- Move non-secret runtime values to GitHub environment variables and document that boundary clearly.
- Remove disabled Google/Naver runtime wiring and clean up the dev Secret Manager inventory and versions.

## Non-Goals

- Do not bundle secrets or collapse the `DATABASE_URL`/`DIRECT_URL` split.
- Do not change the public auth feature policy beyond removing disabled provider wiring.
- Do not roll the same cleanup straight into production before dev verification succeeds.

## Scope

- `.github/workflows/deploy.yml`
- `scripts/bootstrap-gcp-secrets.sh`
- deployment and environment runbooks plus deployment architecture truth
- dev GitHub environment variables, dev Secret Manager cleanup, and a dev Cloud Run rollout using the new inventory

## Design References

- `design/architecture/deployment.md`
- `docs/runbooks/deployment.md`
- `docs/runbooks/environment-and-settings.md`

## Review Plan

- Specialist reviewers: backend review, workflow review, and docs review
- PO review focus: operator clarity, rollout safety, and dev-first scope discipline

## Task Breakdown

- `tasks/archive/I-0019-010-ci-secret-manager-runtime-inventory.md`

## Success Criteria

- dev deploy lane uses the reduced runtime secret inventory and still boots with Kakao auth enabled
- dev Secret Manager no longer stores Google/Naver, JWT TTL, or `R2_PUBLIC_URL`, and stale active versions on retained secrets are reduced
