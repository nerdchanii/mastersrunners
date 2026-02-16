
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import CrewMemberList from "@/components/crew/CrewMemberList";

interface CrewMember {
  id: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  status: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface CrewDetail {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isPublic: boolean;
  maxMembers: number | null;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  members: CrewMember[];
  _count: {
    members: number;
  };
}

export default function CrewDetailClient() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const crewId = params.id as string;

  const [crew, setCrew] = useState<CrewDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const fetchCrew = useCallback(async () => {
    if (!crewId || crewId === "_") return;
    try {
      setIsLoading(true);
      const data = await api.fetch<CrewDetail>(`/crews/${crewId}`);
      setCrew(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "크루를 불러올 수 없습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, [crewId]);

  useEffect(() => {
    fetchCrew();
  }, [fetchCrew]);

  const currentMember = crew?.members.find((m) => m.userId === user?.id);
  const isMember = !!currentMember;
  const currentUserRole = currentMember?.role ?? null;
  const isOwnerOrAdmin =
    currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  const handleJoin = async () => {
    if (!crewId) return;
    setIsJoining(true);
    try {
      await api.fetch(`/crews/${crewId}/join`, { method: "POST" });
      await fetchCrew();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "가입에 실패했습니다."
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!crewId || !confirm("정말 크루를 탈퇴하시겠습니까?")) return;
    setIsLeaving(true);
    try {
      await api.fetch(`/crews/${crewId}/leave`, { method: "DELETE" });
      await fetchCrew();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "탈퇴에 실패했습니다."
      );
    } finally {
      setIsLeaving(false);
    }
  };

  if (!crewId || crewId === "_") {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-gray-500">크루 ID가 필요합니다.</p>
        <button
          onClick={() => navigate("/crews")}
          className="mt-4 text-indigo-600 hover:underline"
        >
          크루 목록으로 돌아가기
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !crew) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">오류</h2>
          <p className="text-red-600">
            {error || "크루를 찾을 수 없습니다."}
          </p>
          <button
            onClick={() => navigate("/crews")}
            className="mt-4 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
          >
            크루 목록으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Crew Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            {crew.imageUrl ? (
              <img
                src={crew.imageUrl}
                alt={crew.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                {crew.name}
              </h1>
              {!crew.isPublic && (
                <svg
                  className="w-5 h-5 text-gray-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              만든이: {crew.creator.name}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                {crew._count.members}명
                {crew.maxMembers && ` / ${crew.maxMembers}명`}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  crew.isPublic
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {crew.isPublic ? "공개" : "비공개"}
              </span>
            </div>
          </div>
        </div>

        {crew.description && (
          <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
            {crew.description}
          </p>
        )}

        <p className="mt-4 text-xs text-gray-400">
          {new Date(crew.createdAt).toLocaleDateString("ko-KR")} 생성
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          {user && !isMember && (
            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {isJoining ? (
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
                  가입 중...
                </>
              ) : (
                "크루 가입"
              )}
            </button>
          )}

          {isMember && currentUserRole !== "OWNER" && (
            <button
              onClick={handleLeave}
              disabled={isLeaving}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 disabled:opacity-50"
            >
              {isLeaving ? "탈퇴 중..." : "크루 탈퇴"}
            </button>
          )}

          {isOwnerOrAdmin && (
            <Link
              to={`/crews/${crewId}/settings`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              설정
            </Link>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          멤버 ({crew._count.members}명)
        </h2>
        <CrewMemberList
          members={crew.members}
          currentUserId={user?.id}
          currentUserRole={currentUserRole}
        />
      </div>

      {/* Back button */}
      <div className="flex justify-center">
        <button
          onClick={() => navigate("/crews")}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          목록으로
        </button>
      </div>
    </div>
  );
}
