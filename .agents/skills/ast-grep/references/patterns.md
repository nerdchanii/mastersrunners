# ast-grep Pattern Examples

These examples are starting points. Always run search-only first, inspect matches, and narrow paths before rewriting.

Pattern examples are split by language under `patterns/`:

- `patterns/ts-js.md`: TypeScript and JavaScript call, import, and object-literal patterns
- `patterns/react.md`: React JSX props and hooks, plus NestJS decorator patterns
- `patterns/yaml.md`: rule YAML shape and the `sg scan` / `sg test` loop

Python examples were dropped on purpose. This monorepo has no Python application code.

## Choosing Metavariables

- Use `$NAME` for a single AST node.
- Use `$$$ARGS`, `$$$PROPS`, or `$$$BODY` for zero or more nodes.
- Use descriptive metavariable names so rewrites are readable.
- If a pattern fails unexpectedly, simplify it to the smallest matching shape, then add constraints back.
