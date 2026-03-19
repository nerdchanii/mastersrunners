#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { summarizeReviewThreads } = require("../.github/scripts/pr-review-threads.cjs");
const { normalizeLogin, parsePositiveInt } = require("../.github/scripts/pr-autofix-state.cjs");

function usage() {
  console.error(
    "Usage: node scripts/export-pr-review-bundle.mjs [--pr <number>] [--reviewer <login>] [--out <path>]",
  );
}

function parseArgs(argv) {
  const options = {
    pr: "",
    reviewer: "",
    out: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--pr") {
      options.pr = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (token === "--reviewer") {
      options.reviewer = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (token === "--out") {
      options.out = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (token === "-h" || token === "--help") {
      usage();
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${token}`);
  }

  return options;
}

function runGh(args, input = "") {
  return execFileSync("gh", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    input,
  });
}

function resolvePrNumber(providedPr) {
  const parsed = parsePositiveInt(providedPr);
  if (parsed) {
    return parsed;
  }

  return Number(runGh(["pr", "view", "--json", "number", "--jq", ".number"]).trim());
}

function readRepoIdentity() {
  const raw = runGh(["repo", "view", "--json", "owner,name"]);
  const parsed = JSON.parse(raw);
  return {
    owner: parsed.owner.login,
    name: parsed.name,
  };
}

function loadPullRequestBundle(owner, repo, prNumber) {
  const query = `
    query($owner: String!, $name: String!, $number: Int!) {
      repository(owner: $owner, name: $name) {
        pullRequest(number: $number) {
          number
          title
          baseRefName
          headRefName
          headRefOid
          reviewThreads(first: 100) {
            nodes {
              id
              isResolved
              isOutdated
              path
              line
              originalLine
              diffSide
              comments(first: 20) {
                nodes {
                  id
                  body
                  publishedAt
                  path
                  line
                  originalLine
                  url
                  author {
                    login
                  }
                  pullRequestReview {
                    state
                    author {
                      login
                    }
                  }
                  commit {
                    oid
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const raw = runGh([
    "api",
    "graphql",
    "-f",
    `owner=${owner}`,
    "-f",
    `name=${repo}`,
    "-F",
    `number=${prNumber}`,
    "-f",
    `query=${query}`,
  ]);

  const parsed = JSON.parse(raw);
  return parsed.data.repository.pullRequest;
}

function filterThreadsByReviewer(threads, reviewer) {
  if (!reviewer) {
    return threads;
  }

  const expected = normalizeLogin(reviewer);
  return threads.filter((thread) => normalizeLogin(thread.reviewer) === expected);
}

function writeOutput(path, text) {
  if (!path) {
    process.stdout.write(text);
    return;
  }

  process.stderr.write(`Wrote review bundle to ${path}\n`);
  fs.writeFileSync(path, text, "utf8");
}

try {
  const options = parseArgs(process.argv.slice(2));
  const prNumber = resolvePrNumber(options.pr);
  const { owner, name } = readRepoIdentity();
  const pullRequest = loadPullRequestBundle(owner, name, prNumber);
  const summary = summarizeReviewThreads(pullRequest.reviewThreads.nodes || []);

  const actionableThreads = filterThreadsByReviewer(summary.actionableThreads, options.reviewer);
  const staleThreads = filterThreadsByReviewer(summary.staleThreads, options.reviewer);

  const bundle = {
    pr: pullRequest.number,
    title: pullRequest.title,
    baseRef: pullRequest.baseRefName,
    headRef: pullRequest.headRefName,
    headSha: pullRequest.headRefOid,
    threads: actionableThreads.map((thread) => ({
      threadId: thread.threadId,
      path: thread.path,
      line: thread.line,
      originalLine: thread.originalLine,
      diffSide: thread.diffSide,
      reviewer: thread.reviewer,
      body: thread.body,
      suggestions: thread.suggestions,
      isActionable: thread.isActionable,
      comments: thread.comments,
    })),
    staleThreads: staleThreads.map((thread) => ({
      threadId: thread.threadId,
      path: thread.path,
      line: thread.line,
      originalLine: thread.originalLine,
      diffSide: thread.diffSide,
      reviewer: thread.reviewer,
      body: thread.body,
      suggestions: thread.suggestions,
      isActionable: thread.isActionable,
      comments: thread.comments,
    })),
  };

  writeOutput(options.out, `${JSON.stringify(bundle, null, 2)}\n`);
} catch (error) {
  console.error(error.message);
  usage();
  process.exit(1);
}
