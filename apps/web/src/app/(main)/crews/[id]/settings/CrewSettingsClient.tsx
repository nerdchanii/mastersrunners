"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import CrewForm from "@/components/crew/CrewForm";
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

interface BannedUser {
  id: string;
  userId: string;
  reason: string | null;
  createdAt: string;
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

type SettingsTab = "edit" | "members" | "bans";

export default function CrewSettingsClient() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const crewId = params.id as string;

  const [crew, setCrew] = useState<CrewDetail | null>(null);
  const [bans, setBans] = useState<BannedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("edit");

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

  const fetchBans = useCallback(async () => {
    if (!crewId || crewId === "_") return;
    try {
      const data = await api.fetch<BannedUser[]>(`/crews/${crewId}/bans`);
      setBans(data);
    } catch {
      // Bans may fail if user isn't authorized; ignore silently
    }
  }, [crewId]);

  useEffect(() => {
    fetchCrew();
  }, [fetchCrew]);

  useEffect(() => {
    if (activeTab === "bans") {
      fetchBans();
    }
  }, [activeTab, fetchBans]);

  // Access control
  const currentMember = crew?.members.find((m) => m.userId === user?.id);
  const currentUserRole = currentMember?.role ?? null;
  const isOwner = currentUserRole === "OWNER";
  const isOwnerOrAdmin =
    currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  const handleEditSubmit = async (data: {
    name: string;
    description?: string;
    isPublic: boolean;
    maxMembers?: number;
  }) => {
    setIsSubmitting(true);
    try {
      await api.fetch(`/crews/${crewId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      await fetchCrew();
      alert("크루 정보가 수정되었습니다.");
    } catch (err) {
      setIsSubmitting(false);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "정말 크루를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    )
      return;
    setIsDeleting(true);
    try {
      await api.fetch(`/crews/${crewId}`, { method: "DELETE" });
      router.push("/crews");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "삭제에 실패했습니다."
      );
      setIsDeleting(false);
    }
  };

  const handleKick = async (userId: string, userName: string) => {
    const reason = prompt(`${userName}님을 추방하는 이유를 입력해주세요.`);
    if (reason === null) return; // cancelled
    try {
      await api.fetch(`/crews/${crewId}/members/${userId}`, {
        method: "DELETE",
        body: JSON.stringify({ reason: reason || undefined }),
      });
      await fetchCrew();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "추방에 실패했습니다."
      );
    }
  };

  const handlePromote = async (userId: string) => {
    if (!confirm("이 멤버를 관리자로 승격하시겠습니까?")) return;
    try {
      await api.fetch(`/crews/${crewId}/members/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: "ADMIN" }),
      });
      await fetchCrew();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "승격에 실패했습니다."
      );
    }
  };

  const handleDemote = async (userId: string) => {
    if (!confirm("이 관리자를 일반 멤버로 강등하시겠습니까?")) return;
    try {
      await api.fetch(`/crews/${crewId}/members/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: "MEMBER" }),
      });
      await fetchCrew();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "강등에 실패했습니다."
      );
    }
  };

  const handleUnban = async (userId: string) => {
    if (!confirm("이 사용자의 차단을 해제하시겠습니까?")) return;
    try {
      await api.fetch(`/crews/${crewId}/bans/${userId}`, {
        method: "DELETE",
      });
      await fetchBans();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "차단 해제에 실패했습니다."
      );
    }
  };

  if (!crewId || crewId === "_") {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-gray-500">크루 ID가 필요합니다.</p>
        <button
          onClick={() => router.push("/crews")}
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
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-24 bg-gray-200 rounded" />
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
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!isOwnerOrAdmin) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-gray-500">설정 페이지에 접근할 권한이 없습니다.</p>
        <button
          onClick={() => router.push(`/crews/${crewId}`)}
          className="mt-4 text-indigo-600 hover:underline"
        >
          크루 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">크루 설정</h1>
          <p className="mt-1 text-sm text-gray-600">{crew.name}</p>
        </div>
        <button
          onClick={() => router.push(`/crews/${crewId}`)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          돌아가기
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab("edit")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "edit"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            기본 정보
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "members"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            멤버 관리
          </button>
          <button
            onClick={() => setActiveTab("bans")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "bans"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            차단 목록
          </button>
        </nav>
      </div>

      {/* Edit Tab */}
      {activeTab === "edit" && (
        <div className="space-y-6">
          <CrewForm
            initialValues={{
              name: crew.name,
              description: crew.description,
              isPublic: crew.isPublic,
              maxMembers: crew.maxMembers,
            }}
            onSubmit={handleEditSubmit}
            onCancel={() => router.push(`/crews/${crewId}`)}
            submitLabel="수정하기"
            isSubmitting={isSubmitting}
          />

          {/* Danger Zone */}
          {isOwner && (
            <div className="border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                위험 구역
              </h3>
              <p className="text-sm text-red-600 mb-4">
                크루를 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
              </p>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "삭제 중..." : "크루 삭제"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            멤버 관리 ({crew._count.members}명)
          </h2>
          <CrewMemberList
            members={crew.members}
            currentUserId={user?.id}
            currentUserRole={currentUserRole}
            onKick={handleKick}
            onPromote={handlePromote}
            onDemote={handleDemote}
          />
        </div>
      )}

      {/* Bans Tab */}
      {activeTab === "bans" && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            차단 목록
          </h2>
          {bans.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">
              차단된 사용자가 없습니다.
            </p>
          ) : (
            <div className="space-y-2">
              {bans.map((ban) => (
                <div
                  key={ban.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {ban.user.profileImage ? (
                        <img
                          src={ban.user.profileImage}
                          alt={ban.user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 font-semibold text-sm">
                          {ban.user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {ban.user.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>
                          {new Date(ban.createdAt).toLocaleDateString("ko-KR")}{" "}
                          차단
                        </span>
                        {ban.reason && (
                          <>
                            <span>|</span>
                            <span>사유: {ban.reason}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnban(ban.userId)}
                    className="px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded hover:bg-indigo-100"
                  >
                    차단 해제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
