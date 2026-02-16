"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

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
  title?: string;
  workoutType?: { name: string };
}

interface PostImage {
  id: string;
  imageUrl: string;
}

interface Post {
  id: string;
  content: string;
  hashtags?: string[];
  visibility: string;
  createdAt: string;
  user: User;
  workouts?: Workout[];
  images?: PostImage[];
}

export default function EditPostClient() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "FOLLOWERS" | "PUBLIC">("PUBLIC");
  const [hashtagsInput, setHashtagsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxChars = 2000;
  const charsLeft = maxChars - content.length;

  const parseHashtags = (input: string): string[] => {
    return input
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  };

  const hashtags = parseHashtags(hashtagsInput);

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

  useEffect(() => {
    if (!postId || postId === "_") {
      router.push("/feed");
      return;
    }

    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const data = await api.fetch<Post>(`/posts/${postId}`);

        // Check ownership
        if (user && data.user.id !== user.id) {
          setError("본인의 게시글만 수정할 수 있습니다.");
          setIsLoading(false);
          return;
        }

        setPost(data);
        setContent(data.content);
        setVisibility(data.visibility as "PRIVATE" | "FOLLOWERS" | "PUBLIC");
        setHashtagsInput(data.hashtags ? data.hashtags.join(", ") : "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "게시글을 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }

    if (content.length > maxChars) {
      setError(`내용은 ${maxChars}자 이내로 입력해주세요.`);
      return;
    }

    setIsSubmitting(true);

    try {
      await api.fetch(`/posts/${postId}`, {
        method: "PATCH",
        body: JSON.stringify({
          content: content.trim(),
          visibility,
          hashtags: hashtags.length > 0 ? hashtags : undefined,
        }),
      });

      router.push(`/posts/${postId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/posts/${postId}`);
  };

  if (!postId || postId === "_") {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4" />
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/6" />
            <div className="h-32 bg-gray-300 rounded" />
            <div className="h-4 bg-gray-300 rounded w-1/6" />
            <div className="h-10 bg-gray-300 rounded" />
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
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">게시글 수정</h1>
        <p className="mt-2 text-sm text-gray-600">
          게시글 내용과 설정을 변경할 수 있습니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            {/* Content Textarea */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                placeholder="무슨 생각을 하고 계신가요?"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              />
              <div className="mt-1 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  마음껏 작성해주세요
                </p>
                <p
                  className={`text-xs ${
                    charsLeft < 100 ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  {charsLeft.toLocaleString()} / {maxChars.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Hashtags Input */}
            <div>
              <label htmlFor="hashtags" className="block text-sm font-medium text-gray-700">
                해시태그 (선택)
              </label>
              <input
                type="text"
                id="hashtags"
                value={hashtagsInput}
                onChange={(e) => setHashtagsInput(e.target.value)}
                placeholder="러닝, 마라톤, 훈련 (쉼표로 구분)"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              />
              {hashtags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
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
            </div>

            {/* Visibility Select */}
            <div>
              <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                공개 설정
              </label>
              <select
                id="visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as "PRIVATE" | "FOLLOWERS" | "PUBLIC")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              >
                <option value="PRIVATE">비공개</option>
                <option value="FOLLOWERS">팔로워 공개</option>
                <option value="PUBLIC">전체 공개</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                누가 이 게시글을 볼 수 있는지 설정합니다.
              </p>
            </div>

            {/* Attached Workouts (Read-only) */}
            {post.workouts && post.workouts.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  첨부된 워크아웃
                </label>
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {post.workouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {workout.title || workout.workoutType?.name || "워크아웃"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(workout.date).toLocaleDateString("ko-KR")}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-1 text-xs text-gray-600">
                          <span>{(workout.distance / 1000).toFixed(2)} km</span>
                          <span>{formatDuration(workout.duration)}</span>
                          <span>{calculatePace(workout.distance / 1000, workout.duration)} /km</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  워크아웃은 수정할 수 없습니다.
                </p>
              </div>
            )}

            {/* Attached Images (Read-only) */}
            {post.images && post.images.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  첨부된 이미지
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {post.images.map((img) => (
                    <div
                      key={img.id}
                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                    >
                      <img
                        src={img.imageUrl}
                        alt="Post attachment"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  이미지는 수정할 수 없습니다.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                저장 중...
              </>
            ) : (
              "저장"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
