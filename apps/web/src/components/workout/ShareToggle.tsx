import { useEffect, useState } from "react";

import { useWorkoutVisibilityInteraction, type WorkoutVisibility } from "@/hooks/useWorkouts";

type Visibility = WorkoutVisibility;

interface ShareToggleProps {
  workoutId: string;
  initialVisibility: Visibility;
}

interface ShareToggleControlProps {
  onVisibilityChange: (visibility: Visibility) => void;
  pending?: boolean;
  visibility: Visibility;
}

const VISIBILITY_LABELS: Record<Visibility, string> = {
  PRIVATE: "비공개",
  FOLLOWERS: "팔로워 공개",
  PUBLIC: "전체 공개",
};

export default function ShareToggle({ workoutId, initialVisibility }: ShareToggleProps) {
  const [error, setError] = useState<string | null>(null);
  const interaction = useWorkoutVisibilityInteraction({
    initialVisibility,
    onError: (err) => {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    },
    workoutId,
  });

  useEffect(() => {
    setError(null);
  }, [workoutId]);

  const handleVisibilityChange = async (visibility: Visibility) => {
    setError(null);

    try {
      await interaction.changeVisibility(visibility);
    } catch {
      // Error copy is handled through the interaction hook callback above.
    }
  };

  return (
    <div className="flex items-center gap-3">
      <ShareToggleControl
        onVisibilityChange={handleVisibilityChange}
        pending={interaction.isPending}
        visibility={interaction.visibility}
      />
      {error && (
        <span className="text-xs text-red-600" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export function ShareToggleControl({
  onVisibilityChange,
  pending = false,
  visibility,
}: ShareToggleControlProps) {
  return (
    <>
      <select
        value={visibility}
        onChange={(e) => onVisibilityChange(e.target.value as Visibility)}
        disabled={pending}
        className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="공개 설정"
      >
        <option value="PRIVATE">{VISIBILITY_LABELS.PRIVATE}</option>
        <option value="FOLLOWERS">{VISIBILITY_LABELS.FOLLOWERS}</option>
        <option value="PUBLIC">{VISIBILITY_LABELS.PUBLIC}</option>
      </select>
      {pending && <span className="text-sm text-gray-500">변경 중...</span>}
    </>
  );
}
