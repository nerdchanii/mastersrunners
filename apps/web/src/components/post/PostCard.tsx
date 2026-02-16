
import { useState } from "react";
import { api } from "@/lib/api-client";

interface User {
  id: string;
  name: string;
  profileImage: string | null;
}

interface PostCardProps {
  id: string;
  user: User;
  content: string;
  hashtags?: string[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
  onLikeToggle?: () => void;
}

export function PostCard({
  id,
  user,
  content,
  hashtags = [],
  likesCount: initialLikesCount,
  commentsCount,
  isLiked: initialIsLiked,
  createdAt,
  onLikeToggle,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiking, setIsLiking] = useState(false);

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInDays < 7) return `${diffInDays}일 전`;

    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLikeToggle = async () => {
    if (isLiking) return;

    setIsLiking(true);
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    try {
      if (isLiked) {
        await api.fetch(`/posts/${id}/like`, { method: "DELETE" });
      } else {
        await api.fetch(`/posts/${id}/like`, { method: "POST" });
      }
      onLikeToggle?.();
    } catch (error) {
      // Revert on error
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* User Info */}
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          {user.profileImage ? (
            <img
              className="h-10 w-10 rounded-full"
              src={user.profileImage}
              alt={user.name}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{formatTimestamp(createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-900 whitespace-pre-wrap">{content}</p>
      </div>

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {hashtags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
        {/* Like Button */}
        <button
          onClick={handleLikeToggle}
          disabled={isLiking}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          {isLiked ? (
            <svg
              className="h-5 w-5 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          )}
          <span className={isLiked ? "text-red-600 font-medium" : ""}>
            {likesCount > 0 ? likesCount.toLocaleString() : "좋아요"}
          </span>
        </button>

        {/* Comment Count */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{commentsCount > 0 ? `댓글 ${commentsCount.toLocaleString()}개` : "댓글"}</span>
        </div>
      </div>
    </div>
  );
}
