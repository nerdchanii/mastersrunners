const test = require("node:test");
const assert = require("node:assert/strict");

const {
  currentHeadReviewReady,
  findWorkflowRunPrNumber,
  normalizeLogin,
  parseControlCommand,
  parseState,
  reviewMatches,
} = require("./pr-autofix-state.cjs");

test("parseControlCommand recognizes refresh without changing fix/stop parsing", () => {
  assert.equal(parseControlCommand("/codex refresh"), "refresh");
  assert.equal(parseControlCommand("/codex fix"), "fix");
  assert.equal(parseControlCommand("/codex stop"), "stop");
  assert.equal(parseControlCommand("/codex noop"), "");
});

test("normalizeLogin removes a trailing bot suffix and lowercases the value", () => {
  assert.equal(normalizeLogin("Gemini-Code-Assist[bot]"), "gemini-code-assist");
  assert.equal(normalizeLogin("copilot-pull-request-reviewer"), "copilot-pull-request-reviewer");
  assert.equal(normalizeLogin(""), "");
});

test("reviewMatches accepts configured bot logins with or without the suffix", () => {
  const review = {
    user: {
      login: "gemini-code-assist[bot]",
      type: "Bot",
    },
    body: "review body",
  };

  assert.equal(reviewMatches(review, "gemini-code-assist", ""), true);
  assert.equal(reviewMatches(review, "gemini-code-assist[bot]", ""), true);
  assert.equal(reviewMatches(review, "copilot-pull-request-reviewer", ""), false);
});

test("currentHeadReviewReady still requires the current head SHA after login normalization", () => {
  const reviews = [
    {
      state: "COMMENTED",
      commit_id: "current-head",
      user: {
        login: "gemini-code-assist[bot]",
        type: "Bot",
      },
      body: "gemini review",
    },
    {
      state: "COMMENTED",
      commit_id: "older-head",
      user: {
        login: "copilot-pull-request-reviewer[bot]",
        type: "Bot",
      },
      body: "copilot review",
    },
  ];

  assert.equal(currentHeadReviewReady(reviews, "current-head", "gemini-code-assist", ""), true);
  assert.equal(
    currentHeadReviewReady(reviews, "current-head", "copilot-pull-request-reviewer", ""),
    false,
  );
  assert.equal(
    currentHeadReviewReady(reviews, "older-head", "copilot-pull-request-reviewer", ""),
    true,
  );
});

test("findWorkflowRunPrNumber prefers workflow_run pull request numbers and falls back to refs/pull/<n>/head", () => {
  assert.equal(
    findWorkflowRunPrNumber({
      pull_requests: [{ number: 7 }],
      head_branch: "refs/pull/99/head",
    }),
    7,
  );
  assert.equal(
    findWorkflowRunPrNumber({
      pull_requests: [],
      head_branch: "refs/pull/42/head",
    }),
    42,
  );
  assert.equal(
    findWorkflowRunPrNumber({
      pull_requests: [],
      head_branch: "task-i-0006-100-cloudflare-pages",
    }),
    null,
  );
});

test("parseState drops legacy copilot fields from persisted state comments", () => {
  const body = [
    "<!-- codex-pr-fix-state -->",
    "## Codex PR Auto-Fix State",
    "",
    "```json",
    JSON.stringify({
      status: "paused",
      gemini_review_ready: true,
      copilot_identity_configured: true,
      copilot_review_ready: true,
    }),
    "```",
  ].join("\n");

  const state = parseState(body, "<!-- codex-pr-fix-state -->");
  assert.equal(state.status, "paused");
  assert.equal(state.gemini_review_ready, true);
  assert.equal("copilot_identity_configured" in state, false);
  assert.equal("copilot_review_ready" in state, false);
});
