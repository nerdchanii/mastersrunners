#!/usr/bin/env python3

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any


EXPECTED_SELF_REVIEW_KEYS = {
    "범위와 의도",
    "source of truth",
    "설계 divergence",
    "검증",
    "리뷰 라우팅",
}


def emit(payload: dict[str, Any]) -> int:
    sys.stdout.write(json.dumps(payload, ensure_ascii=False))
    sys.stdout.write("\n")
    return 0


def load_payload() -> dict[str, Any]:
    raw = sys.stdin.read().strip()
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        return {"_decode_error": str(exc), "_raw": raw}


def resolve_repo_root(cwd: str | None) -> Path | None:
    start = Path(cwd or Path.cwd()).resolve()
    for candidate in (start, *start.parents):
        if (candidate / "AGENTS.md").exists() and (candidate / "tasks").exists():
            return candidate
    try:
        result = subprocess.run(
            ["git", "-C", str(start), "rev-parse", "--show-toplevel"],
            capture_output=True,
            check=True,
            text=True,
        )
    except (FileNotFoundError, subprocess.CalledProcessError):
        return None
    root = Path(result.stdout.strip())
    return root if root.exists() else None


def git_status_lines(root: Path) -> list[str]:
    try:
        result = subprocess.run(
            ["git", "-C", str(root), "status", "--short"],
            capture_output=True,
            check=True,
            text=True,
        )
    except (FileNotFoundError, subprocess.CalledProcessError):
        return []
    return [line for line in result.stdout.splitlines() if line.strip()]


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


def parse_reviewers(frontmatter: list[str]) -> list[str]:
    reviewers: list[str] = []
    in_reviewers = False
    for line in frontmatter:
        if re.match(r"^reviewers:\s*$", line):
            in_reviewers = True
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
    return reviewers


def parse_verify_commands(frontmatter: list[str]) -> list[str]:
    commands: list[str] = []
    in_verify = False
    for line in frontmatter:
        if re.match(r"^verify:\s*$", line):
            in_verify = True
            continue
        if in_verify:
            item = re.match(r"^\s*-\s+(.+?)\s*$", line)
            if item:
                commands.append(item.group(1).strip())
                continue
            if re.match(r"^[A-Za-z0-9_]+:", line):
                in_verify = False
    return commands


def extract_section(text: str, heading: str) -> str:
    pattern = rf"(?ms)^## {re.escape(heading)}\n(.*?)(?=^## |\Z)"
    match = re.search(pattern, text)
    return match.group(1).strip() if match else ""


def self_review_complete(task_text: str) -> bool:
    section = extract_section(task_text, "셀프 리뷰")
    if not section:
        return False

    filled_keys: set[str] = set()
    for line in section.splitlines():
        match = re.match(r"^- (.+?):\s*(.*)$", line.strip())
        if not match:
            continue
        key = match.group(1).strip()
        value = match.group(2).strip()
        if value:
            filled_keys.add(key)

    return EXPECTED_SELF_REVIEW_KEYS.issubset(filled_keys)


def normalize_changed_paths(lines: list[str]) -> list[str]:
    paths: list[str] = []
    for line in lines:
        candidate = line[3:].strip() if len(line) > 3 else line.strip()
        if " -> " in candidate:
            candidate = candidate.split(" -> ", 1)[1].strip()
        if candidate:
            paths.append(candidate)
    return paths


def invariant_block(message: str) -> dict[str, Any]:
    return {
        "decision": "block",
        "reason": (
            "Codex review automation invariant failed.\n\n"
            f"{message}\n\n"
            "Resolve the invariant in the current session before ending it."
        ),
    }


def review_needed_reason(
    *,
    task_id: str,
    task_path: Path,
    reviewers: list[str],
    review_artifacts_dir: str,
    changed_paths: list[str],
    verify_commands: list[str],
) -> str:
    specialist_reviewers = [reviewer for reviewer in reviewers if reviewer != "po-reviewer"]
    changed_block = "\n".join(f"- {path}" for path in changed_paths[:20]) or "- (no changed paths detected)"
    verify_block = "\n".join(f"- {command}" for command in verify_commands) or "- (no verify commands listed)"
    specialist_block = "\n".join(f"- {reviewer}" for reviewer in specialist_reviewers) or "- (none)"

    return f"""Stop hook review gate fired for `{task_id}`.

Task path:
- {task_path.as_posix()}

Do not end this Codex session yet. Continue in the same session and run the required review flow:

1. Re-open the task file and the changed artifacts below.
2. Spawn every required specialist reviewer subagent, using the repository reviewer protocol under `.codex/agents/` and `.agents/skills/`.
3. Wait for the specialist reviews, record each result in `{review_artifacts_dir}/{task_id}/<reviewer>.json`, and summarize each result in the task `리뷰 노트`.
4. If any specialist reviewer returns `changes_requested`, make only the required fixes, rerun the task verify commands, and repeat specialist review until they approve.
5. After specialist approval, run `po-reviewer`, record its artifact and task note, and only then move toward archive/commit.
6. Do not leave the task with `review_status: pending` once the review loop is complete.

Required specialist reviewers:
{specialist_block}

Required PO reviewer:
- po-reviewer

Changed paths:
{changed_block}

Verify commands:
{verify_block}
"""


