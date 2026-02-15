"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";

interface LikeButtonProps {
  entityType: "post" | "workout";
  entityId: string;
  initialLiked?: boolean;
  initialCount?: number;
}

export function LikeButton({
  entityType,
  entityId,
  initialLiked = false,
  initialCount = 0,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleLike = async () => {
    if (isLoading) return;

    const previousLiked = liked;
    const previousCount = count;

    // Optimistic update
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    setIsLoading(true);

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
    } catch (error) {
      // Rollback on error
      setLiked(previousLiked);
      setCount(previousCount);
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      disabled={isLoading}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-5 h-5 ${liked ? "text-red-500" : "text-gray-600"}`}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span className="text-sm font-medium text-gray-700">{count}</span>
    </button>
  );
}
