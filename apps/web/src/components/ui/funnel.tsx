import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";

interface UseFunnelOptions<Step extends string | number> {
  initialStep: Step;
  steps: readonly Step[];
}

export function useFunnel<Step extends string | number>({
  initialStep,
  steps,
}: UseFunnelOptions<Step>) {
  const [step, setStep] = useState<Step>(initialStep);

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
