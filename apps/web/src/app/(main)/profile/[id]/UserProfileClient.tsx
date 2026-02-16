"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";

interface ProfileStats {
  totalWorkouts: number;
  totalDistance: number;
  totalDuration: number;
  averagePace: number;
}

interface ProfileData {
  user: {
    id: string;
    email: string;
    name: string;
    profileImage: string | null;
    createdAt: string;
  };
  stats: ProfileStats;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}시간 ${minutes}분 ${secs}초`;
  if (minutes > 0) return `${minutes}분 ${secs}초`;
  return `${secs}초`;
}

function formatPace(pace: number): string {
  const minutes = Math.floor(pace);
  const seconds = Math.floor((pace - minutes) * 60);
  return `${minutes}'${seconds.toString().padStart(2, "0")}"`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function UserProfileClient() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const userId = params.id as string;

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!userId || userId === "_") return;

    // Redirect to own profile page
    if (currentUser?.id === userId) {
      router.replace("/profile");
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await api.fetch<ProfileData>(`/profile/${userId}`);
        setProfileData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "프로필을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [authLoading, isAuthenticated, userId, currentUser?.id, router]);

  const handleFollowToggle = async () => {
    if (!profileData || isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      if (profileData.isFollowing) {
        await api.fetch(`/follow/${profileData.user.id}`, { method: "DELETE" });
        setProfileData({
          ...profileData,
          isFollowing: false,
          followersCount: profileData.followersCount - 1,
        });
      } else {
        await api.fetch(`/follow/${profileData.user.id}`, { method: "POST" });
        setProfileData({
          ...profileData,
          isFollowing: true,
          followersCount: profileData.followersCount + 1,
        });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "팔로우 처리에 실패했습니다.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!profileData) return;
    if (!confirm("이 사용자를 차단하시겠습니까?")) return;
    try {
      await api.fetch(`/block/${profileData.user.id}`, { method: "POST" });
      alert("차단되었습니다.");
      router.push("/feed");
    } catch (err) {
      alert(err instanceof Error ? err.message : "차단에 실패했습니다.");
    }
  };

  if (!userId || userId === "_") {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-gray-500">사용자 ID가 필요합니다.</p>
        <button onClick={() => router.push("/feed")} className="mt-4 text-indigo-600 hover:underline">
          피드로 돌아가기
        </button>
      </div>
    );
  }

  if (authLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gray-300" />
            <div className="space-y-3 flex-1">
              <div className="h-6 bg-gray-300 rounded w-1/4" />
              <div className="h-4 bg-gray-300 rounded w-1/3" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">오류</h2>
          <p className="text-red-600">{error || "프로필을 찾을 수 없습니다."}</p>
          <button onClick={() => router.back()} className="mt-4 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const { user, stats } = profileData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {user.profileImage ? (
                <Image src={user.profileImage} alt={user.name} fill className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-indigo-600 text-white text-3xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-600">
                    팔로워 <span className="font-semibold">{profileData.followersCount}</span>
                  </span>
                  <span className="text-gray-600">
                    팔로잉 <span className="font-semibold">{profileData.followingCount}</span>
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                가입일: {formatDate(user.createdAt)}
              </p>

              <div className="flex gap-2 mt-4 justify-center sm:justify-start">
                <button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    profileData.isFollowing
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {isFollowLoading ? "처리 중..." : profileData.isFollowing ? "팔로잉" : "팔로우"}
                </button>
                <button
                  onClick={handleBlock}
                  className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  차단
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">러닝 통계</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">총 러닝 횟수</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalWorkouts}<span className="text-lg text-gray-600 ml-1">회</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">총 거리</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalDistance.toFixed(1)}<span className="text-lg text-gray-600 ml-1">km</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">총 시간</div>
            <div className="text-2xl font-bold text-gray-900">{formatDuration(stats.totalDuration)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">평균 페이스</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.averagePace > 0 ? formatPace(stats.averagePace) : "-"}
              {stats.averagePace > 0 && <span className="text-lg text-gray-600 ml-1">/km</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
