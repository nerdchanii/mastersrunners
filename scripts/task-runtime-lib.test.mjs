import test from "node:test";
import assert from "node:assert/strict";
import {
  ensurePrAttachmentConsistency,
  parseArgs,
  parseFlatYaml,
  stringifyFlatYaml,
} from "./task-runtime-lib.mjs";

test("parseArgs preserves value and boolean semantics while using util parser tokens", () => {
  assert.deepEqual(parseArgs(["--goal", "hello", "--json", "--lease-seconds", "90"]), {
    goal: "hello",
    json: true,
    "lease-seconds": "90",
  });
});

test("flat yaml roundtrip preserves scalar runtime fields", () => {
  const record = {
    task_id: "I-0008-010",
    run_id: "I-0008-010-123",
    branch: "task-i-0008-agent-company-workflow",
    worktree_path: "/tmp/worktree",
    state: "running",
    next_safe_action: "inspect canonical task state",
    lease_owner: "user@host:1",
    lease_expires_at: "2026-03-14T00:00:00.000Z",
    last_heartbeat_at: "2026-03-14T00:00:00.000Z",
    last_verify_snapshot: "unknown",
    last_review_snapshot: "unknown",
    escalation_reason: null,
    pr_number: 14,
    head_sha: "abc123",
  };

  const text = stringifyFlatYaml(record);
  assert.deepEqual(parseFlatYaml(text), record);
});

test("pr attachment consistency fails if only one PR field exists", () => {
  assert.throws(
    () => ensurePrAttachmentConsistency({ pr_number: 12, head_sha: null }, "abc"),
    /both pr_number and head_sha/,
  );
});

test("pr attachment consistency fails if head sha does not match", () => {
  assert.throws(
    () =>
      ensurePrAttachmentConsistency(
        { pr_number: 12, head_sha: "old" },
        "new",
      ),
    /does not match the current branch head/,
  );
});
