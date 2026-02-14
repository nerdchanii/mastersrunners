"use client";

import { useState } from "react";

interface ShareToggleProps {
  workoutId: string;
  initialIsPublic: boolean;
}

export default function ShareToggle({
  workoutId,
  initialIsPublic,
}: ShareToggleProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublic: !isPublic }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "공개 설정 변경에 실패했습니다.");
      }

      const updatedWorkout = await response.json();
      setIsPublic(updatedWorkout.isPublic);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      console.error("Error toggling share:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          isPublic ? "bg-blue-600" : "bg-gray-300"
        }`}
        aria-label={isPublic ? "공개" : "비공개"}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isPublic ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span className="text-sm font-medium text-gray-700">
        {isLoading ? "변경 중..." : isPublic ? "공개" : "비공개"}
      </span>
      {error && (
        <span className="text-xs text-red-600" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
