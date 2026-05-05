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


def parse_frontmatter(path: Path):
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


def normalize_decision(value: str) -> str:
    return value.strip().lower().replace("-", "_").replace(" ", "_")


def extract_review_section(text: str, label: str) -> str:
    pattern = rf"(?ms)^- {re.escape(label)}:\n(.*?)(?=^- [A-Za-z].*:\n|\Z)"
    match = re.search(pattern, text)
    return match.group(1) if match else ""


def parse_review_note_entries(section_text: str) -> list[dict[str, str]]:
    entries: list[dict[str, str]] = []
    current: dict[str, str] = {}

    for raw_line in section_text.splitlines():
        if not raw_line.startswith("  - "):
            continue

        line = raw_line[4:]
        if ":" not in line:
            continue

        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip()

        if key == "reviewer protocol":
            if current:
                entries.append(current)
                current = {}
            current["reviewer_protocol"] = value
        elif key == "reviewer":
            current["reviewer"] = value
        elif key == "artifact":
            current["artifact"] = value
        elif key == "decision":
            current["decision"] = normalize_decision(value)
        elif key == "findings":
            current["findings"] = value
        elif key == "residual risks":
            current["residual_risks"] = value

    if current:
        entries.append(current)

    return [
        entry
        for entry in entries
        if any(entry.get(field, "") for field in ("reviewer", "reviewer_protocol", "artifact", "decision"))
    ]


def validate_artifact(
    *,
    root: Path,
    task_path: Path,
    artifact_path: Path,
    artifact: dict,
    schema: dict,
    task_id: str,
    expected_reviewer: str | None = None,
    expected_decision: str | None = None,
) -> list[str]:
    problems: list[str] = []

    for field in schema.get("required", []):
        if field not in artifact:
            problems.append(
                f"{task_path}: review artifact {artifact_path.relative_to(root)} missing required field '{field}'"
            )

    if artifact.get("task_id") != task_id:
        problems.append(f"{task_path}: {artifact_path.relative_to(root)} task_id mismatch")
    if expected_reviewer and artifact.get("reviewer") != expected_reviewer:
        problems.append(f"{task_path}: {artifact_path.relative_to(root)} reviewer mismatch")
    if artifact.get("review_contract") != "repo-reviewer-artifact-v1":
        problems.append(
            f"{task_path}: {artifact_path.relative_to(root)} review_contract must be repo-reviewer-artifact-v1"
        )

    executed = artifact.get("executed_protocol_paths", [])
    if not isinstance(executed, list) or len(executed) < 1:
        problems.append(
            f"{task_path}: {artifact_path.relative_to(root)} must list executed_protocol_paths"
        )
    else:
        for rel in executed:
            if not isinstance(rel, str) or not (root / rel).exists():
                problems.append(
                    f"{task_path}: {artifact_path.relative_to(root)} executed protocol path does not exist: {rel}"
                )

    compatible = artifact.get("compatible_protocol_paths", [])
    if compatible and not isinstance(compatible, list):
        problems.append(
            f"{task_path}: {artifact_path.relative_to(root)} compatible_protocol_paths must be an array when present"
        )
    elif isinstance(compatible, list):
        for rel in compatible:
            if not isinstance(rel, str) or not (root / rel).exists():
                problems.append(
                    f"{task_path}: {artifact_path.relative_to(root)} compatible protocol path does not exist: {rel}"
                )

    if expected_decision and artifact.get("decision") != expected_decision:
        problems.append(
            f"{task_path}: {artifact_path.relative_to(root)} decision must match review note decision '{expected_decision}'"
        )

    return problems


root = Path(sys.argv[1])
active_tasks = sorted((root / "tasks" / "active").glob("*.md"))
if not active_tasks:
    print("No active task files found.")
    raise SystemExit(0)

protocols_path = root / "reviewers" / "protocols.json"
schema_path = root / "reviewers" / "review-artifact.schema.json"
protocols = json.loads(protocols_path.read_text(encoding="utf-8"))
reviewers_protocol = protocols.get("reviewers", {})
artifacts_dir = root / protocols.get("review_artifacts_dir", "tasks/reviews")
schema = json.loads(schema_path.read_text(encoding="utf-8"))

errors: list[str] = []

