#!/usr/bin/env node

import {
  ensurePrAttachmentConsistency,
  findTaskById,
  getCurrentBranch,
  getHeadSha,
  getRepoRoot,
  parseArgs,
  readRuntimeFile,
  requireArg,
  runtimeExists,
  runtimePathForTask,
} from "./task-runtime-lib.mjs";

const args = parseArgs(process.argv.slice(2));

async function main() {
  const repoRoot = getRepoRoot();
  const taskId = requireArg(args, "task");
  const taskEntry = await findTaskById(repoRoot, taskId);
  const runtimePath = runtimePathForTask(taskEntry);
  const hasRuntime = await runtimeExists(runtimePath);
  const runtime = hasRuntime ? await readRuntimeFile(runtimePath) : null;
  const branch = getCurrentBranch(repoRoot);
  const headSha = getHeadSha(repoRoot);

  if (runtime) {
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
  }

  const payload = {
    task_id: taskId,
    initiative: taskEntry.initiative,
    task_path: taskEntry.taskPath,
    task_status: taskEntry.status,
    current_branch: branch,
    current_head_sha: headSha,
    runtime_path: runtimePath,
    runtime,
  };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`task_id: ${payload.task_id}`);
  console.log(`task_status: ${payload.task_status}`);
  console.log(`task_path: ${payload.task_path}`);
  console.log(`current_branch: ${payload.current_branch}`);
  console.log(`current_head_sha: ${payload.current_head_sha}`);
  console.log(`runtime_path: ${payload.runtime_path}`);
  if (!payload.runtime) {
    console.log("runtime_state: missing");
    return;
  }
  console.log(`runtime_state: ${payload.runtime.state}`);
  console.log(`next_safe_action: ${payload.runtime.next_safe_action}`);
  console.log(`lease_owner: ${payload.runtime.lease_owner}`);
  console.log(`lease_expires_at: ${payload.runtime.lease_expires_at}`);
  console.log(`pr_number: ${payload.runtime.pr_number ?? "null"}`);
  console.log(`head_sha: ${payload.runtime.head_sha ?? "null"}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
