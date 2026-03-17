const { currentHeadReviewReady } = require("./pr-autofix-state.cjs");

function createEmptyReadinessState() {
  return {
    status: "unknown",
    reason: "",
    merge_allowed: false,
    pr_number: 0,
    base_ref: "",
    head_ref: "",
    head_sha: "",
    gemini_identity_configured: false,
    gemini_review_ready: false,
    connector_enabled: false,
    connector_status: "unknown",
    last_result: "idle",
    last_requested_sha: "",
    last_fixed_sha: "",
    last_skip_sha: "",
    last_stop_sha: "",
    actionable_open_thread_count: 0,
    stale_open_thread_count: 0,
    updated_at: "",
  };
}

function isTrustedReadinessComment(comment, stateMarker) {
  return Boolean(
    comment?.body?.includes(stateMarker) && comment.user?.login === "github-actions[bot]",
  );
}

function findReadinessComment(comments, stateMarker) {
  for (let index = comments.length - 1; index >= 0; index -= 1) {
    if (isTrustedReadinessComment(comments[index], stateMarker)) {
      return comments[index];
    }
  }

  return undefined;
}

function parseReadinessState(body, stateMarker) {
  const empty = createEmptyReadinessState();

  if (!body || !body.includes(stateMarker)) {
    return empty;
  }

  const jsonString = extractReadinessJsonString(body);
  if (!jsonString) {
    return empty;
  }

  try {
    return { ...empty, ...JSON.parse(jsonString) };
  } catch (error) {
    console.error(`[pr-merge-readiness] Failed to parse readiness state: ${error.message}`);
    return empty;
  }
}

function extractReadinessJsonString(body) {
  if (!body) {
    return null;
  }

  const match = body.match(/```json\n([\s\S]*?)\n```/);
  return match ? match[1] : null;
}

function renderReadinessState(state, stateMarker) {
  return [stateMarker, "## PR Merge Readiness", "", renderReadinessStateBlock(state)].join("\n");
}

function renderReadinessStateBlock(state) {
  return ["```json", JSON.stringify(state, null, 2), "```"].join("\n");
}

function deriveMergeReadiness({
  ownerRepoFullName,
  pr,
  reviews,
  executionState,
  reviewThreadSummary,
  geminiLogin,
  geminiMarker,
  headBranchProtected = false,
}) {
  const empty = createEmptyReadinessState();
  const headSha = pr.head.sha;
  const geminiIdentityConfigured = Boolean(geminiLogin || geminiMarker);
  const geminiReviewReady =
    geminiIdentityConfigured && currentHeadReviewReady(reviews, headSha, geminiLogin, geminiMarker);
  const sameRepo = pr.head.repo.full_name === ownerRepoFullName;
  const sharedHeadBranch = ["main", "dev"].includes(pr.head.ref) || headBranchProtected;
  const skipForHead = executionState.last_skip_sha === headSha;
  const stopForHead = executionState.last_stop_sha === headSha;
  const lastRequestedForHead = executionState.last_requested_sha === headSha;
  const lastFixedForHead = executionState.last_fixed_sha === headSha;
  const connectorStatus = executionState.status || "unknown";
  const lastResult = executionState.last_result || "idle";
  const actionableOpenThreadCount = Number(reviewThreadSummary?.actionableOpenThreadCount || 0);
  const staleOpenThreadCount = Number(reviewThreadSummary?.staleOpenThreadCount || 0);

  let status = "blocked";
  let reason = "unknown";

  if (pr.base.ref !== "dev") {
    reason = "not_dev";
  } else if (!sameRepo) {
    reason = "fork_blocked";
  } else if (pr.author_association !== "OWNER") {
    reason = "untrusted_pr_author";
  } else if (sharedHeadBranch) {
    reason = "protected_or_shared_head_branch";
  } else if (!geminiIdentityConfigured) {
    reason = "gemini_identity_not_configured";
  } else if (!geminiReviewReady) {
    if (lastFixedForHead && lastResult === "succeeded") {
      status = "waiting_for_post_fix_review";
      reason = "current_head_was_created_by_connector";
    } else {
      status = "waiting_for_gemini_review";
      reason = "no_current_head_gemini_review";
    }
  } else if (connectorStatus === "running" && lastRequestedForHead) {
    status = "connector_fix_running";
    reason = "connector_fix_running";
  } else if (actionableOpenThreadCount === 0) {
    status = "ready_to_merge";
    reason = skipForHead ? "explicit_skip_with_clean_threads" : "current_head_threads_clean";
  } else if (skipForHead) {
    status = "waiting_for_thread_resolution";
    reason = "current_head_threads_still_open";
  } else if (stopForHead || ["failed", "retry_required", "paused"].includes(connectorStatus)) {
    status = "waiting_for_fix_or_skip_resolution";
    reason = stopForHead
      ? "connector_fix_stopped_for_current_head"
      : "connector_fix_needs_resolution";
  } else if (["succeeded", "no_changes"].includes(connectorStatus)) {
    status = "waiting_for_thread_resolution";
    reason = "current_head_threads_still_open";
  } else {
    status = "waiting_for_connector_fix";
    reason = "awaiting_connector_fix_for_current_head";
  }

  return {
    ...empty,
    status,
    reason,
    merge_allowed: status === "ready_to_merge",
    pr_number: pr.number,
    base_ref: pr.base.ref,
    head_ref: pr.head.ref,
    head_sha: headSha,
    gemini_identity_configured: geminiIdentityConfigured,
    gemini_review_ready: geminiReviewReady,
    connector_enabled: Boolean(executionState.enabled),
    connector_status: connectorStatus,
    last_result: lastResult,
    last_requested_sha: executionState.last_requested_sha || "",
    last_fixed_sha: executionState.last_fixed_sha || "",
    last_skip_sha: executionState.last_skip_sha || "",
    last_stop_sha: executionState.last_stop_sha || "",
    actionable_open_thread_count: actionableOpenThreadCount,
    stale_open_thread_count: staleOpenThreadCount,
    updated_at: new Date().toISOString(),
  };
}

module.exports = {
  createEmptyReadinessState,
  deriveMergeReadiness,
  extractReadinessJsonString,
  findReadinessComment,
  isTrustedReadinessComment,
  parseReadinessState,
  renderReadinessState,
  renderReadinessStateBlock,
};
