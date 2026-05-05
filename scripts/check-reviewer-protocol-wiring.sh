#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

python3 - "$ROOT_DIR" <<'PY'
from __future__ import annotations

import sys
from pathlib import Path

root = Path(sys.argv[1])
workflow = (root / ".github" / "workflows" / "ci.yml").read_text(encoding="utf-8")
ci_local = (root / "scripts" / "ci-local.sh").read_text(encoding="utf-8")
codex_config = root / ".codex" / "config.toml"
codex_hooks = root / ".codex" / "hooks.json"

errors: list[str] = []

if 'paths-ignore:' in workflow and '"**/*.md"' in workflow:
    errors.append(".github/workflows/ci.yml must not ignore markdown-only changes because reviewer protocols and skills are markdown control-plane files")

if "bash scripts/check-reviewer-protocols.sh" not in workflow:
    errors.append(".github/workflows/ci.yml must run bash scripts/check-reviewer-protocols.sh")

if "bash scripts/check-reviewer-protocol-wiring.sh" not in workflow:
    errors.append(".github/workflows/ci.yml must run bash scripts/check-reviewer-protocol-wiring.sh")

if "bash scripts/check-task-review-metadata.sh" not in workflow:
    errors.append(".github/workflows/ci.yml must run bash scripts/check-task-review-metadata.sh")

if "bash scripts/check-codex-stop-review-hook.sh" not in workflow:
    errors.append(".github/workflows/ci.yml must run bash scripts/check-codex-stop-review-hook.sh")

if "bash scripts/check-reviewer-protocols.sh" not in ci_local:
    errors.append("scripts/ci-local.sh must run bash scripts/check-reviewer-protocols.sh")

if "bash scripts/check-reviewer-protocol-wiring.sh" not in ci_local:
    errors.append("scripts/ci-local.sh must run bash scripts/check-reviewer-protocol-wiring.sh")

if "bash scripts/check-task-review-metadata.sh" not in ci_local:
    errors.append("scripts/ci-local.sh must run bash scripts/check-task-review-metadata.sh")

if "bash scripts/check-codex-stop-review-hook.sh" not in ci_local:
    errors.append("scripts/ci-local.sh must run bash scripts/check-codex-stop-review-hook.sh")

if "check-reviewer-capability-inventory.sh" in workflow or "check-reviewer-capability-inventory.sh" in ci_local:
    errors.append("legacy reviewer capability inventory check must be removed from workflow wiring")

if not codex_config.exists():
    errors.append(".codex/config.toml must exist so repo-local Codex hooks are part of the project config layer")
else:
    codex_config_text = codex_config.read_text(encoding="utf-8")
    if "codex_hooks = true" not in codex_config_text:
        errors.append(".codex/config.toml must enable codex_hooks = true")
    if "multi_agent = true" not in codex_config_text:
        errors.append(".codex/config.toml must enable multi_agent = true for same-session reviewer subagent automation")

if not codex_hooks.exists():
    errors.append(".codex/hooks.json must exist for repo-local Stop-hook review automation")
else:
    hooks_text = codex_hooks.read_text(encoding="utf-8")
    if '"Stop"' not in hooks_text:
        errors.append(".codex/hooks.json must register a Stop hook")
    if "scripts/codex-stop-review-hook.py" not in hooks_text:
        errors.append(".codex/hooks.json must call scripts/codex-stop-review-hook.py")

if errors:
    print("Reviewer protocol wiring check failed.")
    for error in errors:
        print(f" - {error}")
    raise SystemExit(1)

print("Reviewer protocol wiring check passed.")
PY
