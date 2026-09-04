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
