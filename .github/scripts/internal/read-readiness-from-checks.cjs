const fs = require("fs");

const { extractReadinessJsonString } = require("../pr-merge-readiness.cjs");

try {
  const payload = JSON.parse(fs.readFileSync(0, "utf8"));
  const checkRuns = Array.isArray(payload.check_runs) ? payload.check_runs : [];
  const readinessRun = [...checkRuns]
    .filter((entry) => entry.name === "PR Merge Readiness")
    .sort((left, right) => Number(right.id || 0) - Number(left.id || 0))[0];

  if (!readinessRun) {
    process.exit(4);
  }

  const summary = readinessRun.output?.summary || "";
  const jsonString = extractReadinessJsonString(summary);
  if (!jsonString) {
    process.exit(5);
  }

  process.stdout.write(jsonString);
} catch (error) {
  console.error(error);
  process.exit(1);
}
