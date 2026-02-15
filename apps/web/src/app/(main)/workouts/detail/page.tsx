"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { WorkoutDetail } from "@/components/workout/WorkoutDetail";
import { LikeButton } from "@/components/social/LikeButton";
import { CommentList } from "@/components/social/CommentList";

interface WorkoutData {
  id: string;
  distance: number;
  duration: number;
  pace: number;
  date: string;
  memo: string | null;
  visibility: string;
  liked: boolean;
  likeCount: number;
  commentCount: number;
  user: { id: string; name: string; profileImage: string | null };
  workoutType: { id: string; name: string; category: string } | null;
  shoe: { id: string; brand: string; model: string } | null;
}

function WorkoutDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const [workout, setWorkout] = useState<WorkoutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const workoutId = searchParams.get("id");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.replace("/login"); return; }
    if (!workoutId) return;

    const fetchWorkout = async () => {
      try {
        const data = await api.fetch<WorkoutData>(`/workouts/${workoutId}`);
        setWorkout(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "워크아웃을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkout();
  }, [authLoading, isAuthenticated, router, workoutId]);

  const handleDelete = async () => {
    if (!workoutId || !confirm("이 워크아웃을 삭제하시겠습니까?")) return;
    setIsDeleting(true);
    try {
      await api.fetch(`/workouts/${workoutId}`, { method: "DELETE" });
      router.push("/workouts");
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
      setIsDeleting(false);
    }
  };

  if (!workoutId) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-gray-500">워크아웃 ID가 필요합니다.</p>
        <button onClick={() => router.push("/workouts")} className="mt-4 text-indigo-600 hover:underline">
          워크아웃 목록으로
        </button>
      </div>
    );
  }

  if (authLoading || isLoading) {
    return <div className="flex justify-center items-center min-h-[400px]"><div className="text-gray-500">로딩 중...</div></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
        <div className="text-red-500">{error}</div>
        <button onClick={() => router.back()} className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50">
          돌아가기
        </button>
      </div>
    );
  }

  if (!workout) return null;

  const isOwner = currentUser?.id === workout.user.id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="15 18 9 12 15 6" /></svg>
          <span>돌아가기</span>
        </button>
        {isOwner && (
          <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors">
            {isDeleting ? "삭제 중..." : "삭제"}
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {workout.user.profileImage ? (
              <Image src={workout.user.profileImage} alt={workout.user.name} fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-indigo-600 text-white text-lg font-bold">
                {workout.user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="font-medium text-gray-900">{workout.user.name}</div>
        </div>
      </div>

      <WorkoutDetail distance={workout.distance} duration={workout.duration} pace={workout.pace} date={workout.date} memo={workout.memo} workoutType={workout.workoutType} shoe={workout.shoe} visibility={workout.visibility} />

      <div className="bg-white rounded-lg shadow-sm p-4">
        <LikeButton entityType="workout" entityId={workout.id} initialLiked={workout.liked} initialCount={workout.likeCount} />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">댓글 {workout.commentCount}개</h2>
        <CommentList entityType="workout" entityId={workout.id} />
      </div>
    </div>
  );
}

export default function WorkoutDetailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>}>
      <WorkoutDetailContent />
    </Suspense>
  );
}
