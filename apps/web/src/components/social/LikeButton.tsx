import { Heart } from "lucide-react";
import { type MouseEvent } from "react";
import { toast } from "sonner";

import { AuthGateDialog } from "@/components/common/AuthGateDialog";
import { useSocialLikeInteraction } from "@/hooks/useSocial";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  entityType: "post" | "workout";
  entityId: string;
  initialLiked?: boolean;
  initialCount?: number;
  compact?: boolean;
  disabled?: boolean;
  pending?: boolean;
}

interface LikeButtonControlProps {
  animating?: boolean;
  compact?: boolean;
  count: number;
  disabled?: boolean;
  liked: boolean;
  onToggle: (event: MouseEvent<HTMLButtonElement>) => void;
  pending?: boolean;
}

export function LikeButton({
  entityType,
  entityId,
  initialLiked = false,
  initialCount = 0,
  compact = false,
  disabled = false,
  pending = false,
}: LikeButtonProps) {
  const interaction = useSocialLikeInteraction({
    entityId,
    entityType,
    initialCount,
    initialLiked,
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "좋아요 처리에 실패했습니다.");
    },
    pending,
  });
  const nextPath =
    typeof window === "undefined"
      ? "/feed"
      : `${window.location.pathname}${window.location.search}${window.location.hash}`;

  return (
    <>
      <LikeButtonControl
        animating={interaction.animating}
        compact={compact}
        count={interaction.displayCount}
        disabled={disabled}
        liked={interaction.displayLiked}
        onToggle={interaction.toggle}
        pending={interaction.isPending}
      />

      <AuthGateDialog
        open={interaction.showAuthDialog}
        onOpenChange={interaction.setShowAuthDialog}
        nextPath={nextPath}
        title="좋아요 남기기"
        description="지금 보고 있는 글에서 바로 이어서 반응할 수 있습니다."
      />
    </>
  );
}

export function LikeButtonControl({
  animating = false,
  compact = false,
  count,
  disabled = false,
  liked,
  onToggle,
  pending = false,
}: LikeButtonControlProps) {
  const buttonLabel = liked ? "좋아요 취소" : "좋아요";
  const isDisabled = disabled || pending;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isDisabled}
      aria-label={buttonLabel}
      aria-pressed={liked}
      aria-busy={pending}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-full text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        compact
          ? "min-h-8 px-2 text-xs text-muted-foreground hover:bg-accent/70"
          : "min-h-9 px-3 text-muted-foreground hover:bg-accent hover:text-foreground",
        liked && "text-foreground",
        pending && "opacity-80",
      )}
    >
      <Heart
        className={cn(
          "transition-all duration-200",
          "size-4",
          liked ? "fill-red-500 text-red-500" : "text-muted-foreground",
          animating && "scale-125",
        )}
      />
      {count > 0 && (
        <span
          className={cn(
            "tabular-nums",
            compact ? "text-xs" : "text-sm",
            liked ? "text-red-500" : "text-muted-foreground",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
