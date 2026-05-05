import { CalendarPlus, Plus, SquarePen, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CrewHubQuickActionsProps {
  canCreateActivity?: boolean;
  canWritePost?: boolean;
  onCreateActivity?: () => void;
  onWritePost?: () => void;
  dismissKey?: string;
}

export default function CrewHubQuickActions({
  canCreateActivity = false,
  canWritePost = false,
  onCreateActivity,
  onWritePost,
  dismissKey,
}: CrewHubQuickActionsProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [dismissKey]);

  if (!canCreateActivity && !canWritePost) {
    return null;
  }

  const closeAndRun = (action?: () => void) => {
    setOpen(false);
    action?.();
  };

  return (
    <div className="pointer-events-none fixed right-4 z-40 flex flex-col items-end gap-3 [bottom:calc(env(safe-area-inset-bottom)+5rem)] md:right-6 md:[bottom:calc(env(safe-area-inset-bottom)+1.5rem)]">
      {canCreateActivity && (
        <div
          className={cn(
            "pointer-events-auto flex items-center gap-2 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-4 scale-90 opacity-0 pointer-events-none",
          )}
        >
          <span className="rounded-full border border-border/60 bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
            활동 만들기
          </span>
          <Button
            type="button"
            size="icon-lg"
            className="rounded-full shadow-lg"
            onClick={() => closeAndRun(onCreateActivity)}
            aria-label="활동 만들기"
          >
            <CalendarPlus className="size-5" />
          </Button>
        </div>
      )}

      {canWritePost && (
        <div
          className={cn(
            "pointer-events-auto flex items-center gap-2 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-3 scale-90 opacity-0 pointer-events-none",
          )}
        >
          <span className="rounded-full border border-border/60 bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
            글쓰기
          </span>
          <Button
            type="button"
            size="icon-lg"
            className="rounded-full shadow-lg"
            onClick={() => closeAndRun(onWritePost)}
            aria-label="글쓰기"
          >
            <SquarePen className="size-5" />
          </Button>
        </div>
      )}

      <Button
        type="button"
        size="icon-lg"
        className={cn(
          "pointer-events-auto rounded-full shadow-xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-95",
          open && "rotate-45",
        )}
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "빠른 작업 닫기" : "빠른 작업 열기"}
      >
        {open ? <X className="size-5" /> : <Plus className="size-5" />}
      </Button>
    </div>
  );
}
