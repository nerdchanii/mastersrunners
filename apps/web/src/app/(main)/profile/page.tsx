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

interface Post {
  id: string;
  content: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
}

interface FollowUser {
  id: string;
  name: string;
  profileImage: string | null;
  bio: string | null;
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
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
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
  const { isLoading: authLoading, isAuthenticated, user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "followers" | "following">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

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

  useEffect(() => {
    if (!profileData) return;

    const fetchTabData = async () => {
      try {
        if (activeTab === "posts") {
          // Fetch user's posts
          const postsData = await api.fetch<{ posts: Post[] }>("/posts");
          setPosts(postsData.posts || []);
        } else if (activeTab === "followers") {
          const followersData = await api.fetch<{ followers: FollowUser[] }>(
            "/follow/followers"
          );
          setFollowers(followersData.followers || []);
        } else if (activeTab === "following") {
          const followingData = await api.fetch<{ following: FollowUser[] }>(
            "/follow/following"
          );
          setFollowing(followingData.following || []);
        }
      } catch (err) {
        console.error("Failed to fetch tab data:", err);
      }
    };

    fetchTabData();
  }, [activeTab, profileData]);

  const handleFollowToggle = async () => {
    if (!profileData || isFollowLoading) return;

    setIsFollowLoading(true);
    try {
      if (profileData.isFollowing) {
        await api.fetch(`/follow/${profileData.user.id}`, { method: "DELETE" });
        setProfileData({
          ...profileData,
          isFollowing: false,
          followersCount: (profileData.followersCount || 0) - 1,
        });
      } else {
        await api.fetch(`/follow/${profileData.user.id}`, { method: "POST" });
        setProfileData({
          ...profileData,
          isFollowing: true,
          followersCount: (profileData.followersCount || 0) + 1,
        });
      }
    } catch (err) {
      console.error("Failed to toggle follow:", err);
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
      router.push("/");
    } catch (err) {
      alert(err instanceof Error ? err.message : "차단에 실패했습니다.");
    }
  };

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
  const isOwnProfile = currentUser?.id === user.id;

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
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <div className="flex gap-4 text-sm">
                  <button
                    onClick={() => setActiveTab("followers")}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    팔로워 <span className="font-semibold">{profileData.followersCount || 0}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("following")}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    팔로잉 <span className="font-semibold">{profileData.followingCount || 0}</span>
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mt-1">{user.email}</p>
              <p className="text-sm text-gray-500 mt-2">
                가입일: {formatDate(user.createdAt)}
              </p>

              {!isOwnProfile && (
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
              )}
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

      {/* Tabs section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 px-6 py-4 text-sm font-medium text-center border-b-2 transition-colors ${
                activeTab === "posts"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              게시글
            </button>
            <button
              onClick={() => setActiveTab("followers")}
              className={`flex-1 px-6 py-4 text-sm font-medium text-center border-b-2 transition-colors ${
                activeTab === "followers"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              팔로워
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={`flex-1 px-6 py-4 text-sm font-medium text-center border-b-2 transition-colors ${
                activeTab === "following"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              팔로잉
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "posts" && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  아직 게시글이 없습니다
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/posts/${post.id}`)}
                  >
                    <p className="text-gray-900 line-clamp-3">{post.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>{formatDate(post.createdAt)}</span>
                      <span>좋아요 {post.likeCount}</span>
                      <span>댓글 {post.commentCount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "followers" && (
            <div className="space-y-3">
              {followers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  팔로워가 없습니다
                </div>
              ) : (
                followers.map((follower) => (
                  <div
                    key={follower.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/profile/${follower.id}`)}
                  >
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {follower.profileImage ? (
                        <Image
                          src={follower.profileImage}
                          alt={follower.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-indigo-600 text-white font-bold">
                          {follower.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{follower.name}</div>
                      {follower.bio && (
                        <p className="text-sm text-gray-500 truncate">{follower.bio}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "following" && (
            <div className="space-y-3">
              {following.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  팔로잉하는 사용자가 없습니다
                </div>
              ) : (
                following.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/profile/${user.id}`)}
                  >
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {user.profileImage ? (
                        <Image
                          src={user.profileImage}
                          alt={user.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-indigo-600 text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      {user.bio && (
                        <p className="text-sm text-gray-500 truncate">{user.bio}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