for task_path in active_tasks:
    frontmatter = parse_frontmatter(task_path)
    if frontmatter is None:
        errors.append(f"{task_path}: missing or malformed frontmatter")
        continue

    execution_status = parse_simple(frontmatter, "execution_status")
    review_status = parse_simple(frontmatter, "review_status")
    verification_status = parse_simple(frontmatter, "verification_status")
    closeout_blocker = parse_simple(frontmatter, "closeout_blocker")
    task_id = parse_simple(frontmatter, "id")
    task_reviewers = parse_reviewers(frontmatter)
    text = task_path.read_text(encoding="utf-8")
    specialist_entries = parse_review_note_entries(extract_review_section(text, "Specialist review"))
    po_entries = parse_review_note_entries(extract_review_section(text, "PO review"))
    task_artifact_dir = artifacts_dir / task_id

    if execution_status not in {"in_progress", "blocked", "ready_for_archive"}:
        errors.append(f"{task_path}: invalid or missing execution_status")
    if review_status not in {"pending", "approved"}:
        errors.append(f"{task_path}: invalid or missing review_status")
    if verification_status not in {"pending", "partial", "passed"}:
        errors.append(f"{task_path}: invalid or missing verification_status")
    if execution_status == "blocked" and not closeout_blocker:
        errors.append(f"{task_path}: blocked active tasks must declare closeout_blocker")
    if execution_status == "ready_for_archive":
        errors.append(
            f"{task_path}: execution_status is ready_for_archive, so move the task to tasks/archive in the same changeset"
        )
    if execution_status == "in_progress" and review_status == "approved" and verification_status == "passed":
        errors.append(
            f"{task_path}: review_status=approved and verification_status=passed cannot stay execution_status=in_progress"
        )

    if review_status == "approved":
        specialist_split = text.split("- Specialist review:", 1)
        po_split = text.split("- PO review:", 1)
        if len(specialist_split) < 2 or "decision:" not in specialist_split[1]:
            errors.append(f"{task_path}: review_status=approved requires non-empty Specialist review notes")
        if len(po_split) < 2 or "decision:" not in po_split[1]:
            errors.append(f"{task_path}: review_status=approved requires non-empty PO review notes")

        required_reviewers = [*task_reviewers, "po-reviewer"]
        for reviewer in required_reviewers:
            if reviewer not in reviewers_protocol:
                errors.append(f"{task_path}: reviewer '{reviewer}' is not registered in reviewers/protocols.json")
                continue

            artifact_path = task_artifact_dir / f"{reviewer}.json"
            if not artifact_path.exists():
                errors.append(f"{task_path}: missing review artifact {artifact_path.relative_to(root)}")
                continue

            try:
                artifact = json.loads(artifact_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                errors.append(f"{task_path}: invalid JSON in {artifact_path.relative_to(root)}")
                continue

            errors.extend(
                validate_artifact(
                    root=root,
                    task_path=task_path,
                    artifact_path=artifact_path,
                    artifact=artifact,
                    schema=schema,
                    task_id=task_id,
                    expected_reviewer=reviewer,
                    expected_decision="approved",
                )
            )

            if artifact.get("decision") != "approved":
                errors.append(f"{task_path}: {artifact_path.relative_to(root)} decision must be approved")

    allowed_reviewers = set(task_reviewers)
    allowed_reviewers.add("po-reviewer")
    referenced_artifacts: list[tuple[str, str | None, str | None]] = []
    for entry in specialist_entries + po_entries:
        reviewer_name = entry.get("reviewer", "")
        if not reviewer_name:
            errors.append(
                f"{task_path}: review note entries with a decision or reviewer protocol must include a reviewer name"
            )
            continue
        if reviewer_name not in allowed_reviewers:
            errors.append(
                f"{task_path}: review note entry references reviewer '{reviewer_name}' which is not declared for this task"
            )
            continue
        artifact_ref = entry.get("artifact", "")
        if not artifact_ref:
            errors.append(
                f"{task_path}: review note entries with a decision or reviewer protocol must include an artifact path"
            )
            continue
        referenced_artifacts.append((artifact_ref, entry.get("decision"), reviewer_name))

    for artifact_ref, expected_decision, expected_reviewer in referenced_artifacts:
        artifact_path = root / artifact_ref
        if not artifact_path.exists():
            errors.append(f"{task_path}: referenced review artifact is missing: {artifact_ref}")
            continue

        try:
            artifact = json.loads(artifact_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            errors.append(f"{task_path}: invalid JSON in {artifact_ref}")
            continue

        errors.extend(
            validate_artifact(
                root=root,
                task_path=task_path,
                artifact_path=artifact_path,
                artifact=artifact,
                schema=schema,
                task_id=task_id,
                expected_reviewer=expected_reviewer,
                expected_decision=expected_decision,
            )
        )

    noted_change_requests = {
        (reviewer_name, artifact_ref)
        for artifact_ref, expected_decision, reviewer_name in referenced_artifacts
        if expected_decision == "changes_requested" and reviewer_name
    }

    if task_artifact_dir.exists():
        for artifact_path in sorted(task_artifact_dir.glob("*.json")):
            try:
                artifact = json.loads(artifact_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                errors.append(f"{task_path}: invalid JSON in {artifact_path.relative_to(root)}")
                continue

            errors.extend(
                validate_artifact(
                    root=root,
                    task_path=task_path,
                    artifact_path=artifact_path,
                    artifact=artifact,
                    schema=schema,
                    task_id=task_id,
                )
            )

            artifact_ref = str(artifact_path.relative_to(root))
            if artifact.get("decision") == "changes_requested":
                reviewer_name = artifact.get("reviewer")
                if (reviewer_name, artifact_ref) not in noted_change_requests:
                    errors.append(
                        f"{task_path}: changes_requested artifact {artifact_ref} must be referenced from a matching review note entry"
                    )

if errors:
    print("Active task closeout check failed.")
    print("Expected every task under tasks/active/ to expose deterministic closeout state and review proof.")
    for error in errors:
        print(f" - {error}")
    raise SystemExit(1)

print(f"Active task closeout check passed for {len(active_tasks)} active task file(s).")
PY
