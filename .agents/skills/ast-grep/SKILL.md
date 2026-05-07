---
name: ast-grep
description: AST-aware code search and rewrite workflows using the ast-grep CLI (`sg`). Use when Codex needs to find or change structural code patterns such as function calls, imports, JSX props, class members, decorators, nested expressions, or language-aware refactors where plain text search with `rg` would be too broad or fragile. Also use when writing or testing ast-grep rule YAML, running `sg scan`, or initializing a repository with `sg new project` before ast-grep rule work.
---

# ast-grep

Use `ast-grep` for structure-aware code search and guarded rewrites. Keep `rg` as the first tool for plain text search; switch to `sg` when syntax shape matters.

## Workflow

1. Confirm `sg` is available with `sg --version`. If unavailable, report the missing CLI and do not invent fallback AST behavior.
2. Inspect whether the repo already has ast-grep config:
   - Look for `sgconfig.yml`, `sgconfig.yaml`, `ast-grep.yml`, or an existing `rules/` directory.
   - If rule-based scanning is needed and no config exists, initialize with `sg new project -y` from the repository root before creating rules.
3. Prefer one-shot `sg run` for exploratory searches. Use rule files and `sg scan` when the pattern will be repeated, tested, shared, or used for rewrites.
4. Scope searches tightly:
   - Pass explicit paths when possible.
   - Exclude generated/build output according to the repository's own rules.
   - Keep simple literal discovery in `rg`; use `sg` after identifying likely files or syntax.
5. Preview before changing code:
   - Run search-only commands first.
   - Review match count and representative matches.
   - Narrow the pattern if it captures unrelated code.
6. Apply rewrites in small, reviewable batches. After each rewrite, rerun the search to confirm the target pattern is gone or reduced as intended.
7. Run the project's relevant formatter, lint, typecheck, and tests for the touched area.

## Command Patterns

Common one-shot search:

```bash
sg run --lang ts -p 'console.log($$$ARGS)' apps packages
```

Common one-shot rewrite:

```bash
sg run --lang ts -p 'oldName($$$ARGS)' -r 'newName($$$ARGS)' src
```

Rule workflow:

```bash
sg new project -y
sg new rule my-rule --lang ts -y
sg scan
sg test
```

Use `references/patterns.md` for concrete pattern examples across TypeScript, React JSX, NestJS, and Python.

## Safety Rules

- Do not run broad rewrites from the repository root without first proving the match set.
- Do not edit generated output, vendored code, dependency directories, or build artifacts.
- Do not treat an AST match as proof of intent; inspect surrounding code before changing behavior.
- Prefer `sg scan` and `sg test` for reusable rules so future agents can verify the rule.
- If `sg new project -y` would add config files to a repo, mention it as part of the task change because it changes repository tooling.
