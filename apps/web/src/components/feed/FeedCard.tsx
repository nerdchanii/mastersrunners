import Image from "next/image";
import Link from "next/link";

interface FeedCardProps {
  workout: {
    id: string;
    distance: number;
    duration: number;
    pace: number;
    date: string;
    visibility: string;
    memo: string | null;
    createdAt: string;
    user: {
      id: string;
      name: string;
      profileImage: string | null;
    };
    _count: {
      likes: number;
      comments: number;
    };
  };
}

export default function FeedCard({ workout }: FeedCardProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getVisibilityBadge = (visibility: string) => {
    const colors = {
      PUBLIC: "bg-green-100 text-green-700",
      FOLLOWERS_ONLY: "bg-blue-100 text-blue-700",
      PRIVATE: "bg-gray-100 text-gray-700",
    };
    const labels = {
      PUBLIC: "전체공개",
      FOLLOWERS_ONLY: "팔로워공개",
      PRIVATE: "비공개",
    };
    return {
      color: colors[visibility as keyof typeof colors] || colors.PRIVATE,
      label: labels[visibility as keyof typeof labels] || "비공개",
    };
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

  const visibilityBadge = getVisibilityBadge(workout.visibility);

  return (
    <Link href={`/workouts/detail?id=${workout.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        {/* User Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
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
              <p className="text-sm text-gray-500">{formatDate(workout.createdAt)}</p>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${visibilityBadge.color}`}>
            {visibilityBadge.label}
          </span>
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

      {/* Like & Comment Count */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
        <div className="flex items-center gap-1">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>{workout._count.likes}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{workout._count.comments}</span>
        </div>
      </div>
    </div>
    </Link>
  );
}
