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
