const test = require("node:test");
const assert = require("node:assert/strict");

const {
  deriveMergeReadiness,
  extractReadinessJsonString,
  parseReadinessState,
  renderReadinessStateBlock,
} = require("./pr-merge-readiness.cjs");

function createPr(overrides = {}) {
  return {
    number: 14,
    author_association: "OWNER",
    base: { ref: "dev" },
    head: {
      ref: "task-branch",
      sha: "current-head",
      repo: {
        full_name: "nerdchanii/mastersrunners",
      },
    },
    ...overrides,
  };
}

function createAutofixState(overrides = {}) {
  return {
    status: "waiting_for_connector_fix",
    enabled: true,
    last_result: "idle",
    last_requested_sha: "",
    last_fixed_sha: "",
    last_skip_sha: "",
    last_stop_sha: "",
    ...overrides,
  };
}

function createThreadSummary(overrides = {}) {
  return {
    actionableOpenThreadCount: 1,
    staleOpenThreadCount: 0,
    ...overrides,
  };
}

function createGeminiReview(commitId = "current-head") {
  return {
    state: "COMMENTED",
    commit_id: commitId,
    user: {
      login: "gemini-code-assist[bot]",
      type: "Bot",
    },
    body: "Gemini review",
  };
}

test("readiness waits for an actual current-head Gemini review", () => {
  const state = deriveMergeReadiness({
    ownerRepoFullName: "nerdchanii/mastersrunners",
    pr: createPr(),
    reviews: [],
    executionState: createAutofixState(),
    reviewThreadSummary: createThreadSummary(),
    geminiLogin: "gemini-code-assist",
    geminiMarker: "",
  });

  assert.equal(state.status, "waiting_for_gemini_review");
  assert.equal(state.merge_allowed, false);
});

test("summary-only situations still wait for review because only reviews count", () => {
  const state = deriveMergeReadiness({
    ownerRepoFullName: "nerdchanii/mastersrunners",
    pr: createPr(),
    reviews: [createGeminiReview("older-head")],
    executionState: createAutofixState(),
    reviewThreadSummary: createThreadSummary(),
    geminiLogin: "gemini-code-assist",
    geminiMarker: "",
  });

  assert.equal(state.status, "waiting_for_gemini_review");
  assert.equal(state.reason, "no_current_head_gemini_review");
});

test("readiness waits for connector execution when actionable threads remain open", () => {
  const state = deriveMergeReadiness({
    ownerRepoFullName: "nerdchanii/mastersrunners",
    pr: createPr(),
    reviews: [createGeminiReview()],
    executionState: createAutofixState(),
    reviewThreadSummary: createThreadSummary(),
    geminiLogin: "gemini-code-assist",
    geminiMarker: "",
  });

  assert.equal(state.status, "waiting_for_connector_fix");
});

test("readiness reports running connector execution for the current head", () => {
  const state = deriveMergeReadiness({
    ownerRepoFullName: "nerdchanii/mastersrunners",
    pr: createPr(),
    reviews: [createGeminiReview()],
    executionState: createAutofixState({
      status: "running",
      last_requested_sha: "current-head",
    }),
    reviewThreadSummary: createThreadSummary(),
    geminiLogin: "gemini-code-assist",
    geminiMarker: "",
  });

  assert.equal(state.status, "connector_fix_running");
});

test("readiness waits for post-fix review when current head came from connector work", () => {
  const pr = createPr({
    head: {
      ref: "task-branch",
      sha: "fixed-head",
      repo: {
        full_name: "nerdchanii/mastersrunners",
      },
    },
  });

  const state = deriveMergeReadiness({
    ownerRepoFullName: "nerdchanii/mastersrunners",
    pr,
    reviews: [],
    executionState: createAutofixState({
      status: "succeeded",
      last_result: "succeeded",
      last_fixed_sha: "fixed-head",
    }),
    reviewThreadSummary: createThreadSummary({
      actionableOpenThreadCount: 0,
    }),
    geminiLogin: "gemini-code-assist",
    geminiMarker: "",
  });

  assert.equal(state.status, "waiting_for_post_fix_review");
});

test("readiness still waits for thread resolution after explicit skip when actionable threads stay open", () => {
  const state = deriveMergeReadiness({
    ownerRepoFullName: "nerdchanii/mastersrunners",
    pr: createPr(),
    reviews: [createGeminiReview()],
    executionState: createAutofixState({
      status: "paused",
      enabled: false,
      last_skip_sha: "current-head",
    }),
    reviewThreadSummary: createThreadSummary(),
    geminiLogin: "gemini-code-assist",
    geminiMarker: "",
  });

  assert.equal(state.status, "waiting_for_thread_resolution");
  assert.equal(state.merge_allowed, false);
});

test("readiness becomes merge-ready after explicit skip when threads are clean", () => {
  const state = deriveMergeReadiness({
    ownerRepoFullName: "nerdchanii/mastersrunners",
    pr: createPr(),
    reviews: [createGeminiReview()],
    executionState: createAutofixState({
      status: "paused",
      enabled: false,
      last_skip_sha: "current-head",
    }),
    reviewThreadSummary: createThreadSummary({
      actionableOpenThreadCount: 0,
    }),
    geminiLogin: "gemini-code-assist",
    geminiMarker: "",
  });

  assert.equal(state.status, "ready_to_merge");
  assert.equal(state.reason, "explicit_skip_with_clean_threads");
});

test("readiness blocks forked or shared-branch PRs", () => {
  const forkedState = deriveMergeReadiness({
    ownerRepoFullName: "nerdchanii/mastersrunners",
    pr: createPr({
      head: {
        ref: "task-branch",
        sha: "current-head",
        repo: {
          full_name: "someone-else/mastersrunners",
        },
      },
    }),
    reviews: [createGeminiReview()],
    executionState: createAutofixState(),
    reviewThreadSummary: createThreadSummary(),
    geminiLogin: "gemini-code-assist",
    geminiMarker: "",
  });

  assert.equal(forkedState.status, "blocked");
  assert.equal(forkedState.reason, "fork_blocked");
});

test("parseReadinessState reads machine state comments", () => {
  const body = [
    "<!-- pr-merge-readiness-state -->",
    "## PR Merge Readiness",
    "",
    "```json",
    JSON.stringify({
      status: "ready_to_merge",
      merge_allowed: true,
      head_sha: "abc123",
      actionable_open_thread_count: 0,
    }),
    "```",
  ].join("\n");

  const state = parseReadinessState(body, "<!-- pr-merge-readiness-state -->");
  assert.equal(state.status, "ready_to_merge");
  assert.equal(state.merge_allowed, true);
  assert.equal(state.head_sha, "abc123");
});

test("extractReadinessJsonString returns the raw JSON payload from a readiness comment", () => {
  const body = [
    "<!-- pr-merge-readiness-state -->",
    "## PR Merge Readiness",
    "",
    "```json",
    JSON.stringify({
      status: "waiting_for_connector_fix",
      actionable_open_thread_count: 2,
      merge_allowed: false,
    }),
    "```",
  ].join("\n");

  const jsonString = extractReadinessJsonString(body);
  assert.match(jsonString, /"status":"waiting_for_connector_fix"/);
  assert.match(jsonString, /"merge_allowed":false/);
});

test("renderReadinessStateBlock produces a reusable fenced JSON block", () => {
  const block = renderReadinessStateBlock({
    status: "waiting_for_gemini_review",
    merge_allowed: false,
  });

  assert.match(block, /^```json\n/);
  assert.match(block, /"status": "waiting_for_gemini_review"/);
  assert.match(block, /\n```$/);
});
