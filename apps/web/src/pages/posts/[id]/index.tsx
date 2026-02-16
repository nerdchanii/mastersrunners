
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { PostCard } from "@/components/post/PostCard";
import { CommentSection } from "@/components/post/CommentSection";

interface User {
  id: string;
  name: string;
  profileImage: string | null;
}

interface Workout {
  id: string;
  distance: number;
  duration: number;
  date: string;
  workoutType?: { name: string };
}

interface Post {
  id: string;
  content: string;
  hashtags?: string[];
  visibility: string;
  createdAt: string;
  user: User;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  workouts?: Workout[];
}

export default function PostDetailClient() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!postId || postId === "_") return;
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const data = await api.fetch<Post>(`/posts/${postId}`);
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "게시글을 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const handleDelete = async () => {
    if (!postId || !confirm("게시글을 삭제하시겠습니까?")) return;
    setIsDeleting(true);
    try {
      await api.fetch(`/posts/${postId}`, { method: "DELETE" });
      navigate("/feed");
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
      setIsDeleting(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!postId) return;
    try {
      const data = await api.fetch<Post>(`/posts/${postId}`);
      setPost(data);
    } catch {
      /* ignore */
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const calculatePace = (distance: number, duration: number): string => {
    if (distance === 0) return "-";
    const paceInSeconds = duration / distance;
    const minutes = Math.floor(paceInSeconds / 60);
    const seconds = Math.floor(paceInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!postId || postId === "_") {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-gray-500">게시글 ID가 필요합니다.</p>
        <button onClick={() => navigate("/feed")} className="mt-4 text-indigo-600 hover:underline">
          피드로 돌아가기
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-300 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4" />
                <div className="h-3 bg-gray-300 rounded w-1/6" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded" />
              <div className="h-4 bg-gray-300 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">오류</h2>
          <p className="text-red-600">{error || "게시글을 찾을 수 없습니다."}</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === post.user.id;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {isOwner && (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate(`/posts/${postId}/edit`)}
            className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-300 rounded-md hover:bg-indigo-100"
          >
            수정
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 disabled:opacity-50"
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      )}

      <PostCard
        id={post.id}
        user={post.user}
        content={post.content}
        hashtags={post.hashtags}
        likesCount={post.likesCount}
        commentsCount={post.commentsCount}
        isLiked={post.isLiked}
        createdAt={post.createdAt}
        onLikeToggle={handleLikeToggle}
      />

      {post.workouts && post.workouts.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">첨부된 훈련 기록</h2>
          <div className="space-y-3">
            {post.workouts.map((workout) => (
              <div key={workout.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{workout.workoutType?.name || "런닝"}</p>
                    <p className="text-xs text-gray-500">{new Date(workout.date).toLocaleDateString("ko-KR")}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-right">
                    <div>
                      <p className="text-gray-500 text-xs">거리</p>
                      <p className="font-medium">{workout.distance.toFixed(2)} km</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">시간</p>
                      <p className="font-medium">{formatDuration(workout.duration)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">페이스</p>
                      <p className="font-medium">{calculatePace(workout.distance, workout.duration)} /km</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <CommentSection postId={postId} />
      </div>

      <div className="flex justify-center">
        <button onClick={() => navigate(-1)} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          목록으로
        </button>
      </div>
    </div>
  );
}
