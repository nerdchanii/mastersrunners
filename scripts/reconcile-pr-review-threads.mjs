#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { parsePositiveInt } = require("../.github/scripts/pr-autofix-state.cjs");

function usage() {
  console.error(
    "Usage: node scripts/reconcile-pr-review-threads.mjs --input <manifest.json> [--dry-run]",
  );
}

function parseArgs(argv) {
  const options = {
    input: "",
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--input") {
      options.input = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (token === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (token === "-h" || token === "--help") {
      usage();
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${token}`);
  }

  if (!options.input) {
    throw new Error("--input is required.");
  }

  return options;
}

function runGh(args) {
  return execFileSync("gh", args, {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

function readManifest(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function validateManifest(manifest) {
  if (!parsePositiveInt(manifest.pr)) {
    throw new Error("Manifest must include a positive integer pr.");
  }
  if (!manifest.headSha) {
    throw new Error("Manifest must include headSha.");
  }
  if (!Array.isArray(manifest.threads)) {
    throw new Error("Manifest must include threads[].");
  }
}

function graphql(query, fields) {
  const args = ["api", "graphql", "-f", `query=${query}`];
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === "number") {
      args.push("-F", `${key}=${value}`);
    } else {
      args.push("-f", `${key}=${value}`);
    }
  }
  return runGh(args);
}

function addReply(threadId, body, dryRun) {
  if (!body) {
    return;
  }
  const query = `
    mutation($threadId: ID!, $body: String!) {
      addPullRequestReviewThreadReply(input: { pullRequestReviewThreadId: $threadId, body: $body }) {
        comment {
          id
          url
        }
      }
    }
  `;
  if (dryRun) {
    console.log(JSON.stringify({ action: "reply", threadId, body }, null, 2));
    return;
  }
  graphql(query, { threadId, body });
}

function resolveThread(threadId, dryRun) {
  const query = `
    mutation($threadId: ID!) {
      resolveReviewThread(input: { threadId: $threadId }) {
        thread {
          id
          isResolved
        }
      }
    }
  `;
  if (dryRun) {
    console.log(JSON.stringify({ action: "resolve", threadId }, null, 2));
    return;
  }
  graphql(query, { threadId });
}

try {
  const options = parseArgs(process.argv.slice(2));
  const manifest = readManifest(options.input);
  validateManifest(manifest);

  for (const thread of manifest.threads) {
    if (!thread.threadId) {
      throw new Error("Each manifest thread requires threadId.");
    }

    if (thread.disposition !== "resolved" && thread.disposition !== "open") {
      throw new Error(`Unsupported disposition for ${thread.threadId}: ${thread.disposition}`);
    }

    if (thread.replyBody) {
      addReply(thread.threadId, thread.replyBody, options.dryRun);
    }

    if (thread.disposition === "resolved") {
      resolveThread(thread.threadId, options.dryRun);
    }
  }
} catch (error) {
  console.error(error.message);
  usage();
  process.exit(1);
}
