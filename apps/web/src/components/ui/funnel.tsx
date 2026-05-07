import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";

const FUNNEL_HISTORY_STATE_KEY = "__mastersFunnel";

export type FunnelStepMap = Record<string, unknown>;
export type FunnelStepName<Steps extends FunnelStepMap> = Extract<keyof Steps, string>;

export type FunnelHistory<Steps extends FunnelStepMap> = {
  push<Step extends FunnelStepName<Steps>>(step: Step, context: NoInfer<Steps[Step]>): void;
  replace<Step extends FunnelStepName<Steps>>(step: Step, context: NoInfer<Steps[Step]>): void;
  back(): void;
  go(delta: number): void;
};

export type FunnelRenderProps<Steps extends FunnelStepMap, Step extends FunnelStepName<Steps>> = {
  step: Step;
  context: Steps[Step];
  history: FunnelHistory<Steps>;
};

export type FunnelRenderHandlers<Steps extends FunnelStepMap> = {
  [Step in FunnelStepName<Steps>]: (props: FunnelRenderProps<Steps, Step>) => ReactNode;
};

type UseHistoryFunnelOptionsBase<Steps extends FunnelStepMap> = {
  id: string;
  steps: readonly FunnelStepName<Steps>[];
  sync: "history";
};

export type UseHistoryFunnelOptions<Steps extends FunnelStepMap> = {
  [Step in FunnelStepName<Steps>]: UseHistoryFunnelOptionsBase<Steps> & {
    initialStep: Step;
    initialContext: Steps[Step];
  };
}[FunnelStepName<Steps>];

export type HistoryFunnel<Steps extends FunnelStepMap> = {
  step: FunnelStepName<Steps>;
  context: Steps[FunnelStepName<Steps>];
  history: FunnelHistory<Steps>;
  Render: ComponentType<FunnelRenderHandlers<Steps>>;
};

export interface UseFunnelOptions<Step extends string | number> {
  initialStep: Step;
  steps: readonly Step[];
}

export type LocalFunnel<Step extends string | number> = {
  step: Step;
  setStep: (step: Step) => void;
  stepIndex: number;
  totalSteps: number;
  progress: number;
  handleNext: () => void;
  handleBack: () => void;
};

type AnyHistoryFunnelOptions = UseHistoryFunnelOptions<FunnelStepMap>;
type AnyHistoryEntry = {
  step: string;
  context: unknown;
};

function isHistoryFunnelOptions(
  options: UseFunnelOptions<string | number> | AnyHistoryFunnelOptions,
): options is AnyHistoryFunnelOptions {
  return "sync" in options && options.sync === "history";
}

