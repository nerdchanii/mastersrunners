#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEST_DIR="$(mktemp -d /tmp/mastersrunners-bootstrap-test.XXXXXX)"
WORKTREE_PATH="$TEST_DIR/worktree"
BRANCH_NAME="bootstrap-test-$(date +%s)-$$"
ENV_SOURCE="$TEST_DIR/shared.env"

cleanup() {
  git -C "$ROOT_DIR" worktree remove --force "$WORKTREE_PATH" >/dev/null 2>&1 || true
  git -C "$ROOT_DIR" branch -D "$BRANCH_NAME" >/dev/null 2>&1 || true
  rm -rf "$TEST_DIR"
}

trap cleanup EXIT

cd "$ROOT_DIR"

cat >"$ENV_SOURCE" <<'EOF'
DATABASE_URL=postgresql://bootstrap-test
JWT_SECRET=bootstrap-secret
EOF

bash scripts/bootstrap-worktree.sh \
  --path "$WORKTREE_PATH" \
  --branch "$BRANCH_NAME" \
  --base HEAD \
  --env-source "$ENV_SOURCE" \
  --port-offset 41 \
  --skip-install

test -L "$WORKTREE_PATH/.env"
test "$(readlink "$WORKTREE_PATH/.env")" = "$ENV_SOURCE"
test -f "$WORKTREE_PATH/.env.worktree"
test -f "$WORKTREE_PATH/apps/api/.env.local"
test -f "$WORKTREE_PATH/apps/web/.env.local"

grep -q '^WORKTREE_WEB_PORT=3041$' "$WORKTREE_PATH/.env.worktree"
grep -q '^WORKTREE_API_PORT=4041$' "$WORKTREE_PATH/.env.worktree"
grep -q '^API_PORT=4041$' "$WORKTREE_PATH/apps/api/.env.local"
grep -q '^FRONTEND_URL=http://localhost:3041$' "$WORKTREE_PATH/apps/api/.env.local"
grep -q '^VITE_PORT=3041$' "$WORKTREE_PATH/apps/web/.env.local"
grep -q '^VITE_API_URL=http://localhost:4041/api/v1$' "$WORKTREE_PATH/apps/web/.env.local"

mkdir -p "$WORKTREE_PATH/tasks/todo"
printf 'smoke test\n' >"$WORKTREE_PATH/tasks/todo/I-TEST-010-meta-worktree-smoke.md"

bash scripts/bootstrap-worktree.sh \
  --existing \
  --path "$WORKTREE_PATH" \
  --task-file tasks/todo/I-TEST-010-meta-worktree-smoke.md \
  --env-source "$ENV_SOURCE" \
  --port-offset 42 \
  --skip-install

test ! -e "$WORKTREE_PATH/tasks/todo/I-TEST-010-meta-worktree-smoke.md"
test -f "$WORKTREE_PATH/tasks/active/I-TEST-010-meta-worktree-smoke.md"
grep -q '^WORKTREE_WEB_PORT=3042$' "$WORKTREE_PATH/.env.worktree"
grep -q '^API_PORT=4042$' "$WORKTREE_PATH/apps/api/.env.local"
grep -q '^VITE_PORT=3042$' "$WORKTREE_PATH/apps/web/.env.local"

printf 'bootstrap worktree smoke test passed\n'
