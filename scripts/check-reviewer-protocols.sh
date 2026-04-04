#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

python3 - "$ROOT_DIR" <<'PY'
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

root = Path(sys.argv[1])
protocols_path = root / "reviewers" / "protocols.json"

if not protocols_path.exists():
    print("Reviewer protocol check failed.")
    print(" - reviewers/protocols.json is missing")
    raise SystemExit(1)

data = json.loads(protocols_path.read_text(encoding="utf-8"))
errors: list[str] = []
reviewers = data.get("reviewers", {})

if not reviewers:
    errors.append("reviewers/protocols.json: no reviewers configured")

toml_name_pattern = re.compile(r'^name\s*=\s*"([^"]+)"\s*$', re.MULTILINE)
md_frontmatter_pattern = re.compile(r'^---\n(.*?)\n---', re.DOTALL)
yaml_name_pattern = re.compile(r"^name:\s*(.+?)\s*$", re.MULTILINE)

for reviewer, config in reviewers.items():
    for key in ("codex_agent", "claude_agent"):
        rel = config.get(key)
        if not rel:
            errors.append(f"{reviewer}: missing {key}")
            continue
        path = root / rel
        if not path.exists():
            errors.append(f"{reviewer}: missing {rel}")
            continue
        text = path.read_text(encoding="utf-8")
        if key == "codex_agent":
            match = toml_name_pattern.search(text)
            if not match or match.group(1) != reviewer:
                errors.append(f"{reviewer}: codex agent name mismatch")
        else:
            fm = md_frontmatter_pattern.search(text)
            if not fm:
                errors.append(f"{reviewer}: claude agent frontmatter missing")
            else:
                match = yaml_name_pattern.search(fm.group(1))
                if not match or match.group(1).strip() != reviewer:
                    errors.append(f"{reviewer}: claude agent name mismatch")

    for key in ("codex_skills", "claude_skills"):
        skills = config.get(key, [])
        if not skills:
            errors.append(f"{reviewer}: missing {key}")
            continue
        for rel in skills:
            path = root / rel
            if not path.exists():
                errors.append(f"{reviewer}: missing {rel}")
                continue
            if path.name != "SKILL.md":
                errors.append(f"{reviewer}: skill entry must point to SKILL.md -> {rel}")

if errors:
    print("Reviewer protocol check failed.")
    for error in errors:
        print(f" - {error}")
    raise SystemExit(1)

print(f"Reviewer protocol check passed for {len(reviewers)} reviewer definition(s).")
PY
