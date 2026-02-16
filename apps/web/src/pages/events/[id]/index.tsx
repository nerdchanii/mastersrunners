
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import EventResultsTable from "@/components/event/EventResultsTable";

interface EventUser {
  id: string;
  name: string;
  profileImage: string | null;
}

interface EventDetail {
  id: string;
  name: string;
  description: string | null;
  date: string;
  location: string | null;
  maxParticipants: number | null;
  createdBy: string;
  creator?: EventUser;
  _count?: { participants: number };
  isRegistered?: boolean;
}

interface EventResult {
  resultRank: number | null;
  bibNumber: string | null;
  resultTime: number | null;
  status: string;
  user: EventUser;
  workoutId?: string | null;
}

interface MyResult {
  resultRank: number | null;
  bibNumber: string | null;
  resultTime: number | null;
  status: string;
  workoutId: string | null;
}

type DetailTab = "info" | "results";

export default function EventDetailClient() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [results, setResults] = useState<EventResult[]>([]);
  const [myResult, setMyResult] = useState<MyResult | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("info");
  const [isLoading, setIsLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Result input state
  const [showResultForm, setShowResultForm] = useState(false);
  const [resultTime, setResultTime] = useState("");
  const [resultRank, setResultRank] = useState("");
  const [resultBib, setResultBib] = useState("");
  const [resultStatus, setResultStatus] = useState("COMPLETED");

  // Workout link state
  const [showWorkoutLink, setShowWorkoutLink] = useState(false);
  const [workoutId, setWorkoutId] = useState("");

  useEffect(() => {
    if (!eventId || eventId === "_") return;
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    if (activeTab === "results" && eventId && eventId !== "_") {
      fetchResults();
    }
  }, [activeTab, eventId]);

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      const data = await api.fetch<EventDetail>(`/events/${eventId}`);
      setEvent(data);

      // Fetch my result
      try {
        const my = await api.fetch<MyResult>(`/events/${eventId}/results/me`);
        setMyResult(my);
      } catch {
        // No result yet
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "대회 정보를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      setResultsLoading(true);
      const data = await api.fetch<EventResult[]>(`/events/${eventId}/results`);
      setResults(data);
    } catch {
      // silently fail
    } finally {
      setResultsLoading(false);
    }
  };

  const handleRegister = async () => {
    setActionLoading(true);
    try {
      await api.fetch(`/events/${eventId}/register`, { method: "POST" });
      await fetchEvent();
    } catch (err) {
      alert(err instanceof Error ? err.message : "참가 등록에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("참가를 취소하시겠습니까?")) return;
    setActionLoading(true);
    try {
      await api.fetch(`/events/${eventId}/cancel`, { method: "DELETE" });
      await fetchEvent();
      setMyResult(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "참가 취소에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirm("대회를 삭제하시겠습니까?")) return;
    try {
      await api.fetch(`/events/${eventId}`, { method: "DELETE" });
      navigate("/events");
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const body: Record<string, unknown> = { status: resultStatus };
      if (resultTime) {
        const parts = resultTime.split(":").map(Number);
        let seconds = 0;
        if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
        body.resultTime = seconds;
      }
      if (resultRank) body.resultRank = Number(resultRank);
      if (resultBib) body.bibNumber = resultBib;

      await api.fetch(`/events/${eventId}/results`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      setShowResultForm(false);
      await fetchEvent();
      if (activeTab === "results") await fetchResults();
    } catch (err) {
      alert(err instanceof Error ? err.message : "결과 등록에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLinkWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutId.trim()) return;
    setActionLoading(true);
    try {
      await api.fetch(`/events/${eventId}/link-workout`, {
        method: "POST",
        body: JSON.stringify({ workoutId: workoutId.trim() }),
      });
      setShowWorkoutLink(false);
      setWorkoutId("");
      await fetchEvent();
    } catch (err) {
      alert(err instanceof Error ? err.message : "워크아웃 연결에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlinkWorkout = async () => {
    setActionLoading(true);
    try {
      await api.fetch(`/events/${eventId}/link-workout`, { method: "DELETE" });
      await fetchEvent();
    } catch (err) {
      alert(err instanceof Error ? err.message : "워크아웃 연결 해제에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  // Placeholder guard
  if (!eventId || eventId === "_") {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-gray-500">대회 ID가 필요합니다.</p>
        <button onClick={() => navigate("/events")} className="mt-4 text-indigo-600 hover:underline">
          대회 목록으로 돌아가기
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

  if (error || !event) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">오류</h2>
          <p className="text-red-600">{error || "대회를 찾을 수 없습니다."}</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === event.createdBy;
  const isPast = new Date(event.date) < new Date();
  const participantCount = event._count?.participants ?? 0;
  const isFull = event.maxParticipants != null && participantCount >= event.maxParticipants;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPast ? "bg-gray-100 text-gray-700" : "bg-green-100 text-green-700"}`}>
              {isPast ? "종료" : "예정"}
            </span>
            {event.isRegistered && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                참가 등록 완료
              </span>
            )}
          </div>
        </div>
        {isOwner && (
          <button
            onClick={handleDeleteEvent}
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
          대회 정보
        </button>
        <button
          onClick={() => setActiveTab("results")}
          className={`px-4 py-2 font-semibold transition-colors ${activeTab === "results" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-600 hover:text-gray-900"}`}
        >
          결과
        </button>
      </div>

      {/* Info Tab */}
      {activeTab === "info" && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            {event.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">설명</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">날짜</h3>
                <p className="text-gray-900">{formatDate(event.date)}</p>
              </div>

              {event.location && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">장소</h3>
                  <p className="text-gray-900">{event.location}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">참가자</h3>
                <p className="text-gray-900">
                  {participantCount}명
                  {event.maxParticipants ? ` / ${event.maxParticipants}명` : ""}
                </p>
              </div>

              {event.creator && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">등록자</h3>
                  <p className="text-gray-900">{event.creator.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Register / Cancel Buttons */}
          {!isOwner && (
            <div className="flex gap-3">
              {event.isRegistered ? (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 disabled:opacity-50"
                >
                  {actionLoading ? "처리 중..." : "참가 취소"}
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={actionLoading || isPast || isFull}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  {actionLoading ? "처리 중..." : isFull ? "정원 마감" : "참가 등록"}
                </button>
              )}
            </div>
          )}

          {/* My Result Section */}
          {event.isRegistered && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">내 결과</h3>
              {myResult ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">순위</span>
                      <p className="font-semibold text-gray-900">{myResult.resultRank ?? "-"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">배번</span>
                      <p className="font-semibold text-gray-900">{myResult.bibNumber || "-"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">기록</span>
                      <p className="font-semibold text-gray-900">
                        {myResult.resultTime != null
                          ? (() => {
                              const h = Math.floor(myResult.resultTime / 3600);
                              const m = Math.floor((myResult.resultTime % 3600) / 60);
                              const s = myResult.resultTime % 60;
                              return h > 0
                                ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
                                : `${m}:${s.toString().padStart(2, "0")}`;
                            })()
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">상태</span>
                      <p className="font-semibold text-gray-900">
                        {myResult.status === "COMPLETED" ? "완주" : myResult.status}
                      </p>
                    </div>
                  </div>

                  {/* Workout Link */}
                  <div className="pt-3 border-t border-gray-200">
                    {myResult.workoutId ? (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">워크아웃 연결됨</span>
                        <button
                          onClick={handleUnlinkWorkout}
                          disabled={actionLoading}
                          className="text-sm text-red-600 hover:text-red-700 underline disabled:opacity-50"
                        >
                          연결 해제
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowWorkoutLink(!showWorkoutLink)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 underline"
                      >
                        워크아웃 연결
                      </button>
                    )}
                  </div>

                  {showWorkoutLink && (
                    <form onSubmit={handleLinkWorkout} className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={workoutId}
                        onChange={(e) => setWorkoutId(e.target.value)}
                        placeholder="워크아웃 ID"
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                      />
                      <button
                        type="submit"
                        disabled={actionLoading || !workoutId.trim()}
                        className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        연결
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div>
                  {!showResultForm ? (
                    <button
                      onClick={() => setShowResultForm(true)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 underline"
                    >
                      결과 등록하기
                    </button>
                  ) : (
                    <form onSubmit={handleSubmitResult} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">기록 (HH:MM:SS)</label>
                          <input
                            type="text"
                            value={resultTime}
                            onChange={(e) => setResultTime(e.target.value)}
                            placeholder="1:30:00"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">순위</label>
                          <input
                            type="number"
                            value={resultRank}
                            onChange={(e) => setResultRank(e.target.value)}
                            min="1"
                            placeholder="선택"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">배번</label>
                          <input
                            type="text"
                            value={resultBib}
                            onChange={(e) => setResultBib(e.target.value)}
                            placeholder="선택"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">상태</label>
                          <select
                            value={resultStatus}
                            onChange={(e) => setResultStatus(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                          >
                            <option value="COMPLETED">완주</option>
                            <option value="DNF">DNF</option>
                            <option value="DNS">DNS</option>
                            <option value="DSQ">실격</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {actionLoading ? "등록 중..." : "결과 등록"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowResultForm(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          취소
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results Tab */}
      {activeTab === "results" && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">대회 결과</h3>
          <EventResultsTable results={results} isLoading={resultsLoading} />
        </div>
      )}

      {/* Back button */}
      <div className="flex justify-center">
        <button onClick={() => navigate("/events")} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          목록으로
        </button>
      </div>
    </div>
  );
}
