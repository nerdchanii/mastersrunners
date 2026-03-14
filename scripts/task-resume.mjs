#!/usr/bin/env node

import {
  buildRuntimeRecord,
  ensurePrAttachmentConsistency,
  findLiveBranchLease,
  findTaskById,
  getCurrentBranch,
  getHeadSha,
  getRepoRoot,
  parseArgs,
  readRuntimeFile,
  requireArg,
  runtimeExists,
  runtimePathForTask,
  writeRuntimeFile,
} from "./task-runtime-lib.mjs";

const args = parseArgs(process.argv.slice(2));

async function main() {
  const repoRoot = getRepoRoot();
  const taskId = requireArg(args, "task");
  const leaseSeconds = Number(args["lease-seconds"] || 90);
  const taskEntry = await findTaskById(repoRoot, taskId);

  if (taskEntry.status !== "active") {
    throw new Error(`Task ${taskId} is not active; resume is only valid for active tasks`);
  }

  const runtimePath = runtimePathForTask(taskEntry);
  if (!(await runtimeExists(runtimePath))) {
    throw new Error(`Runtime file missing for ${taskId}; use pnpm task:start instead`);
  }

  const runtime = await readRuntimeFile(runtimePath);
  const branch = getCurrentBranch(repoRoot);
  const headSha = getHeadSha(repoRoot);

  if (runtime.task_id !== taskId) {
    throw new Error("Runtime task_id does not match the requested task");
  }
  if (runtime.branch !== branch) {
    throw new Error("Runtime branch does not match the current worktree branch");
  }
  if (runtime.worktree_path !== repoRoot) {
    throw new Error("Runtime worktree_path does not match the current worktree");
  }

  ensurePrAttachmentConsistency(runtime, headSha);

  const existingLease = await findLiveBranchLease(repoRoot, branch, runtimePath);
  if (existingLease) {
    throw new Error(`Branch ${branch} already has an active lease at ${existingLease.runtimePath}`);
  }

  const nextState = runtime.state === "completed" ? "completed" : "running";
  const refreshed = buildRuntimeRecord({
    taskId,
    branch,
    worktreePath: repoRoot,
    state: nextState,
    leaseSeconds,
    prior: runtime,
  });

  await writeRuntimeFile(runtimePath, refreshed);
  console.log(runtimePath);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
