import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import os from "node:os";
import { parseArgs as nodeParseArgs } from "node:util";

export function parseArgs(argv) {
  const { tokens } = nodeParseArgs({
    args: argv,
    strict: false,
    allowPositionals: true,
    tokens: true,
  });

  const values = {};
  for (const token of tokens) {
    if (token.kind !== "option") {
      continue;
    }
    const next = argv[token.index + 1];
    if (!next || next.startsWith("--")) {
      values[token.name] = true;
      continue;
    }
    values[token.name] = next;
  }
  return values;
}

export function requireArg(args, key) {
  const value = args[key];
  if (value === undefined || value === true || value === "") {
    throw new Error(`Missing required --${key}`);
  }
  return value;
}

export function getRepoRoot(cwd = process.cwd()) {
  return execFileSync("git", ["rev-parse", "--show-toplevel"], {
    cwd,
    encoding: "utf8",
  }).trim();
}

export function getCurrentBranch(cwd = process.cwd()) {
  return execFileSync("git", ["branch", "--show-current"], {
    cwd,
    encoding: "utf8",
  }).trim();
}

export function getHeadSha(cwd = process.cwd()) {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd,
    encoding: "utf8",
  }).trim();
}

export function currentIso() {
  return new Date().toISOString();
}

export function addSeconds(isoString, seconds) {
  const date = new Date(isoString);
  date.setSeconds(date.getSeconds() + seconds);
  return date.toISOString();
}

export function makeLeaseOwner() {
  return `${os.userInfo().username}@${os.hostname()}:${process.pid}`;
}

export async function findTaskById(repoRoot, taskId) {
  const tasksRoot = path.join(repoRoot, "tasks");
  const entries = [];
  for (const initiative of await fs.readdir(tasksRoot, { withFileTypes: true })) {
    if (!initiative.isDirectory() || initiative.name.startsWith("_")) {
      continue;
    }
    const initiativePath = path.join(tasksRoot, initiative.name);
    for (const statusDir of ["todo", "active", "archive"]) {
      const statusPath = path.join(initiativePath, statusDir);
      try {
        const files = await fs.readdir(statusPath);
        for (const file of files) {
          if (file.startsWith(`${taskId}-`) && file.endsWith(".md")) {
            entries.push({
              taskId,
              initiative: initiative.name,
              status: statusDir,
              taskPath: path.join(statusPath, file),
            });
          }
        }
      } catch {
        // ignore missing folder
      }
    }
  }

  if (entries.length === 0) {
    throw new Error(`Task ${taskId} not found`);
  }
  if (entries.length > 1) {
    throw new Error(`Task ${taskId} resolved to multiple files`);
  }
  return entries[0];
}

export function runtimePathForTask(taskEntry) {
  return path.join(
    path.dirname(taskEntry.taskPath),
    `${taskEntry.taskId}.runtime.yaml`,
  );
}

export async function readRuntimeFile(runtimePath) {
  const text = await fs.readFile(runtimePath, "utf8");
  return parseFlatYaml(text);
}

export async function writeRuntimeFile(runtimePath, data) {
  await fs.writeFile(runtimePath, stringifyFlatYaml(data), "utf8");
}

export async function runtimeExists(runtimePath) {
  try {
    await fs.access(runtimePath);
    return true;
  } catch {
    return false;
  }
}

export async function listActiveRuntimeFiles(repoRoot) {
  const tasksRoot = path.join(repoRoot, "tasks");
  const runtimeFiles = [];
  for (const initiative of await fs.readdir(tasksRoot, { withFileTypes: true })) {
    if (!initiative.isDirectory() || initiative.name.startsWith("_")) {
      continue;
    }
    const activePath = path.join(tasksRoot, initiative.name, "active");
    try {
      const files = await fs.readdir(activePath);
      for (const file of files) {
        if (file.endsWith(".runtime.yaml")) {
          runtimeFiles.push(path.join(activePath, file));
        }
      }
    } catch {
      // ignore missing folder
    }
  }
  return runtimeFiles;
}

