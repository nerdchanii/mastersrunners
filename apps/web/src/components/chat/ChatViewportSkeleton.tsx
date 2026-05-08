import { MOBILE_SHELL_FULL_HEIGHT_INSET_CLASS_NAME } from "@/components/layout/mobile-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ChatViewportSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-2 py-3 pb-2 sm:px-3">
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className={`flex ${index % 2 === 0 ? "justify-end" : "justify-start"}`}>
            <Skeleton className="h-14 w-52 rounded-3xl" />
          </div>
        ))}
      </div>

      <div
        className={cn(
          "sticky bottom-0 shrink-0 bg-background/98 px-3 pt-2 backdrop-blur-sm sm:px-4",
          MOBILE_SHELL_FULL_HEIGHT_INSET_CLASS_NAME,
        )}
      >
        <div className="flex items-end gap-2 rounded-[1.75rem] border border-input bg-background pl-3 pr-2 pt-1.5 pb-2 shadow-sm">
          <Skeleton className="h-7 flex-1 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}
