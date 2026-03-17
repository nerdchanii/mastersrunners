#!/usr/bin/env bash

set -euo pipefail

READINESS_MARKER="<!-- pr-merge-readiness-state -->"
POLL_SECONDS=10
TIMEOUT_SECONDS=1800
DRY_RUN=false
PR_NUMBER=""

usage() {
  cat <<'EOF'
Usage: bash scripts/merge-dev-pr.sh [--pr <number>] [--poll-seconds <n>] [--timeout-seconds <n>] [--dry-run]

Repo-standard merge lane for dev-targeted PRs.
The script waits for the machine-readable PR merge readiness state to become ready before merging.
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --pr)
      PR_NUMBER="${2:-}"
      shift 2
      ;;
    --poll-seconds)
      POLL_SECONDS="${2:-}"
      shift 2
      ;;
    --timeout-seconds)
      TIMEOUT_SECONDS="${2:-}"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required." >&2
  exit 1
fi

if ! [[ "$POLL_SECONDS" =~ ^[0-9]+$ ]] || ! [[ "$TIMEOUT_SECONDS" =~ ^[0-9]+$ ]]; then
  echo "--poll-seconds and --timeout-seconds must be positive integers." >&2
  exit 1
fi

resolve_pr_number() {
  if [ -n "$PR_NUMBER" ]; then
    echo "$PR_NUMBER"
    return
  fi

  gh pr view --json number --jq '.number'
}

read_repo_identity() {
  gh repo view --json owner,name --jq '[.owner.login, .name] | @tsv'
}

read_pr_snapshot() {
  local pr_number="$1"
  gh api "repos/$REPO_OWNER/$REPO_NAME/pulls/$pr_number"
}

readiness_state_from_comments() {
  local pr_number="$1"
  gh api --paginate "repos/$REPO_OWNER/$REPO_NAME/issues/$pr_number/comments" | \
    node .github/scripts/internal/read-readiness-from-comments.cjs "$READINESS_MARKER"
}

readiness_state_from_checks() {
  local head_sha="$1"
  gh api "repos/$REPO_OWNER/$REPO_NAME/commits/$head_sha/check-runs" | \
    node .github/scripts/internal/read-readiness-from-checks.cjs
}

readiness_state_json() {
  local pr_number="$1"
  local head_sha="$2"

  if readiness_state_from_comments "$pr_number" 2>/dev/null; then
    return 0
  fi

  readiness_state_from_checks "$head_sha"
}

cleanup_remote_branch() {
  local pr_json="$1"

  local head_ref
  local same_repo
  head_ref="$(printf '%s' "$pr_json" | jq -r '.head.ref')"
  same_repo="$(printf '%s' "$pr_json" | jq -r --arg repo "$REPO_OWNER/$REPO_NAME" '.head.repo.full_name == $repo')"

  if [ "$same_repo" != "true" ]; then
    echo "Skipping branch cleanup for cross-repository PR."
    return
  fi

  if [ "$head_ref" = "main" ] || [ "$head_ref" = "dev" ]; then
    echo "Skipping branch cleanup for shared branch $head_ref."
    return
  fi

  local branch_json protected
  branch_json="$(gh api "repos/$REPO_OWNER/$REPO_NAME/branches/$head_ref")"
  protected="$(printf '%s' "$branch_json" | jq -r '.protected')"
  if [ "$protected" = "true" ]; then
    echo "Skipping branch cleanup for protected branch $head_ref."
    return
  fi

  gh api -X DELETE "repos/$REPO_OWNER/$REPO_NAME/git/refs/heads/$head_ref" >/dev/null
  echo "Deleted remote branch $head_ref after merge."
}

PR_NUMBER="$(resolve_pr_number)"
read -r REPO_OWNER REPO_NAME <<<"$(read_repo_identity)"

start_ts="$(date +%s)"
last_status=""

while true; do
  pr_json="$(read_pr_snapshot "$PR_NUMBER")"
  base_ref="$(printf '%s' "$pr_json" | jq -r '.base.ref')"
  pr_url="$(printf '%s' "$pr_json" | jq -r '.html_url')"

  if [ "$base_ref" != "dev" ]; then
    echo "PR #$PR_NUMBER does not target dev: $pr_url" >&2
    exit 1
  fi

  head_sha="$(printf '%s' "$pr_json" | jq -r '.head.sha')"

  if state_json="$(readiness_state_json "$PR_NUMBER" "$head_sha" 2>/dev/null)"; then
    status="$(printf '%s' "$state_json" | jq -r '.status')"
    reason="$(printf '%s' "$state_json" | jq -r '.reason')"
    merge_allowed="$(printf '%s' "$state_json" | jq -r '.merge_allowed')"
  else
    status="waiting_for_state_comment"
    reason="no_machine_state_comment"
    merge_allowed="false"
  fi

  if [ "$status" != "$last_status" ]; then
    echo "PR #$PR_NUMBER readiness: $status (${reason:-n/a})"
    last_status="$status"
  fi

  if [ "$merge_allowed" = "true" ]; then
    break
  fi

  if [ "$status" = "blocked" ]; then
    echo "PR #$PR_NUMBER is blocked and cannot be merged automatically." >&2
    exit 1
  fi

  now_ts="$(date +%s)"
  if [ $((now_ts - start_ts)) -ge "$TIMEOUT_SECONDS" ]; then
    echo "Timed out waiting for PR #$PR_NUMBER to become ready to merge." >&2
    exit 1
  fi

  sleep "$POLL_SECONDS"
done

if [ "$DRY_RUN" = "true" ]; then
  echo "Dry run: PR #$PR_NUMBER is ready to merge."
  exit 0
fi

echo "Merging PR #$PR_NUMBER..."
gh pr merge "$PR_NUMBER" --merge

merged_pr_json="$(gh api "repos/$REPO_OWNER/$REPO_NAME/pulls/$PR_NUMBER")"
cleanup_remote_branch "$merged_pr_json"
