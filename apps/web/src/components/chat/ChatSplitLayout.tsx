import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ChatSplitLayoutProps {
  sidebar?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChatSplitLayout({ sidebar, children, className }: ChatSplitLayoutProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full overflow-hidden md:mx-auto md:my-3 md:h-[calc(100%-1.5rem)] md:max-w-[1440px] md:border md:border-border/60",
        className,
      )}
    >
      {sidebar}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
