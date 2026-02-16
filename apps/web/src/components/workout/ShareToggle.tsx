
import { useState } from "react";
import { api } from "@/lib/api-client";

type Visibility = "PRIVATE" | "FOLLOWERS" | "PUBLIC";

interface ShareToggleProps {
  workoutId: string;
  initialVisibility: Visibility;
}

const VISIBILITY_LABELS: Record<Visibility, string> = {
  PRIVATE: "비공개",
  FOLLOWERS: "팔로워 공개",
  PUBLIC: "전체 공개",
};

export default function ShareToggle({
  workoutId,
  initialVisibility,
}: ShareToggleProps) {
  const [visibility, setVisibility] = useState<Visibility>(initialVisibility);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (newVisibility: Visibility) => {
    if (newVisibility === visibility) return;

    setIsLoading(true);
    setError(null);

    try {
      const updatedWorkout = await api.fetch<{ visibility: Visibility }>(
        `/workouts/${workoutId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ visibility: newVisibility }),
        }
      );
      setVisibility(updatedWorkout.visibility);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      console.error("Error changing visibility:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <select
        value={visibility}
        onChange={(e) => handleChange(e.target.value as Visibility)}
        disabled={isLoading}
        className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="공개 설정"
      >
        <option value="PRIVATE">{VISIBILITY_LABELS.PRIVATE}</option>
        <option value="FOLLOWERS">{VISIBILITY_LABELS.FOLLOWERS}</option>
        <option value="PUBLIC">{VISIBILITY_LABELS.PUBLIC}</option>
      </select>
      {isLoading && (
        <span className="text-sm text-gray-500">변경 중...</span>
      )}
      {error && (
        <span className="text-xs text-red-600" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
