# ast-grep Pattern Examples

These examples are starting points. Always run search-only first, inspect matches, and narrow paths before rewriting.

## TypeScript and JavaScript

Find `console.log(...)` calls:

```bash
sg run --lang ts -p 'console.log($$$ARGS)' apps packages
```

Rewrite a function call while preserving arguments:

```bash
sg run --lang ts -p 'oldName($$$ARGS)' -r 'newName($$$ARGS)' src
```

Find imports from a deprecated module:

```bash
sg run --lang ts -p "import { $$$SPECIFIERS } from '@/lib/old-api'" apps/web/src
```

Find `await` calls to a specific API:

```bash
sg run --lang ts -p 'await $CLIENT.fetch($$$ARGS)' apps
```

Find object literals containing a specific property:

```bash
sg run --lang ts -p '{ $$$BEFORE, deprecatedKey: $VALUE, $$$AFTER }' src
```

## React JSX

Find a JSX component with a specific prop:

```bash
sg run --lang tsx -p '<Button variant="primary" $$$PROPS />' apps/web/src
```

Find components using a deprecated prop:

```bash
sg run --lang tsx -p '<$COMPONENT deprecatedProp={$VALUE} $$$PROPS />' apps/web/src
```

Rewrite a JSX prop name:

```bash
sg run --lang tsx -p '<$COMPONENT oldProp={$VALUE} $$$PROPS />' -r '<$COMPONENT newProp={$VALUE} $$$PROPS />' apps/web/src
```

Find React hooks with empty dependency arrays:

```bash
sg run --lang tsx -p 'useEffect($CALLBACK, [])' apps/web/src
```

## NestJS and Decorators

Find controller route handlers:

```bash
sg run --lang ts -p '@Get($PATH) $METHOD($$$ARGS) { $$$BODY }' apps/api/src
```

Find providers injecting a specific service:

```bash
sg run --lang ts -p 'constructor($$$BEFORE, private readonly $NAME: OldService, $$$AFTER) {}' apps/api/src
```

Find methods with a decorator:

```bash
sg run --lang ts -p '@$DECORATOR($$$DECORATOR_ARGS) $METHOD($$$ARGS) { $$$BODY }' apps/api/src
```

## Rule YAML

Minimal rule:

```yaml
id: no-console-log
language: TypeScript
rule:
  pattern: console.log($$$ARGS)
message: Avoid console.log in committed code.
severity: warning
```

Rule with file constraints:

```yaml
id: deprecated-web-import
language: TypeScript
files:
  - apps/web/src/**/*.ts
  - apps/web/src/**/*.tsx
rule:
  pattern: import { $$$SPECIFIERS } from '@/lib/old-api'
message: Use the current API client module.
severity: error
```

After creating or editing rules:

```bash
sg scan
sg test
```

## Python

Find direct `print(...)` calls:

```bash
sg run --lang python -p 'print($$$ARGS)' .
```

Find broad exception handlers:

```bash
sg run --lang python -p 'except Exception as $ERR: $$$BODY' .
```

Find a function call with a keyword argument:

```bash
sg run --lang python -p '$FUNC($$$BEFORE, deprecated_arg=$VALUE, $$$AFTER)' .
```

## Choosing Metavariables

- Use `$NAME` for a single AST node.
- Use `$$$ARGS`, `$$$PROPS`, or `$$$BODY` for zero or more nodes.
- Use descriptive metavariable names so rewrites are readable.
- If a pattern fails unexpectedly, simplify it to the smallest matching shape, then add constraints back.
