#!/usr/bin/env node

import {
  buildRuntimeRecord,
  findLiveBranchLease,
  findTaskById,
  getCurrentBranch,
  getRepoRoot,
  runtimeExists,
  runtimePathForTask,
  writeRuntimeFile,
  parseArgs,
  requireArg,
} from "./task-runtime-lib.mjs";

const args = parseArgs(process.argv.slice(2));

async function main() {
  const repoRoot = getRepoRoot();
  const taskId = requireArg(args, "task");
  const leaseSeconds = Number(args["lease-seconds"] || 90);
  const taskEntry = await findTaskById(repoRoot, taskId);

  if (taskEntry.status !== "active") {
    throw new Error(`Task ${taskId} must be in active/ before starting runtime continuity`);
  }

  const runtimePath = runtimePathForTask(taskEntry);
  if (await runtimeExists(runtimePath)) {
    throw new Error(`Runtime file already exists for ${taskId}; use pnpm task:resume instead`);
  }

  const branch = getCurrentBranch(repoRoot);
  const existingLease = await findLiveBranchLease(repoRoot, branch);
  if (existingLease) {
    throw new Error(`Branch ${branch} already has an active lease at ${existingLease.runtimePath}`);
  }

  const runtime = buildRuntimeRecord({
    taskId,
    branch,
    worktreePath: repoRoot,
    leaseSeconds,
  });

  await writeRuntimeFile(runtimePath, runtime);
  console.log(runtimePath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
