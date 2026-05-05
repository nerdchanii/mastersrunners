import { Heart } from "lucide-react";
import { useState } from "react";

import { AuthGateDialog } from "@/components/common/AuthGateDialog";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
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

export function LikeButton({
  entityType,
  entityId,
  initialLiked = false,
  initialCount = 0,
  compact = false,
  disabled = false,
  pending = false,
}: LikeButtonProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const nextPath =
    typeof window === "undefined"
      ? "/feed"
      : `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const buttonLabel = liked ? "좋아요 취소" : "좋아요";
  const isDisabled = disabled || pending || isLoading;

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDisabled) return;
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    const previousLiked = liked;
    const previousCount = count;

    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    setIsLoading(true);

    if (!liked) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 400);
    }

    try {
      const endpoint =
        entityType === "workout" ? `/workouts/${entityId}/like` : `/posts/${entityId}/like`;

      if (!liked) {
        await api.fetch(endpoint, { method: "POST" });
      } else {
        await api.fetch(endpoint, { method: "DELETE" });
      }
    } catch {
      setLiked(previousLiked);
      setCount(previousCount);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleToggleLike}
        disabled={isDisabled}
        aria-label={buttonLabel}
        aria-pressed={liked}
        aria-busy={pending || isLoading}
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

      <AuthGateDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        nextPath={nextPath}
        title="좋아요 남기기"
        description="지금 보고 있는 글에서 바로 이어서 반응할 수 있습니다."
      />
    </>
  );
}
