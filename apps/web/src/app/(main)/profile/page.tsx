"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}시간 ${minutes}분 ${secs}초`;
  } else if (minutes > 0) {
    return `${minutes}분 ${secs}초`;
  } else {
    return `${secs}초`;
  }
}

function formatPace(pace: number): string {
  const minutes = Math.floor(pace);
  const seconds = Math.floor((pace - minutes) * 60);
  return `${minutes}'${seconds.toString().padStart(2, "0")}"`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await api.fetch<ProfileData>("/profile");
        setProfileData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "프로필을 불러오는데 실패했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!profileData) return null;

  const { user, stats } = profileData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {user.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-indigo-600 text-white text-3xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600 mt-1">{user.email}</p>
              <p className="text-sm text-gray-500 mt-2">
                가입일: {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">러닝 통계</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              총 러닝 횟수
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalWorkouts}
              <span className="text-lg text-gray-600 ml-1">회</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              총 거리
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalDistance.toFixed(1)}
              <span className="text-lg text-gray-600 ml-1">km</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              총 시간
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatDuration(stats.totalDuration)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              평균 페이스
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.averagePace > 0 ? formatPace(stats.averagePace) : "-"}
              {stats.averagePace > 0 && (
                <span className="text-lg text-gray-600 ml-1">/km</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
