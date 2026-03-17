const fs = require("fs");

const { findReadinessComment, parseReadinessState } = require("../pr-merge-readiness.cjs");

const marker = process.argv[2] || "";

try {
  const comments = JSON.parse(fs.readFileSync(0, "utf8"));
  const comment = findReadinessComment(comments, marker);
  if (!comment) {
    process.exit(2);
  }

  const state = parseReadinessState(comment.body, marker);
  process.stdout.write(JSON.stringify(state));
} catch (error) {
  console.error(error);
  process.exit(1);
}
