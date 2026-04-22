#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  bash scripts/bootstrap-gcp-secrets.sh [--dry-run] <gcp-project-id> <env-file>

Description:
  Reads runtime secrets from a local shell-style env file and upserts them into
  Google Secret Manager for the target project.

Required env names:
  DATABASE_URL
  DIRECT_URL
  JWT_SECRET
  R2_ACCOUNT_ID
  R2_ACCESS_KEY_ID
  R2_SECRET_ACCESS_KEY
  R2_BUCKET_NAME
  KAKAO_CLIENT_ID
  KAKAO_CLIENT_SECRET

Examples:
  bash scripts/bootstrap-gcp-secrets.sh mastersrunners-dev-20260331 .env.gcp.dev
  bash scripts/bootstrap-gcp-secrets.sh --dry-run mastersrunners-prod-20260331 .env.gcp.prod
EOF
}

DRY_RUN=0

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=1
  shift
fi

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

if [[ $# -ne 2 ]]; then
  usage >&2
  exit 1
fi

PROJECT_ID="$1"
ENV_FILE="$2"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Env file not found: $ENV_FILE" >&2
  exit 1
fi

REQUIRED_SECRETS=(
  DATABASE_URL
  DIRECT_URL
  JWT_SECRET
  R2_ACCOUNT_ID
  R2_ACCESS_KEY_ID
  R2_SECRET_ACCESS_KEY
  R2_BUCKET_NAME
  KAKAO_CLIENT_ID
  KAKAO_CLIENT_SECRET
)

OPTIONAL_SECRETS=()

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

missing=()
for name in "${REQUIRED_SECRETS[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    missing+=("$name")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  printf 'Missing required env names in %s:\n' "$ENV_FILE" >&2
  printf '  - %s\n' "${missing[@]}" >&2
  exit 1
fi

upsert_secret() {
  local name="$1"
  local value="$2"

  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[dry-run] would upsert secret: $name"
    return 0
  fi

  if gcloud secrets describe "$name" --project "$PROJECT_ID" >/dev/null 2>&1; then
    printf '%s' "$value" | gcloud secrets versions add "$name" \
      --project "$PROJECT_ID" \
      --data-file=- \
      >/dev/null
    echo "updated secret version: $name"
  else
    printf '%s' "$value" | gcloud secrets create "$name" \
      --project "$PROJECT_ID" \
      --replication-policy=automatic \
      --data-file=- \
      >/dev/null
    echo "created secret: $name"
  fi
}

echo "Target project: $PROJECT_ID"
echo "Env file: $ENV_FILE"

for name in "${REQUIRED_SECRETS[@]}"; do
  upsert_secret "$name" "${!name}"
done

for name in "${OPTIONAL_SECRETS[@]}"; do
  if [[ -n "${!name:-}" ]]; then
    upsert_secret "$name" "${!name}"
  fi
done

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "[dry-run] no secrets were changed"
else
  echo "Secret Manager sync complete for $PROJECT_ID"
fi
