#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  findStateComment,
  parsePositiveInt,
  parseState,
  renderState,
} = require("../.github/scripts/pr-autofix-state.cjs");

const VALID_STATUSES = new Set([
  "paused",
  "waiting_for_gemini_identity",
  "waiting_for_gemini_review",
  "waiting_for_connector_fix",
  "running",
  "succeeded",
  "no_changes",
  "failed",
  "retry_required",
  "fork_blocked",
  "untrusted_pr_author",
  "protected_or_shared_head_branch",
]);

function usage() {
  console.error(
    "Usage: node scripts/update-pr-connector-state.mjs --pr <number> --status <state> [--head-sha <sha>] [--fixed-sha <sha>] [--last-result <result>] [--refresh]",
  );
}

function parseArgs(argv) {
  const options = {
    pr: "",
    status: "",
    headSha: "",
    fixedSha: "",
    lastResult: "",
    refresh: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--pr") {
      options.pr = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (token === "--status") {
      options.status = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (token === "--head-sha") {
      options.headSha = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (token === "--fixed-sha") {
      options.fixedSha = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (token === "--last-result") {
      options.lastResult = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (token === "--refresh") {
      options.refresh = true;
      continue;
    }
    if (token === "-h" || token === "--help") {
      usage();
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${token}`);
  }

  if (!parsePositiveInt(options.pr)) {
    throw new Error("--pr must be a positive integer.");
  }
  if (!VALID_STATUSES.has(options.status)) {
    throw new Error(`--status must be one of: ${[...VALID_STATUSES].join(", ")}`);
  }

  return options;
}

function runGh(args) {
  return execFileSync("gh", args, {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

function readRepoIdentity() {
  const raw = runGh(["repo", "view", "--json", "owner,name"]);
  const parsed = JSON.parse(raw);
  return {
    owner: parsed.owner.login,
    repo: parsed.name,
  };
}

function readPullRequest(owner, repo, prNumber) {
  return JSON.parse(runGh(["api", `repos/${owner}/${repo}/pulls/${prNumber}`]));
}

function readIssueComments(owner, repo, prNumber) {
  return JSON.parse(
    runGh(["api", "--paginate", `repos/${owner}/${repo}/issues/${prNumber}/comments`]),
  );
}

function updateIssueComment(owner, repo, commentId, body) {
  runGh([
    "api",
    "-X",
    "PATCH",
    `repos/${owner}/${repo}/issues/comments/${commentId}`,
    "-f",
    `body=${body}`,
  ]);
}

function createIssueComment(owner, repo, prNumber, body) {
  runGh(["api", `repos/${owner}/${repo}/issues/${prNumber}/comments`, "-f", `body=${body}`]);
}

function dispatchWorkflow(workflowId, ref, prNumber) {
  runGh(["workflow", "run", workflowId, "--ref", ref, "-f", `pr_number=${prNumber}`]);
}

try {
  const options = parseArgs(process.argv.slice(2));
  const prNumber = Number(options.pr);
  const { owner, repo } = readRepoIdentity();
  const pr = readPullRequest(owner, repo, prNumber);
  const comments = readIssueComments(owner, repo, prNumber);
  const stateMarker = "<!-- codex-pr-fix-state -->";
  const stateComment = findStateComment(comments, stateMarker);
  const previousState = parseState(stateComment?.body || "", stateMarker);
  const headSha = options.headSha || pr.head.sha;
  const nextState = {
    ...previousState,
    enabled: previousState.enabled !== false,
    executor: "chatgpt_codex_connector",
    pr_number: pr.number,
    base_ref: pr.base.ref,
    head_ref: pr.head.ref,
    head_sha: headSha,
    status: options.status,
    last_requested_sha:
      options.status === "running" || options.status === "waiting_for_connector_fix"
        ? headSha
        : previousState.last_requested_sha || headSha,
    last_requested_at:
      options.status === "running" || options.status === "waiting_for_connector_fix"
        ? new Date().toISOString()
        : previousState.last_requested_at || "",
    last_result: options.lastResult || options.status,
    last_fix_completed_at:
      options.status === "running"
        ? previousState.last_fix_completed_at || ""
        : new Date().toISOString(),
    last_fixed_sha:
      options.fixedSha ||
      (options.status === "succeeded" || options.status === "no_changes"
        ? headSha
        : previousState.last_fixed_sha || ""),
    updated_at: new Date().toISOString(),
  };

  if (options.status === "running") {
    nextState.iteration = Number(previousState.iteration || 0) + 1;
  }

  const body = renderState(nextState, stateMarker);

  if (stateComment) {
    updateIssueComment(owner, repo, stateComment.id, body);
  } else {
    createIssueComment(owner, repo, prNumber, body);
  }

  if (options.refresh) {
    dispatchWorkflow("codex-pr-fix-status.yml", pr.head.ref, prNumber);
    dispatchWorkflow("pr-merge-readiness.yml", pr.head.ref, prNumber);
  }
} catch (error) {
  console.error(error.message);
  usage();
  process.exit(1);
}
