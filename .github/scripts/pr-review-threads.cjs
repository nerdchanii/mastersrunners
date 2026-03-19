function extractSuggestionBlocks(body = "") {
  const suggestions = [];
  const pattern = /```suggestion\n([\s\S]*?)\n```/g;
  let match = pattern.exec(body);
  while (match) {
    suggestions.push(match[1]);
    match = pattern.exec(body);
  }
  return suggestions;
}

function normalizeThreadComment(comment = {}) {
  return {
    id: comment.id || "",
    body: comment.body || "",
    author: comment.author?.login || "",
    published_at: comment.publishedAt || "",
    path: comment.path || "",
    line: comment.line ?? null,
    original_line: comment.originalLine ?? null,
    url: comment.url || "",
    review_state: comment.pullRequestReview?.state || "",
    review_author: comment.pullRequestReview?.author?.login || "",
    commit_oid: comment.commit?.oid || "",
    suggestions: extractSuggestionBlocks(comment.body || ""),
  };
}

function selectThreadReviewer(comments = []) {
  const reviewComment =
    comments.find((comment) => comment.review_author) || comments.find((comment) => comment.author);
  return reviewComment?.review_author || reviewComment?.author || "";
}

function selectThreadBody(comments = [], reviewer = "") {
  if (!reviewer) {
    return comments[comments.length - 1]?.body || "";
  }

  for (let index = comments.length - 1; index >= 0; index -= 1) {
    const comment = comments[index];
    const author = comment.review_author || comment.author;
    if (author === reviewer && comment.body) {
      return comment.body;
    }
  }

  return comments[comments.length - 1]?.body || "";
}

function normalizeReviewThread(thread = {}) {
  const comments = Array.isArray(thread.comments?.nodes)
    ? thread.comments.nodes.map(normalizeThreadComment)
    : [];
  const reviewer = selectThreadReviewer(comments);

  return {
    threadId: thread.id || "",
    path: thread.path || "",
    line: thread.line ?? null,
    originalLine: thread.originalLine ?? null,
    diffSide: thread.diffSide || "",
    isResolved: Boolean(thread.isResolved),
    isOutdated: Boolean(thread.isOutdated),
    reviewer,
    body: selectThreadBody(comments, reviewer),
    suggestions: comments.flatMap((comment) => comment.suggestions || []),
    comments,
    isActionable: !thread.isResolved && !thread.isOutdated,
  };
}

function summarizeReviewThreads(threads = []) {
  const normalized = threads.map(normalizeReviewThread);
  const actionableThreads = normalized.filter((thread) => thread.isActionable);
  const staleThreads = normalized.filter((thread) => !thread.isResolved && thread.isOutdated);
  const resolvedThreads = normalized.filter((thread) => thread.isResolved);

  return {
    actionableThreads,
    actionableOpenThreadCount: actionableThreads.length,
    staleThreads,
    staleOpenThreadCount: staleThreads.length,
    resolvedThreads,
    allThreads: normalized,
  };
}

module.exports = {
  extractSuggestionBlocks,
  normalizeReviewThread,
  normalizeThreadComment,
  selectThreadBody,
  selectThreadReviewer,
  summarizeReviewThreads,
};