function canUseBrowserHistory() {
  return typeof window !== "undefined" && Boolean(window.history);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stepQueryKey(id: string) {
  return `${id}.step`;
}

function isKnownStep<Steps extends FunnelStepMap>(
  steps: readonly FunnelStepName<Steps>[],
  step: string | null,
): step is FunnelStepName<Steps> {
  return step !== null && steps.some((candidate) => candidate === step);
}

function getStepFromQuery<Steps extends FunnelStepMap>(
  id: string,
  steps: readonly FunnelStepName<Steps>[],
) {
  if (!canUseBrowserHistory()) {
    return null;
  }

  const step = new URLSearchParams(window.location.search).get(stepQueryKey(id));
  return isKnownStep(steps, step) ? step : null;
}

function buildStepUrl(id: string, step: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(stepQueryKey(id), step);
  return `${url.pathname}${url.search}${url.hash}`;
}

function getHistoryStateBase() {
  return isObjectRecord(window.history.state) ? window.history.state : {};
}

function getStoredFunnelEntry<Steps extends FunnelStepMap>(
  state: unknown,
  id: string,
  steps: readonly FunnelStepName<Steps>[],
) {
  if (!isObjectRecord(state)) {
    return null;
  }

  const funnelState = state[FUNNEL_HISTORY_STATE_KEY];

  if (!isObjectRecord(funnelState)) {
    return null;
  }

  const entry = funnelState[id];
  const step = isObjectRecord(entry) && typeof entry.step === "string" ? entry.step : null;

  if (!isObjectRecord(entry) || !isKnownStep(steps, step)) {
    return null;
  }

  if (!Object.prototype.hasOwnProperty.call(entry, "context")) {
    return null;
  }

  return {
    step,
    context: entry.context,
  };
}

function buildHistoryState(id: string, step: string, context: unknown) {
  const baseState = getHistoryStateBase();
  const existingFunnelState = baseState[FUNNEL_HISTORY_STATE_KEY];
  const funnelState = isObjectRecord(existingFunnelState) ? existingFunnelState : {};

  return {
    ...baseState,
    [FUNNEL_HISTORY_STATE_KEY]: {
      ...funnelState,
      [id]: {
        step,
        context,
      },
    },
  };
}

function writeHistoryEntry(method: "push" | "replace", id: string, step: string, context: unknown) {
  if (!canUseBrowserHistory()) {
    return;
  }

  const state = buildHistoryState(id, step, context);
  const url = buildStepUrl(id, step);

  if (method === "push") {
    window.history.pushState(state, "", url);
    return;
  }

  window.history.replaceState(state, "", url);
}

function resolveHistoryEntry<Steps extends FunnelStepMap>(
  options: UseHistoryFunnelOptions<Steps>,
  state: unknown,
): AnyHistoryEntry {
  const queryStep = getStepFromQuery(options.id, options.steps);
  const stateEntry = getStoredFunnelEntry(state, options.id, options.steps);

  if (queryStep !== null) {
    if (stateEntry !== null && stateEntry.step === queryStep) {
      return stateEntry;
    }
  }

  return {
    step: options.initialStep,
    context: options.initialContext,
  };
}

function getInitialHistoryEntry(
  options: UseFunnelOptions<string | number> | AnyHistoryFunnelOptions,
) {
  if (!isHistoryFunnelOptions(options) || !canUseBrowserHistory()) {
    return {
      step: String(options.initialStep),
      context: undefined,
    };
  }

  return resolveHistoryEntry(options, window.history.state);
}

function keepCurrentEntryIfUnchanged(currentEntry: AnyHistoryEntry, nextEntry: AnyHistoryEntry) {
  if (currentEntry.step === nextEntry.step && currentEntry.context === nextEntry.context) {
    return currentEntry;
  }

  return nextEntry;
}

export function useFunnel<Step extends string | number>(
  options: UseFunnelOptions<Step>,
): LocalFunnel<Step>;
export function useFunnel<Steps extends FunnelStepMap>(
  options: UseHistoryFunnelOptions<Steps>,
): HistoryFunnel<Steps>;
export function useFunnel<Step extends string | number>(
  options: UseFunnelOptions<Step> | AnyHistoryFunnelOptions,
): LocalFunnel<Step> | HistoryFunnel<FunnelStepMap> {
  const isHistoryMode = isHistoryFunnelOptions(options);
  const historyOptionsRef = useRef<AnyHistoryFunnelOptions | null>(null);
  historyOptionsRef.current = isHistoryMode ? options : null;

  const [step, setStep] = useState<Step>(options.initialStep as Step);
  const [historyEntry, setHistoryEntry] = useState<AnyHistoryEntry>(() =>
    getInitialHistoryEntry(options),
  );

  useLayoutEffect(() => {
    const historyOptions = historyOptionsRef.current;

    if (historyOptions === null || !canUseBrowserHistory()) {
      return;
    }

    const resolvedEntry = resolveHistoryEntry(historyOptions, window.history.state);
    setHistoryEntry((currentEntry) => keepCurrentEntryIfUnchanged(currentEntry, resolvedEntry));
    writeHistoryEntry("replace", historyOptions.id, resolvedEntry.step, resolvedEntry.context);
  }, [isHistoryMode]);

  useEffect(() => {
    if (!isHistoryMode || !canUseBrowserHistory()) {
      return;
    }

    const handlePopState = (event: PopStateEvent) => {
      const historyOptions = historyOptionsRef.current;

      if (historyOptions === null) {
        return;
      }

      const nextEntry = resolveHistoryEntry(historyOptions, event.state);
      setHistoryEntry((currentEntry) => keepCurrentEntryIfUnchanged(currentEntry, nextEntry));
      writeHistoryEntry("replace", historyOptions.id, nextEntry.step, nextEntry.context);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isHistoryMode]);

  const navigateHistory = useCallback(
    (method: "push" | "replace", nextStep: string, nextContext: unknown) => {
      const historyOptions = historyOptionsRef.current;

      if (historyOptions === null || !isKnownStep(historyOptions.steps, nextStep)) {
        return;
      }

      const nextEntry = {
        step: nextStep,
        context: nextContext,
      };

      writeHistoryEntry(method, historyOptions.id, nextEntry.step, nextEntry.context);
      setHistoryEntry(nextEntry);
    },
    [],
  );

  const history = useMemo<FunnelHistory<FunnelStepMap>>(
    () => ({
      push: (nextStep, nextContext) => {
        navigateHistory("push", nextStep, nextContext);
      },
      replace: (nextStep, nextContext) => {
        navigateHistory("replace", nextStep, nextContext);
      },
      back: () => {
        if (canUseBrowserHistory()) {
          window.history.back();
        }
      },
      go: (delta) => {
        if (canUseBrowserHistory()) {
          window.history.go(delta);
        }
      },
    }),
    [navigateHistory],
  );

  const Render = useCallback<HistoryFunnel<FunnelStepMap>["Render"]>(
    (handlers) => {
      const renderStep = historyEntry.step;
      const render = handlers[renderStep];

      if (typeof render !== "function") {
        return null;
      }

      return render({
        step: renderStep,
        context: historyEntry.context,
        history,
      });
    },
    [history, historyEntry.context, historyEntry.step],
  );

  if (isHistoryMode) {
    return {
      step: historyEntry.step,
      context: historyEntry.context,
      history,
      Render,
    };
  }

  const steps = options.steps as readonly Step[];
  const stepIndex = steps.indexOf(step);
  const totalSteps = steps.length;
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (stepIndex < totalSteps - 1) {
      setStep(steps[stepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStep(steps[stepIndex - 1]);
    }
  };

  return {
    step,
    setStep,
    stepIndex,
    totalSteps,
    progress,
    handleNext,
    handleBack,
  };
}

interface FunnelProps {
  children: ReactNode;
}

export const Funnel = ({ children }: FunnelProps) => {
  return (
    <div className="scrollbar-hide flex-1 overflow-y-auto pb-6">
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </div>
  );
};

interface FunnelStepProps {
  isActive: boolean;
  children: ReactNode;
}

Funnel.Step = ({ isActive, children }: FunnelStepProps) => {
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

interface FunnelProgressBarProps {
  progress: number;
}

Funnel.ProgressBar = ({ progress }: FunnelProgressBarProps) => {
  return (
    <div className="relative mb-6 mt-0 h-1 w-full shrink-0 overflow-hidden rounded-full bg-muted/20">
      <motion.div
        className="absolute left-0 top-0 h-full bg-primary"
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ type: "spring", stiffness: 500, damping: 40 }}
      />
    </div>
  );
};

interface FunnelActionBarProps {
  onBack: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isNextDisabled?: boolean;
  isSubmitDisabled?: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
}

Funnel.ActionBar = ({
  onBack,
  onNext,
  onSubmit,
  isFirstStep,
  isLastStep,
  isNextDisabled = false,
  isSubmitDisabled = false,
  isSubmitting = false,
  submitLabel = "완료",
}: FunnelActionBarProps) => {
  return (
    <div className="mt-auto flex shrink-0 sticky bottom-0 items-center justify-between gap-3 bg-background/80 backdrop-blur-sm border-t px-4 py-4 sm:static sm:border-none sm:bg-transparent sm:px-0 sm:py-6">
      <Button
        type="button"
        variant="secondary"
        onClick={onBack}
        disabled={isSubmitting}
        className="h-11 rounded-xl px-4 font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-6"
      >
        {isFirstStep ? "취소" : "이전"}
      </Button>

      {!isLastStep ? (
        <Button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled}
          className="h-11 rounded-xl px-6 font-bold shadow-md transition-transform active:scale-95 sm:px-8"
        >
          다음 단계 <ChevronRight className="ml-1 size-4" />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onSubmit}
          className="h-11 rounded-xl bg-primary px-8 font-bold shadow-md transition-transform active:scale-95 sm:px-10"
          disabled={isSubmitDisabled || isSubmitting}
        >
          {isSubmitting ? "처리 중..." : submitLabel}
        </Button>
      )}
    </div>
  );
};
