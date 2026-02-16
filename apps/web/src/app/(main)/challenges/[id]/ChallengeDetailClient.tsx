"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import ProgressBar from "@/components/challenge/ProgressBar";
import LeaderboardTable from "@/components/challenge/LeaderboardTable";

interface ChallengeUser {
  id: string;
  name: string;
  profileImage: string | null;
}

interface ChallengeDetail {
  id: string;
  name: string;
  description: string | null;
  goalType: string;
  goalValue: number;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  createdBy: string;
  creator?: ChallengeUser;
  _count?: { participants: number };
  isJoined?: boolean;
  myProgress?: number | null;
}

interface LeaderboardEntry {
  rank: number;
  progress: number;
  user: ChallengeUser;
}

function goalTypeLabel(type: string): string {
  switch (type) {
    case "DISTANCE": return "거리";
    case "COUNT": return "횟수";
    case "DURATION": return "일수";
    case "PACE": return "페이스";
    default: return type;
  }
}

function goalTypeUnit(type: string): string {
  switch (type) {
    case "DISTANCE": return "KM";
    case "COUNT": return "COUNT";
    case "DURATION": return "DAYS";
    case "PACE": return "SEC_PER_KM";
    default: return type;
  }
}

function goalTypeDisplayUnit(type: string): string {
  switch (type) {
    case "DISTANCE": return "km";
    case "COUNT": return "회";
    case "DURATION": return "일";
    case "PACE": return "초/km";
    default: return "";
  }
}

type DetailTab = "info" | "leaderboard";

