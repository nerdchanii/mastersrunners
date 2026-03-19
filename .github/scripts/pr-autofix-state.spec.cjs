const test = require("node:test");
const assert = require("node:assert/strict");

const {
  currentHeadReviewReady,
  normalizeLogin,
  parsePositiveInt,
  parseControlCommand,
  parseState,
  reviewMatches,
} = require("./pr-autofix-state.cjs");

test("parseControlCommand recognizes refresh without changing fix/stop parsing", () => {
  assert.equal(parseControlCommand("/codex refresh"), "refresh");
  assert.equal(parseControlCommand("/codex fix"), "fix");
  assert.equal(parseControlCommand("/codex skip"), "skip");
  assert.equal(parseControlCommand("/codex stop"), "stop");
  assert.equal(parseControlCommand("/codex noop"), "");
});

test("normalizeLogin removes a trailing bot suffix and lowercases the value", () => {
  assert.equal(normalizeLogin("Gemini-Code-Assist[bot]"), "gemini-code-assist");
  assert.equal(normalizeLogin("copilot-pull-request-reviewer"), "copilot-pull-request-reviewer");
  assert.equal(normalizeLogin(""), "");
});

test("parsePositiveInt accepts trimmed positive integers only", () => {
  assert.equal(parsePositiveInt("9"), 9);
  assert.equal(parsePositiveInt(" 42 "), 42);
  assert.equal(parsePositiveInt("#9"), null);
  assert.equal(parsePositiveInt("abc"), null);
  assert.equal(parsePositiveInt("0"), null);
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

test("parseState drops legacy copilot fields from persisted state comments", () => {
  const body = [
    "<!-- codex-pr-fix-state -->",
    "## Codex PR Execution State",
    "",
    "```json",
    JSON.stringify({
      status: "waiting_for_connector_fix",
      gemini_review_ready: true,
      copilot_identity_configured: true,
      copilot_review_ready: true,
    }),
    "```",
  ].join("\n");

  const state = parseState(body, "<!-- codex-pr-fix-state -->");
  assert.equal(state.status, "waiting_for_connector_fix");
  assert.equal(state.gemini_review_ready, true);
  assert.equal("copilot_identity_configured" in state, false);
  assert.equal("copilot_review_ready" in state, false);
});
