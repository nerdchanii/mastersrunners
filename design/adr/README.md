# ADR

ADR means Architecture Decision Record.

Use one file per important technical choice when future readers or agents need to know why a direction was chosen.

An ADR is not a task log and not a feature spec. It is the durable record of a technical decision that other design docs will depend on.

Naming:

```text
ADR-0001-short-title.md
```

Typical candidates:

- framework choices
- storage strategy changes
- auth model changes
- task/workflow harness rules

When to create one:

- an initiative settles on a technical direction that should stay stable
- future contributors would otherwise have to rediscover "why this way"
- the choice affects multiple docs or subsystems

Use `ADR-TEMPLATE.md` when creating a new ADR.

Current accepted ADRs:

- `ADR-0001-repo-source-of-truth-boundaries.md`
- `ADR-0002-vite-spa-and-nest-api-split.md`
- `ADR-0003-canonical-workout-units.md`
- `ADR-0004-sse-for-current-realtime-delivery.md`
