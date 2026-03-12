const TASK_SCOPE_PATTERN = /^I-\d{4}(?:-\d{3})?$/;

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "refactor", "docs", "test", "ci", "build", "perf", "revert"],
    ],
    "scope-empty": [2, "never"],
    "subject-empty": [2, "never"],
    "header-max-length": [2, "always", 100],
    "scope-not-task-id": [2, "always"],
  },
  plugins: [
    {
      rules: {
        "scope-not-task-id": (parsed) => {
          if (!parsed.scope || !TASK_SCOPE_PATTERN.test(parsed.scope)) {
            return [true];
          }

          return [
            false,
            "commit scope must describe a technical boundary, not a task ID; move task linkage to trailers",
          ];
        },
      },
    },
  ],
};
