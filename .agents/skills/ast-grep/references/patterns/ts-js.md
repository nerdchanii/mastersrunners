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
