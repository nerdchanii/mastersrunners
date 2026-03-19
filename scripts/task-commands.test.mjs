import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const repoScript = (name) => path.resolve(import.meta.dirname, name);

function run(cmd, args, cwd) {
  return execFileSync(cmd, args, { cwd, encoding: "utf8" }).trim();
}

function runFailure(cmd, args, cwd) {
  try {
    execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: "pipe" });
    throw new Error("Expected command to fail");
  } catch (error) {
    if (error.message === "Expected command to fail") {
      throw error;
    }
    return String(error.stderr || error.stdout || error.message).trim();
  }
}

async function makeRepo() {
  const repoDir = await fs.mkdtemp(path.join(os.tmpdir(), "task-supervisor-"));
  await fs.mkdir(path.join(repoDir, "tasks", "I-9999-test", "todo"), {
    recursive: true,
  });
  await fs.mkdir(path.join(repoDir, "tasks", "I-9999-test", "active"), {
    recursive: true,
  });
  await fs.mkdir(path.join(repoDir, "tasks", "I-9999-test", "archive"), {
    recursive: true,
  });
  await fs.writeFile(path.join(repoDir, ".gitignore"), "node_modules/\n", "utf8");

  run("git", ["init"], repoDir);
  run("git", ["config", "user.name", "Task Test"], repoDir);
  run("git", ["config", "user.email", "task-test@example.com"], repoDir);
  run("git", ["checkout", "-b", "task-i-9999-test"], repoDir);
  run("git", ["add", ".gitignore", "tasks"], repoDir);
  run("git", ["commit", "-m", "test: init repo"], repoDir);

  return repoDir;
}

test("task intake creates a canonical task scaffold", async () => {
  const repoDir = await makeRepo();
  const taskPath = run(
    "node",
    [
      repoScript("task-intake.mjs"),
      "--goal",
      "Define a canonical intake smoke task",
      "--parent",
      "I-9999-test",
      "--order",
      "010",
      "--scope",
      "meta",
      "--slug",
      "intake-smoke",
      "--state",
      "active",
    ],
    repoDir,
  );

  const content = await fs.readFile(taskPath, "utf8");
  assert.match(taskPath, /I-9999-010-meta-intake-smoke\.md$/);
  assert.match(content, /Runtime sidecar: `I-9999-010\.runtime\.yaml`/);
  assert.match(content, /Created by `pnpm task:intake`/);
});

test("task start, status, and resume operate on the runtime sidecar", async () => {
  const repoDir = await makeRepo();

  const taskPath = run(
    "node",
    [
      repoScript("task-intake.mjs"),
      "--goal",
      "Exercise runtime continuity",
      "--parent",
      "I-9999-test",
      "--order",
      "020",
      "--scope",
      "meta",
      "--slug",
      "runtime-smoke",
      "--state",
      "active",
    ],
    repoDir,
  );
  assert.ok(taskPath);

  const runtimePath = run("node", [repoScript("task-start.mjs"), "--task", "I-9999-020"], repoDir);
  const runtimeText = await fs.readFile(runtimePath, "utf8");
  assert.match(runtimeText, /task_id: "I-9999-020"/);
  assert.match(runtimeText, /state: "running"/);

  const statusJson = run(
    "node",
    [repoScript("task-status.mjs"), "--task", "I-9999-020", "--json"],
    repoDir,
  );
  const status = JSON.parse(statusJson);
  assert.equal(status.task_status, "active");
  assert.equal(status.runtime.task_id, "I-9999-020");
  assert.equal(status.runtime.branch, "task-i-9999-test");

  const resumedPath = run("node", [repoScript("task-resume.mjs"), "--task", "I-9999-020"], repoDir);
  assert.equal(resumedPath, runtimePath);
});

test("task status fails closed when runtime identity drifts from the current branch", async () => {
  const repoDir = await makeRepo();

  run(
    "node",
    [
      repoScript("task-intake.mjs"),
      "--goal",
      "Exercise status fail-closed checks",
      "--parent",
      "I-9999-test",
      "--order",
      "030",
      "--scope",
      "meta",
      "--slug",
      "status-guard",
      "--state",
      "active",
    ],
    repoDir,
  );
  const runtimePath = run("node", [repoScript("task-start.mjs"), "--task", "I-9999-030"], repoDir);

  let runtimeText = await fs.readFile(runtimePath, "utf8");
  runtimeText = runtimeText.replace('branch: "task-i-9999-test"', 'branch: "other-branch"');
  await fs.writeFile(runtimePath, runtimeText, "utf8");

  const stderr = runFailure(
    "node",
    [repoScript("task-status.mjs"), "--task", "I-9999-030"],
    repoDir,
  );
  assert.match(stderr, /Runtime branch does not match the current worktree branch/);
});
