function createEmptyState() {
  return {
    status: "unknown",
    iteration: 0,
    max_iterations: 5,
    head_sha: "",
    last_requested_sha: "",
    last_request_id: "",
    last_requested_at: "",
    last_result: "idle",
    last_fix_completed_at: "",
    last_fixed_sha: "",
    gemini_review_ready: false,
  };
}

function parseControlCommand(body) {
  const normalized = (body || "").trim();
  if (normalized === "/codex stop") {
    return "stop";
  }
  if (normalized === "/codex refresh") {
    return "refresh";
  }
  if (normalized === "/codex fix") {
    return "fix";
  }
  return "";
}

function isTrustedStateComment(comment, stateMarker) {
  return Boolean(
    comment?.body?.includes(stateMarker) && comment.user?.login === "github-actions[bot]",
  );
}

function findStateComment(comments, stateMarker) {
  return comments.find((comment) => isTrustedStateComment(comment, stateMarker));
}

function parseState(body, stateMarker) {
  const empty = createEmptyState();

  if (!body || !body.includes(stateMarker)) {
    return empty;
  }

  const match = body.match(/```json\n([\s\S]*?)\n```/);
  if (!match) {
    return empty;
  }

  try {
    return { ...empty, ...JSON.parse(match[1]) };
  } catch {
    return empty;
  }
}

function renderState(state, stateMarker) {
  return [
    stateMarker,
    "## Codex PR Auto-Fix State",
    "",
    "```json",
    JSON.stringify(state, null, 2),
    "```",
  ].join("\n");
}

function normalizeLogin(login) {
  return (login || "")
    .trim()
    .toLowerCase()
    .replace(/\[bot\]$/, "");
}

function reviewMatches(review, login, marker) {
  const author = normalizeLogin(review.user?.login || "");
  const expected = normalizeLogin(login);
  const body = review.body || "";
  if (expected && author === expected) {
    return true;
  }
  if (expected) {
    return false;
  }
  if (marker && body.includes(marker) && review.user?.type === "Bot") {
    return true;
  }
  return false;
}

function findWorkflowRunPrNumber(workflowRun) {
  const directNumber = workflowRun?.pull_requests?.find((pullRequest) =>
    Number.isInteger(pullRequest?.number),
  )?.number;
  if (directNumber) {
    return directNumber;
  }

  const headBranch = workflowRun?.head_branch || "";
  const match = headBranch.match(/^refs\/pull\/(\d+)\/head$/);
  if (!match) {
    return null;
  }

  return Number(match[1]);
}

function currentHeadReviewReady(reviews, headSha, login, marker) {
  if (!login && !marker) {
    return false;
  }

  return reviews.some((review) => {
    if (review.state === "DISMISSED") {
      return false;
    }
    if (review.commit_id !== headSha) {
      return false;
    }
    return reviewMatches(review, login, marker);
  });
}

function latestCommand(comments) {
  const allowedAssociations = new Set(["OWNER"]);
  const filtered = comments
    .filter((comment) => comment.body)
    .filter((comment) => comment.user?.login !== "github-actions[bot]")
    .filter((comment) => allowedAssociations.has(comment.author_association))
    .filter((comment) => parseControlCommand(comment.body))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const latest = filtered[0];
  if (!latest) {
    return "";
  }
  return parseControlCommand(latest.body);
}

function isQueuedRequestStale(state, headSha, staleMinutes, now = new Date()) {
  if (!state.last_requested_sha || state.last_requested_sha !== headSha) {
    return false;
  }
  if (state.last_result !== "queued") {
    return false;
  }

  const timestamp = state.last_requested_at || state.updated_at || "";
  if (!timestamp) {
    return true;
  }

  const requestedAt = new Date(timestamp);
  if (Number.isNaN(requestedAt.getTime())) {
    return true;
  }

  return now.getTime() - requestedAt.getTime() > staleMinutes * 60 * 1000;
}

module.exports = {
  createEmptyState,
  findStateComment,
  findWorkflowRunPrNumber,
  currentHeadReviewReady,
  isQueuedRequestStale,
  isTrustedStateComment,
  latestCommand,
  normalizeLogin,
  parseControlCommand,
  parseState,
  renderState,
  reviewMatches,
};
