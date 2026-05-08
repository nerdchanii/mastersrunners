# R10 Funnel Abstraction And History

## TL;DR

- 핵심 문제: `CrewCreateForm`, `posts/new`, `onboarding`이 서로 다른 step/history 방식을 사용한다.
- 해결책: `use-funnel` 철학을 참고해 typed step, step context, `push/replace/back/go`, browser history sync를 공용 `useFunnel`로 제공한다.
- 기대효과: multi-step flow의 back/forward, reload, validation, render structure가 일관된다.

## Current State

| Surface         | Evidence                                                      | Current Pattern                                      | Gap                                    |
| --------------- | ------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------- |
| shared `Funnel` | `apps/web/src/components/ui/funnel.tsx:12`                    | local `useState` step, `Funnel.Step isActive`        | no context, no URL/history sync        |
| Crew create     | `apps/web/src/components/crew/CrewCreateForm.tsx:43`          | shared funnel hook                                   | no typed step context, no browser back |
| Post composer   | `apps/web/src/pages/posts/new/use-post-composer.ts:37`, `:52` | route-local step + manual `window.history.pushState` | history logic duplicated and fragile   |
| Onboarding      | `apps/web/src/pages/onboarding/index.tsx:39`                  | local numeric step                                   | no browser back/forward support        |

## Target API Shape

```ts
type PostComposerFunnel = {
  workout: { selectedWorkoutIds: string[] };
  photos: { selectedWorkoutIds: string[]; images: ImageUpload[] };
  text: { selectedWorkoutIds: string[]; images: ImageUpload[]; content: string };
  preview: {
    selectedWorkoutIds: string[];
    images: ImageUpload[];
    content: string;
    visibility: Visibility;
  };
};

const funnel = useFunnel<PostComposerFunnel>({
  id: "post-composer",
  initialStep: "workout",
  steps: ["workout", "photos", "text", "preview"],
  sync: "history",
});

return (
  <funnel.Render
    workout={({ history, context }) => <WorkoutStep onNext={(next) => history.push("photos", next)} />}
    photos={({ history, context }) => <PhotosStep onBack={history.back} />}
    text={({ history, context }) => <TextStep />}
    preview={({ context }) => <PreviewStep />}
  />
);
```

## Required Capabilities

| Capability            | Rule                                                                  |
| --------------------- | --------------------------------------------------------------------- |
| typed steps           | step name maps to context type                                        |
| `history.push`        | append new step/context to browser history                            |
| `history.replace`     | replace current step/context without adding history                   |
| `history.back` / `go` | use browser history when synced                                       |
| URL/query sync        | current step is visible as `?{id}.step=...` or agreed equivalent      |
| context state         | context stored in `window.history.state`, not all serialized into URL |
| render helper         | avoid repeated `step === x` branches                                  |
| cleanup               | remove funnel-specific listeners/state on unmount where safe          |

## Non-Goals

- Introduce external dependency immediately.
- Match `use-funnel` API 1:1.
- Rewrite all forms in one task.
- Store large File objects in URL.

## Migration Plan

| ID     | Canonical Task                                                | Scope                                                          | Risk       |
| ------ | ------------------------------------------------------------- | -------------------------------------------------------------- | ---------- |
| CC-230 | `tasks/todo/I-0022-230-web-funnel-abstraction-history.md`     | build shared history-aware `useFunnel` and `Funnel.Render` API | Medium     |
| CC-231 | `tasks/todo/I-0022-231-web-post-composer-funnel-migration.md` | migrate `posts/new` from manual pushState to shared funnel     | Medium     |
| CC-232 | `tasks/todo/I-0022-232-web-onboarding-funnel-migration.md`    | migrate onboarding local step to shared funnel                 | Medium     |
| CC-233 | `tasks/todo/I-0022-233-web-crew-create-funnel-upgrade.md`     | upgrade `CrewCreateForm` to typed context/history API          | Low-Medium |

## Interaction Rules

- validation stays in feature flow, not in generic funnel core.
- funnel core owns navigation and step context mechanics only.
- file uploads and object URL cleanup remain in feature hook.
- post composer must stop hand-writing `window.history.pushState`.
- onboarding must support browser back to previous step before leaving route.

## Verification Focus

| Flow                                  | Expected                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| post composer next/back buttons       | browser history and UI step stay aligned                                             |
| browser Back on post composer step 2+ | moves to previous funnel step, not immediately route exit                            |
| onboarding browser Back               | previous onboarding step first                                                       |
| reload with step query                | enters matching step if required context is recoverable; otherwise safe initial step |
| large context                         | File objects not serialized into URL                                                 |

## References

- use-funnel: [GitHub repository](https://github.com/toss/use-funnel)
- use-funnel browser model: [Browser Integration](https://deepwiki.com/toss/use-funnel/3.3-browser-integration)
- React Router: [Navigation](https://reactrouter.com/start/framework/navigating)
