function createEmptyState() {
  return {
    status: "unknown",
    enabled: false,
    executor: "chatgpt_codex_connector",
    iteration: 0,
    max_iterations: 5,
    head_sha: "",
    last_requested_sha: "",
    last_requested_at: "",
    last_result: "idle",
    last_fix_completed_at: "",
    last_fixed_sha: "",
    last_skip_sha: "",
    last_stop_sha: "",
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
  if (normalized === "/codex skip") {
    return "skip";
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
    const parsed = { ...empty, ...JSON.parse(match[1]) };
    delete parsed.copilot_identity_configured;
    delete parsed.copilot_review_ready;
    return parsed;
  } catch {
    return empty;
  }
}

function renderState(state, stateMarker) {
  return [
    stateMarker,
    "## Codex PR Execution State",
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

function parsePositiveInt(value) {
  const normalized = String(value ?? "").trim();
  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
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

module.exports = {
  createEmptyState,
  findStateComment,
  currentHeadReviewReady,
  isTrustedStateComment,
  latestCommand,
  normalizeLogin,
  parsePositiveInt,
  parseControlCommand,
  parseState,
  renderState,
  reviewMatches,
};
