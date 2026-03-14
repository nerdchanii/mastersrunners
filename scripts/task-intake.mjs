#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import {
  getRepoRoot,
  initiativeIdFromParent,
  parseArgs,
  requireArg,
  reviewerForScope,
  slugify,
  titleFromGoal,
} from "./task-runtime-lib.mjs";

const args = parseArgs(process.argv.slice(2));

async function main() {
  const repoRoot = getRepoRoot();
  const goal = requireArg(args, "goal");
  const parent = requireArg(args, "parent");
  const order = requireArg(args, "order");
  const scope = requireArg(args, "scope");
  const slug = slugify(requireArg(args, "slug"));
  const state = args.state === "active" ? "active" : "todo";
  const initiativeId = initiativeIdFromParent(parent);
  const taskId = `${initiativeId}-${order}`;
  const title = args.title ? args.title.trim() : titleFromGoal(goal);
  const reviewer = reviewerForScope(scope);
  const taskDir = path.join(repoRoot, "tasks", parent, state);
  const taskPath = path.join(taskDir, `${taskId}-${scope}-${slug}.md`);

  await fs.mkdir(taskDir, { recursive: true });
  try {
    await fs.access(taskPath);
    throw new Error(`Task file already exists: ${taskPath}`);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  const content = `---
id: ${taskId}
title: ${title}
parent: ${parent}
scope: ${scope}
owner: unassigned
reviewers:
  - ${reviewer}
po_review: required
depends_on: []
blocked_by: []
verify:
  - test -f ${path.relative(repoRoot, taskPath)}
artifacts:
  - ${path.relative(repoRoot, taskPath)}
---

## Goal

${goal}

## Done Criteria

- task scope is implemented or documented end to end
- verify commands are replaced with task-specific checks before completion

## Notes

- Created by \`pnpm task:intake\`
- Replace the placeholder verify command before moving this task to review or archive

## Runtime

- Runtime sidecar: \`${taskId}.runtime.yaml\` when the task is in \`active/\`
- Next safe action:
- Branch / worktree notes:

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check:
- PO reviewer should check:

## Handoff

- What the next task should know

## Design Divergence

- Record any gap between approved design and current implementation.
- If a gap remains after this task, link the follow-up task here.
- Do not rewrite approved design docs downward just to match unfinished code.

## Attempt Log

- ${new Date().toISOString().slice(0, 10)}: scaffolded by \`pnpm task:intake\`.

## Review Notes

- Specialist review:
- PO review:
`;

  await fs.writeFile(taskPath, content, "utf8");
  console.log(taskPath);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
