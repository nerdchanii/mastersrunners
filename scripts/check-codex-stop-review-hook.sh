#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

HOOK_SCRIPT="scripts/codex-stop-review-hook.py"

run_hook() {
  local payload="$1"
  printf '%s' "$payload" | python3 "$HOOK_SCRIPT"
}

make_repo() {
  local repo="$1"
  mkdir -p "$repo/tasks/active" "$repo/reviewers"
  cat > "$repo/AGENTS.md" <<'EOF'
# fixture
EOF
  cat > "$repo/reviewers/protocols.json" <<'EOF'
{
  "review_artifacts_dir": "tasks/reviews",
  "reviewers": {
    "harness-reviewer": {},
    "docs-reviewer": {},
    "po-reviewer": {}
  }
}
EOF
  (
    cd "$repo"
    git init -q
    git config user.email fixture@example.com
    git config user.name fixture
    git add AGENTS.md reviewers/protocols.json tasks
    git commit -q -m "fixture"
  )
}

fixture_root="$(mktemp -d)"
trap 'rm -rf "$fixture_root"' EXIT

repo_multi="$fixture_root/repo-multi"
make_repo "$repo_multi"
cat > "$repo_multi/tasks/active/I-9999-010-meta-first.md" <<'EOF'
---
id: I-9999-010
title: first
parent: I-9999-fixture
scope: meta
owner: codex
reviewers:
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
execution_status: in_progress
review_status: pending
verification_status: passed
closeout_blocker:
verify:
  - echo ok
artifacts: []
---

## 셀프 리뷰

- 범위와 의도: filled
- source of truth: filled
- 설계 divergence: none
- 검증: echo ok
- 리뷰 라우팅: harness-reviewer, po-reviewer
EOF
cp "$repo_multi/tasks/active/I-9999-010-meta-first.md" "$repo_multi/tasks/active/I-9999-020-meta-second.md"
touch "$repo_multi/dirty.txt"

multi_output="$(run_hook "{\"hook_event_name\":\"Stop\",\"cwd\":\"$repo_multi\",\"stop_hook_active\":false}")"
python3 - "$multi_output" <<'PY'
import json
import sys

payload = json.loads(sys.argv[1])
assert payload["decision"] == "block", payload
assert "must not keep more than one active task" in payload["reason"], payload
PY

repo_zero="$fixture_root/repo-zero"
make_repo "$repo_zero"
touch "$repo_zero/dirty.txt"

zero_output="$(run_hook "{\"hook_event_name\":\"Stop\",\"cwd\":\"$repo_zero\",\"stop_hook_active\":false}")"
python3 - "$zero_output" <<'PY'
import json
import sys

payload = json.loads(sys.argv[1])
assert payload["continue"] is True, payload
PY

repo_candidate="$fixture_root/repo-candidate"
make_repo "$repo_candidate"
cat > "$repo_candidate/tasks/active/I-9999-030-meta-candidate.md" <<'EOF'
---
id: I-9999-030
title: candidate
parent: I-9999-fixture
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on: []
blocked_by: []
execution_status: in_progress
review_status: pending
verification_status: passed
closeout_blocker:
verify:
  - bash scripts/check-task-review-metadata.sh
artifacts: []
---

## 셀프 리뷰

- 범위와 의도: filled
- source of truth: filled
- 설계 divergence: none
- 검증: bash scripts/check-task-review-metadata.sh
- 리뷰 라우팅: harness-reviewer, docs-reviewer, po-reviewer
EOF
touch "$repo_candidate/dirty.txt"

candidate_output="$(run_hook "{\"hook_event_name\":\"Stop\",\"cwd\":\"$repo_candidate\",\"stop_hook_active\":false}")"
python3 - "$candidate_output" <<'PY'
import json
import sys

payload = json.loads(sys.argv[1])
assert payload["decision"] == "block", payload
assert "review gate fired" in payload["reason"], payload
assert "harness-reviewer" in payload["reason"], payload
assert "po-reviewer" in payload["reason"], payload
PY

repo_partial="$fixture_root/repo-partial"
make_repo "$repo_partial"
cat > "$repo_partial/tasks/active/I-9999-040-meta-partial.md" <<'EOF'
---
id: I-9999-040
title: partial
parent: I-9999-fixture
scope: meta
owner: codex
reviewers:
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
execution_status: in_progress
review_status: pending
verification_status: partial
closeout_blocker:
verify:
  - echo ok
artifacts: []
---

## 셀프 리뷰

- 범위와 의도: filled
- source of truth: filled
- 설계 divergence: none
- 검증: echo ok
- 리뷰 라우팅: harness-reviewer, po-reviewer
EOF
touch "$repo_partial/dirty.txt"

partial_output="$(run_hook "{\"hook_event_name\":\"Stop\",\"cwd\":\"$repo_partial\",\"stop_hook_active\":false}")"
python3 - "$partial_output" <<'PY'
import json
import sys

payload = json.loads(sys.argv[1])
assert payload["continue"] is True, payload
PY

already_active_output="$(run_hook "{\"hook_event_name\":\"Stop\",\"cwd\":\"$repo_candidate\",\"stop_hook_active\":true}")"
python3 - "$already_active_output" <<'PY'
import json
import sys

payload = json.loads(sys.argv[1])
assert payload["continue"] is True, payload
PY

printf 'Codex Stop review hook smoke check passed.\n'