export async function findLiveBranchLease(repoRoot, branch, ignoreRuntimePath = null) {
  const files = await listActiveRuntimeFiles(repoRoot);
  const now = Date.now();
  for (const file of files) {
    if (ignoreRuntimePath && path.resolve(file) === path.resolve(ignoreRuntimePath)) {
      continue;
    }
    const runtime = await readRuntimeFile(file);
    if (runtime.branch !== branch) {
      continue;
    }
    if (!runtime.lease_expires_at) {
      continue;
    }
    if (Date.parse(runtime.lease_expires_at) > now) {
      return { runtimePath: file, runtime };
    }
  }
  return null;
}

export function ensurePrAttachmentConsistency(runtime, currentHeadSha) {
  const hasPrNumber = runtime.pr_number !== null && runtime.pr_number !== undefined;
  const hasHeadSha = runtime.head_sha !== null && runtime.head_sha !== undefined;

  if (hasPrNumber !== hasHeadSha) {
    throw new Error(
      "PR-attached runtime must have both pr_number and head_sha, or neither",
    );
  }

  if (hasHeadSha && runtime.head_sha !== currentHeadSha) {
    throw new Error(
      "Runtime head_sha does not match the current branch head; fail closed and reconcile PR state before resuming",
    );
  }
}

export function buildRuntimeRecord({
  taskId,
  branch,
  worktreePath,
  state = "running",
  nextSafeAction = "inspect canonical task state and perform the next safe transition",
  leaseSeconds = 90,
  prior = {},
}) {
  const now = currentIso();
  const runId = prior.run_id || `${taskId}-${Date.now()}`;
  return {
    task_id: taskId,
    run_id: runId,
    branch,
    worktree_path: worktreePath,
    state,
    next_safe_action: prior.next_safe_action || nextSafeAction,
    lease_owner: makeLeaseOwner(),
    lease_expires_at: addSeconds(now, leaseSeconds),
    last_heartbeat_at: now,
    last_verify_snapshot: prior.last_verify_snapshot || "unknown",
    last_review_snapshot: prior.last_review_snapshot || "unknown",
    escalation_reason: prior.escalation_reason ?? null,
    pr_number: prior.pr_number ?? null,
    head_sha: prior.head_sha ?? null,
  };
}

export function reviewerForScope(scope) {
  if (scope === "docs") {
    return "docs-reviewer";
  }
  if (scope === "web") {
    return "frontend-reviewer";
  }
  if (scope === "api" || scope === "db") {
    return "backend-reviewer";
  }
  return "harness-reviewer";
}

export function titleFromGoal(goal) {
  return goal.trim().replace(/\s+/g, " ").slice(0, 72);
}

export function slugify(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function initiativeIdFromParent(parent) {
  const match = parent.match(/^(I-\d{4})-/);
  if (!match) {
    throw new Error(`Unable to derive initiative id from parent ${parent}`);
  }
  return match[1];
}

export function stringifyFlatYaml(data) {
  return `${Object.entries(data)
    .map(([key, value]) => `${key}: ${formatScalar(value)}`)
    .join("\n")}\n`;
}

export function parseFlatYaml(text) {
  const record = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const separator = line.indexOf(":");
    if (separator === -1) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    record[key] = parseScalar(rawValue);
  }
  return record;
}

function formatScalar(value) {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(String(value));
}

function parseScalar(rawValue) {
  if (rawValue === "null") {
    return null;
  }
  if (rawValue === "true") {
    return true;
  }
  if (rawValue === "false") {
    return false;
  }
  if (/^-?\d+(\.\d+)?$/.test(rawValue)) {
    return Number(rawValue);
  }
  try {
    return JSON.parse(rawValue);
  } catch {
    return rawValue;
  }
}
