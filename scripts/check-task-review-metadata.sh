#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

task_files=()

while IFS= read -r file; do
  task_files+=("$file")
done < <(
  find tasks -type f -name '*.md' \
    \( -path 'tasks/todo/*.md' -o -path 'tasks/active/*.md' \) |
    LC_ALL=C sort
)

if [ "${#task_files[@]}" -eq 0 ]; then
  printf 'No non-archived task files found.\n'
  exit 0
fi

python3 - "$ROOT_DIR" "${task_files[@]}" <<'PY'
from __future__ import annotations

import json
import re
import sys
from pathlib import Path


def parse_frontmatter(path: Path):
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0] != "---":
        return None, ["missing_frontmatter"]

    frontmatter: list[str] = []
    for line in lines[1:]:
        if line == "---":
            return frontmatter, []
        frontmatter.append(line)

    return None, ["missing_frontmatter"]


def parse_review_metadata(frontmatter: list[str]):
    reviewers: list[str] = []
    po_review_required = False
    in_reviewers = False

    for line in frontmatter:
        if re.match(r"^po_review:\s*required\s*$", line):
            po_review_required = True

        if re.match(r"^reviewers:\s*$", line):
            in_reviewers = True
            continue

        if re.match(r"^reviewers:\s*\[\s*\]\s*$", line):
            in_reviewers = False
            continue

        inline = re.match(r"^reviewers:\s*\[(.*)\]\s*$", line)
        if inline:
            raw = inline.group(1).strip()
            if raw:
                reviewers.extend(
                    [item.strip().strip("'\"") for item in raw.split(",") if item.strip()]
                )
            in_reviewers = False
            continue

        if in_reviewers:
            item = re.match(r"^\s*-\s+(.+?)\s*$", line)
            if item:
                reviewers.append(item.group(1).strip().strip("'\""))
                continue

            if re.match(r"^[A-Za-z0-9_]+:", line):
                in_reviewers = False

    problems: list[str] = []
    if not reviewers:
        problems.append("missing_reviewers")
    if not po_review_required:
        problems.append("missing_po_review")

    return reviewers, po_review_required, problems


root = Path(sys.argv[1])
task_files = [Path(p) for p in sys.argv[2:]]
protocols_path = root / "reviewers" / "protocols.json"
errors: list[str] = []

if not protocols_path.exists():
    errors.append("reviewers/protocols.json: missing reviewer protocol registry")
    active_reviewers: set[str] = set()
else:
    protocols = json.loads(protocols_path.read_text(encoding="utf-8"))
    active_reviewers = set(protocols.get("reviewers", {}).keys())
    if not active_reviewers:
        errors.append("reviewers/protocols.json: no reviewers registered")

if "po-reviewer" not in active_reviewers:
    errors.append("reviewers/protocols.json: po-reviewer must exist as a registered reviewer")

for file in task_files:
    frontmatter, frontmatter_errors = parse_frontmatter(file)
    if frontmatter_errors:
        errors.append(f"{file}: missing or malformed frontmatter")
        continue

    reviewers, _po_required, problems = parse_review_metadata(frontmatter)

    for problem in problems:
        if problem == "missing_reviewers":
            errors.append(f"{file}: reviewers must be present and non-empty")
        elif problem == "missing_po_review":
            errors.append(f"{file}: po_review must be set to required")

    for reviewer in reviewers:
        if reviewer not in active_reviewers:
            errors.append(
                f"{file}: reviewer '{reviewer}' is not a registered reviewer protocol in reviewers/protocols.json"
            )

if errors:
    print("Task review metadata check failed.")
    print(
        "Expected every task under tasks/{todo,active}/ to declare a non-empty reviewers list, "
        "po_review: required, and only reviewer names registered in reviewers/protocols.json."
    )
    for error in errors:
        print(f" - {error}")
    raise SystemExit(1)

print(f"Task review metadata check passed for {len(task_files)} non-archived task file(s).")
PY
