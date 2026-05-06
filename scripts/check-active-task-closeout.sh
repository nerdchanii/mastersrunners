#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

python3 - "$ROOT_DIR" <<'PY'
from __future__ import annotations

import sys
from pathlib import Path


def parse_frontmatter(path: Path) -> list[str] | None:
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0] != "---":
        return None

    frontmatter: list[str] = []
    for line in lines[1:]:
        if line == "---":
            return frontmatter
        frontmatter.append(line)

    return None


def parse_simple(frontmatter: list[str], key: str) -> str:
    prefix = f"{key}:"
    for line in frontmatter:
        if line.startswith(prefix):
            return line.split(":", 1)[1].strip()
    return ""


root = Path(sys.argv[1])
active_tasks = sorted((root / "tasks" / "active").glob("*.md"))
if not active_tasks:
    print("No active task files found.")
    raise SystemExit(0)

errors: list[str] = []

for task_path in active_tasks:
    frontmatter = parse_frontmatter(task_path)
    if frontmatter is None:
        errors.append(f"{task_path}: missing or malformed frontmatter")
        continue

    execution_status = parse_simple(frontmatter, "execution_status")
    verification_status = parse_simple(frontmatter, "verification_status")
    closeout_blocker = parse_simple(frontmatter, "closeout_blocker")

    if execution_status not in {"in_progress", "blocked", "ready_for_archive"}:
        errors.append(f"{task_path}: invalid or missing execution_status")
    if verification_status not in {"pending", "partial", "passed"}:
        errors.append(f"{task_path}: invalid or missing verification_status")
    if execution_status == "blocked" and not closeout_blocker:
        errors.append(f"{task_path}: blocked active tasks must declare closeout_blocker")
    if execution_status == "ready_for_archive":
        errors.append(
            f"{task_path}: execution_status is ready_for_archive, so move the task to tasks/archive in the same changeset"
        )

if errors:
    print("Active task closeout check failed.")
    for error in errors:
        print(f" - {error}")
    raise SystemExit(1)

print(f"Active task closeout check passed for {len(active_tasks)} active task file(s).")
PY
