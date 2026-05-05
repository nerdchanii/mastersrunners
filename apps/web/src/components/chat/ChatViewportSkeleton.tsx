import { Skeleton } from "@/components/ui/skeleton";

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

      <div className="sticky bottom-0 shrink-0 bg-background/98 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-4">
        <div className="flex items-end gap-2 rounded-[1.75rem] border border-input bg-background pl-3 pr-2 pt-1.5 pb-2 shadow-sm">
          <Skeleton className="h-7 flex-1 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}
