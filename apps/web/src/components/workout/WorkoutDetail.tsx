
interface WorkoutType {
  id: string;
  name: string;
  category: string;
}

interface Shoe {
  id: string;
  brand: string;
  model: string;
}

interface WorkoutDetailProps {
  distance: number;
  duration: number;
  pace: number;
  date: string;
  memo?: string | null;
  workoutType?: WorkoutType | null;
  shoe?: Shoe | null;
  visibility?: string;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}시간 ${minutes}분 ${secs}초`;
  } else if (minutes > 0) {
    return `${minutes}분 ${secs}초`;
  } else {
    return `${secs}초`;
  }
}

function formatPace(pace: number): string {
  const minutes = Math.floor(pace);
  const seconds = Math.floor((pace - minutes) * 60);
  return `${minutes}'${seconds.toString().padStart(2, "0")}"`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const visibilityLabels: Record<string, string> = {
  PUBLIC: "전체 공개",
  FOLLOWERS: "팔로워 공개",
  PRIVATE: "비공개",
};

export function WorkoutDetail({
  distance,
  duration,
  pace,
  date,
  memo,
  workoutType,
  shoe,
  visibility = "FOLLOWERS",
}: WorkoutDetailProps) {
  return (
    <div className="space-y-6">
      {/* Main stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-sm font-medium text-gray-500 mb-2">거리</div>
          <div className="text-3xl font-bold text-indigo-600">
            {distance.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600 mt-1">km</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-sm font-medium text-gray-500 mb-2">시간</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatDuration(duration)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-sm font-medium text-gray-500 mb-2">페이스</div>
          <div className="text-3xl font-bold text-gray-900">
            {formatPace(pace)}
          </div>
          <div className="text-sm text-gray-600 mt-1">/km</div>
        </div>
      </div>

      {/* Date and visibility */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">일시</div>
            <div className="text-lg text-gray-900">{formatDate(date)}</div>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {visibilityLabels[visibility] || visibility}
          </span>
        </div>
      </div>

      {/* Workout type */}
      {workoutType && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">
            운동 유형
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {workoutType.category}
            </span>
            <span className="text-gray-900">{workoutType.name}</span>
          </div>
        </div>
      )}

      {/* Shoe info */}
      {shoe && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">착용 신발</div>
          <div className="text-gray-900">
            {shoe.brand} {shoe.model}
          </div>
        </div>
      )}

      {/* Memo */}
      {memo && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">메모</div>
          <p className="text-gray-900 whitespace-pre-wrap">{memo}</p>
        </div>
      )}
    </div>
  );
}
