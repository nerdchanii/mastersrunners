# Rollback Runbook

Use this runbook when a deployment completed but the new release is unhealthy or functionally broken.

## Rollback Lanes

- `dev` branch deploy lane -> `masters-runners-api-dev`
- `main` branch deploy lane -> `masters-runners-api`

Use the lane that matches the branch and GitHub environment that produced the unhealthy deploy.

## Signals That Trigger Rollback

- `scripts/verify-deployment.sh` fails after deployment
- health endpoint is down
- critical auth, database, or upload flows fail immediately after release
- runtime config is correct but the new revision still regresses behavior

## Preferred Rollback Path

Prefer `git revert` for code rollback so the failure remains visible in repository history.

Use `docs/runbooks/correction-commit-flow.md` to decide whether the situation needs a forward `fix` commit or an immediate `revert` commit. This runbook covers the rollback branch of that decision.

## Cloud Run Rollback

### 1. List recent revisions

```bash
gcloud run revisions list \
  --service <SERVICE_NAME> \
  --region asia-northeast3
```

### 2. Shift traffic to the last known good revision

```bash
gcloud run services update-traffic <SERVICE_NAME> \
  --region asia-northeast3 \
  --to-revisions <REVISION_NAME>=100
```

### 3. Verify service health

```bash
pnpm deploy:verify -- https://<service-url>
```

## Repository Rollback

When the problem is in the code, create a revert commit instead of rewriting history.

```bash
git revert <bad_commit_sha>
git push origin <BRANCH_NAME>
```

Use the branch that owns the affected lane:

- unhealthy `dev` deploy -> `git push origin dev`
- unhealthy `main` deploy -> `git push origin main`

This lets the existing deploy workflow redeploy the reverted state for the affected lane.

## Local Docker Rollback

If local production-like verification introduced a broken stack:

```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
```

For image-specific local rollback, rerun the stack with the last known good image or commit.

## After Rollback

- Confirm `GET /health` succeeds
- Confirm logs are stable
- Record the rollback reason in the related task or initiative document
- Create a follow-up task before attempting the same change again
