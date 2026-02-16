import Image from "next/image";
import Link from "next/link";

interface PostFeedCardProps {
  post: {
    id: string;
    content: string;
    visibility: string;
    hashtags: string[];
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
    workouts: Array<{
      workout: {
        id: string;
        distance: number;
        duration: number;
        pace: number;
        date: string;
      };
    }>;
  };
}

export default function PostFeedCard({ post }: PostFeedCardProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
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
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분 ${secs}초`;
  };

  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}'${seconds.toString().padStart(2, "0")}"`;
  };

  return (
    <Link href={`/posts/${post.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            {post.user.profileImage ? (
              <Image
                src={post.user.profileImage}
                alt={post.user.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold">
                {post.user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{post.user.name}</p>
            <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Hashtags */}
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-block bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Attached Workouts */}
        {post.workouts.length > 0 && (
          <div className="border-t border-gray-200 pt-4 mb-4">
            <p className="text-sm font-semibold text-gray-600 mb-2">
              첨부된 워크아웃 ({post.workouts.length})
            </p>
            <div className="space-y-2">
              {post.workouts.map(({ workout }) => (
                <div
                  key={workout.id}
                  className="bg-gray-50 rounded-lg p-3 grid grid-cols-3 gap-2 text-sm"
                >
                  <div className="text-center">
                    <p className="font-bold text-blue-600">
                      {workout.distance.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">km</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-green-600">
                      {formatDuration(workout.duration)}
                    </p>
                    <p className="text-xs text-gray-600">시간</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-purple-600">
                      {formatPace(workout.pace)}
                    </p>
                    <p className="text-xs text-gray-600">/km</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Like & Comment Count */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
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
            <span>{post._count.likes}</span>
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
            <span>{post._count.comments}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
