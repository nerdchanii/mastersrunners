#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

python3 - "$ROOT_DIR" <<'PY'
from __future__ import annotations

import json
import sys
from pathlib import Path

root = Path(sys.argv[1])
errors: list[str] = []

config = root / ".codex" / "config.toml"
hooks = root / ".codex" / "hooks.json"
workflow = root / ".github" / "workflows" / "ci.yml"
ci_local = root / "scripts" / "ci-local.sh"

if not config.exists():
    errors.append(".codex/config.toml must exist")
elif "codex_hooks = false" not in config.read_text(encoding="utf-8"):
    errors.append(".codex/config.toml must keep codex_hooks disabled")

if not hooks.exists():
    errors.append(".codex/hooks.json must exist")
else:
    try:
        hooks_data = json.loads(hooks.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        errors.append(".codex/hooks.json must be valid JSON")
    else:
        if hooks_data.get("hooks", {}).get("Stop"):
            errors.append(".codex/hooks.json must not register a Stop review hook")

for path in (workflow, ci_local):
    text = path.read_text(encoding="utf-8")
    for removed in (
        "scripts/check-reviewer-protocols.sh",
        "scripts/check-reviewer-protocol-wiring.sh",
        "scripts/check-task-review-metadata.sh",
        "scripts/check-codex-stop-review-hook.sh",
    ):
        if removed in text:
            errors.append(f"{path.relative_to(root)} must not run {removed}")

if errors:
    print("Reviewer protocol wiring check failed.")
    for error in errors:
        print(f" - {error}")
    raise SystemExit(1)

print("Reviewer protocol wiring check passed: automatic review gates are disabled.")
PY
