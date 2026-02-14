import Image from "next/image";

interface FeedCardProps {
  workout: {
    id: string;
    distance: number;
    duration: number;
    pace: number;
    date: Date | string;
    memo: string | null;
    user: {
      id: string;
      name: string;
      profileImage: string | null;
    };
  };
}

export default function FeedCard({ workout }: FeedCardProps) {
  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${secs}초`;
    }
    return `${minutes}분 ${secs}초`;
  };

  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}'${seconds.toString().padStart(2, "0")}"`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* User Info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
          {workout.user.profileImage ? (
            <Image
              src={workout.user.profileImage}
              alt={workout.user.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold">
              {workout.user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{workout.user.name}</p>
          <p className="text-sm text-gray-500">{formatDate(workout.date)}</p>
        </div>
      </div>

      {/* Workout Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {workout.distance.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">km</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {formatDuration(workout.duration)}
          </p>
          <p className="text-sm text-gray-600">시간</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">
            {formatPace(workout.pace)}
          </p>
          <p className="text-sm text-gray-600">/km</p>
        </div>
      </div>

      {/* Memo */}
      {workout.memo && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-gray-700 whitespace-pre-wrap">{workout.memo}</p>
        </div>
      )}
    </div>
  );
}
