const test = require("node:test");
const assert = require("node:assert/strict");

const {
  extractSuggestionBlocks,
  normalizeReviewThread,
  selectThreadBody,
  selectThreadReviewer,
  summarizeReviewThreads,
} = require("./pr-review-threads.cjs");

test("extractSuggestionBlocks returns literal suggestion bodies in order", () => {
  const body = [
    "Please change this.",
    "```suggestion",
    "const first = true;",
    "```",
    "",
    "```suggestion",
    "const second = false;",
    "```",
  ].join("\n");

  assert.deepEqual(extractSuggestionBlocks(body), ["const first = true;", "const second = false;"]);
});

test("normalizeReviewThread derives actionable thread metadata and suggestions", () => {
  const thread = normalizeReviewThread({
    id: "PRRT_1",
    isResolved: false,
    isOutdated: false,
    path: "scripts/merge-dev-pr.sh",
    line: 99,
    originalLine: 138,
    diffSide: "RIGHT",
    comments: {
      nodes: [
        {
          id: "PRRC_1",
          body: "Please simplify.\n\n```suggestion\nconst next = value ?? fallback;\n```",
          author: { login: "gemini-code-assist" },
          path: "scripts/merge-dev-pr.sh",
          line: 99,
          originalLine: 138,
          url: "https://example.com/comment",
          pullRequestReview: {
            state: "COMMENTED",
            author: { login: "gemini-code-assist" },
          },
          commit: { oid: "head-sha" },
        },
      ],
    },
  });

  assert.equal(thread.threadId, "PRRT_1");
  assert.equal(thread.reviewer, "gemini-code-assist");
  assert.equal(thread.isActionable, true);
  assert.deepEqual(thread.suggestions, ["const next = value ?? fallback;"]);
});

test("thread reviewer and body stay pinned to the review author after owner replies", () => {
  const comments = [
    {
      id: "PRRC_review",
      body: "Please simplify.\n\n```suggestion\nconst next = value ?? fallback;\n```",
      author: "gemini-code-assist",
      review_author: "gemini-code-assist",
      suggestions: ["const next = value ?? fallback;"],
    },
    {
      id: "PRRC_reply",
      body: "Applied in the current head.",
      author: "nerdchanii",
      review_author: "",
      suggestions: [],
    },
  ];

  assert.equal(selectThreadReviewer(comments), "gemini-code-assist");
  assert.equal(
    selectThreadBody(comments, "gemini-code-assist"),
    "Please simplify.\n\n```suggestion\nconst next = value ?? fallback;\n```",
  );

  const thread = normalizeReviewThread({
    id: "PRRT_owner_reply",
    isResolved: false,
    isOutdated: false,
    path: "scripts/merge-dev-pr.sh",
    comments: {
      nodes: [
        {
          id: "PRRC_review",
          body: comments[0].body,
          author: { login: comments[0].author },
          pullRequestReview: {
            state: "COMMENTED",
            author: { login: comments[0].review_author },
          },
          commit: { oid: "head-sha" },
        },
        {
          id: "PRRC_reply",
          body: comments[1].body,
          author: { login: comments[1].author },
          commit: { oid: "head-sha" },
        },
      ],
    },
  });

  assert.equal(thread.reviewer, "gemini-code-assist");
  assert.equal(thread.body, comments[0].body);
  assert.deepEqual(thread.suggestions, ["const next = value ?? fallback;"]);
});

test("summarizeReviewThreads separates actionable and stale open threads", () => {
  const summary = summarizeReviewThreads([
    {
      id: "PRRT_actionable",
      isResolved: false,
      isOutdated: false,
      path: "a.ts",
      comments: { nodes: [] },
    },
    {
      id: "PRRT_stale",
      isResolved: false,
      isOutdated: true,
      path: "b.ts",
      comments: { nodes: [] },
    },
    {
      id: "PRRT_resolved",
      isResolved: true,
      isOutdated: false,
      path: "c.ts",
      comments: { nodes: [] },
    },
  ]);

  assert.equal(summary.actionableOpenThreadCount, 1);
  assert.equal(summary.staleOpenThreadCount, 1);
  assert.equal(summary.actionableThreads[0].threadId, "PRRT_actionable");
  assert.equal(summary.staleThreads[0].threadId, "PRRT_stale");
  assert.equal(summary.resolvedThreads[0].threadId, "PRRT_resolved");
});
