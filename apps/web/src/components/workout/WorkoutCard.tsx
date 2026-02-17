import { formatDistance, formatDuration, formatPace } from "@/lib/format";
import ShareToggle from "./ShareToggle";

type Visibility = "PRIVATE" | "FOLLOWERS" | "PUBLIC";

const VISIBILITY_BADGE: Record<Visibility, { label: string; className: string }> = {
  PUBLIC: { label: "전체 공개", className: "bg-green-100 text-green-800" },
  FOLLOWERS: { label: "팔로워 공개", className: "bg-blue-100 text-blue-800" },
  PRIVATE: { label: "비공개", className: "bg-gray-100 text-gray-800" },
};

interface WorkoutCardProps {
  workout: {
    id: string;
    distance: number;
    duration: number;
    pace: number;
    date: Date | string;
    memo: string | null;
    visibility: Visibility;
    userId?: string;
  };
  currentUserId?: string;
  showShareToggle?: boolean;
}

export default function WorkoutCard({
  workout,
  currentUserId,
  showShareToggle = true,
}: WorkoutCardProps) {
  const isOwner = currentUserId && workout.userId === currentUserId;
  const date = new Date(workout.date);
  const dateString = date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{dateString}</h3>
        </div>
        <div>
          {isOwner && showShareToggle ? (
            <ShareToggle
              workoutId={workout.id}
              initialVisibility={workout.visibility}
            />
          ) : (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${VISIBILITY_BADGE[workout.visibility].className}`}>
              {VISIBILITY_BADGE[workout.visibility].label}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">거리</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatDistance(workout.distance)}
            <span className="text-sm font-normal text-gray-500 ml-1">km</span>
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">시간</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatDuration(workout.duration)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">페이스</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatPace(workout.pace)}
            <span className="text-sm font-normal text-gray-500 ml-1">/km</span>
          </p>
        </div>
      </div>

      {workout.memo && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">{workout.memo}</p>
        </div>
      )}
    </div>
  );
}
