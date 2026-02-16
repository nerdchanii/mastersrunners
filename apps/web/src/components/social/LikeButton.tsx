import { useState } from "react";
import { Heart } from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  entityType: "post" | "workout";
  entityId: string;
  initialLiked?: boolean;
  initialCount?: number;
  compact?: boolean;
}

export function LikeButton({
  entityType,
  entityId,
  initialLiked = false,
  initialCount = 0,
  compact = false,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;

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
        entityType === "workout"
          ? `/workouts/${entityId}/like`
          : `/posts/${entityId}/like`;

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
    <button
      onClick={handleToggleLike}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-1.5 transition-colors disabled:opacity-50",
        compact ? "p-1" : "rounded-lg px-2 py-1.5 hover:bg-accent"
      )}
    >
      <Heart
        className={cn(
          "transition-all duration-200",
          compact ? "size-5" : "size-5",
          liked
            ? "fill-red-500 text-red-500"
            : "text-muted-foreground",
          animating && "scale-125"
        )}
      />
      {count > 0 && (
        <span
          className={cn(
            "font-medium tabular-nums",
            compact ? "text-xs" : "text-sm",
            liked ? "text-red-500" : "text-muted-foreground"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