export default function ChallengeDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const challengeId = params.id as string;

  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<DetailTab>("info");
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Progress update state
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [progressValue, setProgressValue] = useState("");

  useEffect(() => {
    if (!challengeId || challengeId === "_") return;
    fetchChallenge();
  }, [challengeId]);

  useEffect(() => {
    if (activeTab === "leaderboard" && challengeId && challengeId !== "_") {
      fetchLeaderboard();
    }
  }, [activeTab, challengeId]);

  const fetchChallenge = async () => {
    try {
      setIsLoading(true);
      const data = await api.fetch<ChallengeDetail>(`/challenges/${challengeId}`);
      setChallenge(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "챌린지 정보를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      const data = await api.fetch<LeaderboardEntry[]>(`/challenges/${challengeId}/leaderboard?limit=50`);
      setLeaderboard(data);
    } catch {
      // silently fail
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      await api.fetch(`/challenges/${challengeId}/join`, { method: "POST" });
      await fetchChallenge();
    } catch (err) {
      alert(err instanceof Error ? err.message : "참가에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("챌린지를 나가시겠습니까?")) return;
    setActionLoading(true);
    try {
      await api.fetch(`/challenges/${challengeId}/leave`, { method: "DELETE" });
      await fetchChallenge();
    } catch (err) {
      alert(err instanceof Error ? err.message : "챌린지 나가기에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteChallenge = async () => {
    if (!confirm("챌린지를 삭제하시겠습니까?")) return;
    try {
      await api.fetch(`/challenges/${challengeId}`, { method: "DELETE" });
      router.push("/challenges");
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressValue || Number(progressValue) < 0) return;
    setActionLoading(true);
    try {
      await api.fetch(`/challenges/${challengeId}/progress`, {
        method: "PATCH",
        body: JSON.stringify({ value: Number(progressValue) }),
      });
      setShowProgressForm(false);
      setProgressValue("");
      await fetchChallenge();
      if (activeTab === "leaderboard") await fetchLeaderboard();
    } catch (err) {
      alert(err instanceof Error ? err.message : "진행도 업데이트에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  // Placeholder guard
  if (!challengeId || challengeId === "_") {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-gray-500">챌린지 ID가 필요합니다.</p>
        <button onClick={() => router.push("/challenges")} className="mt-4 text-indigo-600 hover:underline">
          챌린지 목록으로 돌아가기
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/2" />
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded" />
            <div className="h-4 bg-gray-300 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">오류</h2>
          <p className="text-red-600">{error || "챌린지를 찾을 수 없습니다."}</p>
          <button onClick={() => router.back()} className="mt-4 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === challenge.createdBy;
  const now = new Date();
  const startDate = new Date(challenge.startDate);
  const endDate = new Date(challenge.endDate);
  const isActive = now >= startDate && now <= endDate;
  const isUpcoming = now < startDate;
  const participantCount = challenge._count?.participants ?? 0;

  const statusBadge = () => {
    if (isActive) return { label: "진행 중", className: "bg-green-100 text-green-700" };
    if (isUpcoming) return { label: "예정", className: "bg-blue-100 text-blue-700" };
    return { label: "종료", className: "bg-gray-100 text-gray-700" };
  };

  const badge = statusBadge();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{challenge.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
              {badge.label}
            </span>
            {!challenge.isPublic && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                비공개
              </span>
            )}
            {challenge.isJoined && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                참가 중
              </span>
            )}
          </div>
        </div>
        {isOwner && (
          <button
            onClick={handleDeleteChallenge}
            className="px-3 py-1.5 text-sm text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100"
          >
            삭제
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-4 py-2 font-semibold transition-colors ${activeTab === "info" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-600 hover:text-gray-900"}`}
        >
          챌린지 정보
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`px-4 py-2 font-semibold transition-colors ${activeTab === "leaderboard" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-600 hover:text-gray-900"}`}
        >
          리더보드
        </button>
      </div>

      {/* Info Tab */}
      {activeTab === "info" && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            {challenge.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">설명</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{challenge.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">기간</h3>
                <p className="text-gray-900">{formatDate(challenge.startDate)} ~ {formatDate(challenge.endDate)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">목표</h3>
                <p className="text-gray-900">
                  {goalTypeLabel(challenge.goalType)} {challenge.goalValue} {goalTypeDisplayUnit(challenge.goalType)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">참가자</h3>
                <p className="text-gray-900">{participantCount}명</p>
              </div>

              {challenge.creator && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">만든이</h3>
                  <p className="text-gray-900">{challenge.creator.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Join / Leave */}
          {!isOwner && (
            <div className="flex gap-3">
              {challenge.isJoined ? (
                <button
                  onClick={handleLeave}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 disabled:opacity-50"
                >
                  {actionLoading ? "처리 중..." : "챌린지 나가기"}
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={actionLoading || (!isActive && !isUpcoming)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  {actionLoading ? "처리 중..." : "참가하기"}
                </button>
              )}
            </div>
          )}

          {/* My Progress */}
          {challenge.isJoined && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">내 진행 현황</h3>

              <ProgressBar
                current={challenge.myProgress ?? 0}
                target={challenge.goalValue}
                unit={goalTypeUnit(challenge.goalType)}
                className="mb-4"
              />

              {isActive && (
                <div>
                  {!showProgressForm ? (
                    <button
                      onClick={() => setShowProgressForm(true)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 underline"
                    >
                      진행도 업데이트
                    </button>
                  ) : (
                    <form onSubmit={handleUpdateProgress} className="flex gap-2 mt-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={progressValue}
                          onChange={(e) => setProgressValue(e.target.value)}
                          min="0"
                          step="any"
                          placeholder="새 진행 값"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border pr-12"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 text-xs">{goalTypeDisplayUnit(challenge.goalType)}</span>
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={actionLoading || !progressValue}
                        className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {actionLoading ? "..." : "업데이트"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowProgressForm(false); setProgressValue(""); }}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        취소
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">리더보드</h3>
          <LeaderboardTable
            entries={leaderboard}
            goalValue={challenge.goalValue}
            goalType={challenge.goalType}
            isLoading={leaderboardLoading}
          />
        </div>
      )}

      {/* Back button */}
      <div className="flex justify-center">
        <button onClick={() => router.push("/challenges")} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          목록으로
        </button>
      </div>
    </div>
  );
}
