import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatRoomHeaderProps {
  backIcon: ReactNode;
  onBack: () => void;
  avatar: ReactNode;
  title: string;
  subtitle?: string | null;
  meta?: ReactNode;
  actions?: ReactNode;
  onIdentityClick?: (() => void) | null;
  className?: string;
}

export function ChatRoomHeader({
  backIcon,
  onBack,
  avatar,
  title,
  subtitle,
  meta,
  actions,
  onIdentityClick,
  className,
}: ChatRoomHeaderProps) {
  const identityInteractive = typeof onIdentityClick === "function";
  const hasSecondaryLine = Boolean(subtitle);

  return (
    <div
      className={cn(
        "sticky top-0 z-10 flex h-16 items-center gap-2 border-b border-border/60 bg-background/95 px-3 backdrop-blur-sm",
        className,
      )}
    >
      <Button variant="ghost" size="icon" onClick={onBack} className="size-8 rounded-full">
        {backIcon}
      </Button>
      <button
        type="button"
        onClick={onIdentityClick ?? undefined}
        disabled={!identityInteractive}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 rounded-2xl px-1 py-0.5 text-left transition-colors",
          identityInteractive ? "hover:bg-accent/40" : "cursor-default",
        )}
      >
        {avatar}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold text-foreground">{title}</h1>
            {hasSecondaryLine ? (
              <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          {meta ? <div className="shrink-0 text-right">{meta}</div> : null}
        </div>
      </button>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