def main() -> int:
    payload = load_payload()

    if payload.get("_decode_error"):
        return emit(invariant_block(f"Hook payload decode failed: {payload['_decode_error']}"))

    if payload.get("hook_event_name") not in {None, "Stop"}:
        return emit({"continue": True})

    if payload.get("stop_hook_active"):
        return emit({"continue": True})

    root = resolve_repo_root(payload.get("cwd"))
    if root is None:
        return emit(invariant_block("Could not resolve the repository root from the hook payload cwd."))

    changed_status = git_status_lines(root)
    if not changed_status:
        return emit({"continue": True})

    active_tasks = sorted(
        path
        for path in (root / "tasks" / "active").glob("*.md")
        if path.name != ".gitkeep"
    )

    if len(active_tasks) == 0:
        return emit({"continue": True})

    if len(active_tasks) > 1:
        task_lines = "\n".join(f"- {path.relative_to(root).as_posix()}" for path in active_tasks) or "- none"
        return emit(
            invariant_block(
                "Dirty worktrees must not keep more than one active task for Codex Stop-hook review automation.\n"
                f"Current active tasks:\n{task_lines}"
            )
        )

    task_path = active_tasks[0]
    frontmatter = parse_frontmatter(task_path)
    if frontmatter is None:
        return emit(invariant_block(f"{task_path.relative_to(root).as_posix()} is missing valid frontmatter."))

    task_text = task_path.read_text(encoding="utf-8")
    task_id = parse_simple(frontmatter, "id")
    execution_status = parse_simple(frontmatter, "execution_status")
    review_status = parse_simple(frontmatter, "review_status")
    verification_status = parse_simple(frontmatter, "verification_status")
    po_review = parse_simple(frontmatter, "po_review")
    reviewers = parse_reviewers(frontmatter)
    verify_commands = parse_verify_commands(frontmatter)

    protocols_path = root / "reviewers" / "protocols.json"
    if not protocols_path.exists():
        return emit(invariant_block("reviewers/protocols.json is missing."))
    protocols = json.loads(protocols_path.read_text(encoding="utf-8"))
    registered_reviewers = set(protocols.get("reviewers", {}).keys())

    metadata_errors: list[str] = []
    if not task_id:
        metadata_errors.append("task id is missing")
    if not reviewers:
        metadata_errors.append("reviewers list is missing or empty")
    if po_review != "required":
        metadata_errors.append("po_review must be set to required")
    for reviewer in reviewers:
        if reviewer not in registered_reviewers:
            metadata_errors.append(f"reviewer '{reviewer}' is not registered in reviewers/protocols.json")
    if "po-reviewer" not in registered_reviewers:
        metadata_errors.append("po-reviewer is not registered in reviewers/protocols.json")

    if metadata_errors:
        return emit(invariant_block("\n".join(f"- {error}" for error in metadata_errors)))

    if execution_status == "ready_for_archive":
        return emit(
            invariant_block(
                f"{task_path.relative_to(root).as_posix()} is still under tasks/active/ with execution_status: ready_for_archive. "
                "Move it to tasks/archive in the same changeset before ending the session."
            )
        )

    if execution_status == "in_progress" and review_status == "approved" and verification_status == "passed":
        return emit(
            invariant_block(
                f"{task_path.relative_to(root).as_posix()} already has review_status=approved and verification_status=passed. "
                "Archive the task instead of ending the session with it still active."
            )
        )

    if execution_status != "in_progress":
        return emit({"continue": True})

    if review_status != "pending" or verification_status != "passed":
        return emit({"continue": True})

    if not self_review_complete(task_text):
        return emit({"continue": True})

    changed_paths = normalize_changed_paths(changed_status)
    review_artifacts_dir = protocols.get("review_artifacts_dir", "tasks/reviews")
    return emit(
        {
            "decision": "block",
            "reason": review_needed_reason(
                task_id=task_id,
                task_path=task_path.relative_to(root),
                reviewers=reviewers,
                review_artifacts_dir=review_artifacts_dir,
                changed_paths=changed_paths,
                verify_commands=verify_commands,
            ),
        }
    )


if __name__ == "__main__":
    raise SystemExit(main())
