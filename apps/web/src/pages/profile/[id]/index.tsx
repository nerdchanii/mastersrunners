import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { LoadingPage } from "@/components/common/LoadingPage";

interface User {
  id: string;
  email: string;
  name: string;
  profileImage: string | null;
  backgroundImage: string | null;
  bio: string | null;
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  user: User;
}

interface Workout {
  id: string;
  distance: number;
  duration: number;
  pace: number;
  date: string;
  memo: string | null;
  workoutType?: {
    id: string;
    name: string;
  };
}

interface Crew {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  _count: {
    members: number;
  };
}

interface ProfileApiResponse {
  user: User;
  stats: {
    totalWorkouts: number;
    totalDistance: number;
    totalDuration: number;
    averagePace: number;
  };
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

interface ProfileData {
  user: User;
  isFollowing: boolean;
  isPending: boolean;
  isPrivate: boolean;
}

interface ProfileStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
  workoutCount: number;
}

export default function UserProfilePage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const userId = params.id as string;

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTabDataLoading, setIsTabDataLoading] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    if (!userId || userId === "_") return;

    if (currentUser?.id === userId) {
      navigate("/profile", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await api.fetch<ProfileApiResponse>(`/profile/${userId}`);
        if (!data) return;
        setProfileData({
          user: data.user,
          isFollowing: data.isFollowing ?? false,
          isPending: false, // TODO: API에서 pending 상태 반환 필요
          isPrivate: false, // TODO: API에서 isPrivate 반환 필요
        });
        setProfileStats({
          postCount: 0, // TODO: 포스트 카운트 API 추가 필요
          followerCount: data.followersCount,
          followingCount: data.followingCount,
          workoutCount: data.stats.totalWorkouts,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "프로필을 불러오는데 실패했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [authLoading, isAuthenticated, userId, currentUser?.id, navigate]);

  useEffect(() => {
    if (!userId || !profileData || !profileStats) return;

    const fetchTabData = async () => {
      setIsTabDataLoading(true);
      try {
        if (activeTab === "posts") {
          const data = await api.fetch<Post[]>(`/posts?userId=${userId}&limit=12`);
          setPosts(Array.isArray(data) ? data : []);
        } else if (activeTab === "workouts") {
          const data = await api.fetch<Workout[]>(`/workouts?userId=${userId}&limit=20`);
          setWorkouts(Array.isArray(data) ? data : []);
        } else if (activeTab === "crews") {
          const data = await api.fetch<{ data: Crew[] }>(`/crews?userId=${userId}`);
          setCrews(data?.data ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch tab data:", err);
      } finally {
        setIsTabDataLoading(false);
      }
    };

    fetchTabData();
  }, [activeTab, userId, profileData, profileStats]);

  const handleFollowToggle = async () => {
    if (!profileData || isFollowLoading || profileData.isPending) return;

    setIsFollowLoading(true);
    try {
      if (profileData.isFollowing) {
        await api.fetch(`/follow/${userId}`, { method: "DELETE" });
        setProfileData({
          ...profileData,
          isFollowing: false,
        });
        if (profileStats) {
          setProfileStats({
            ...profileStats,
            followerCount: Math.max(0, profileStats.followerCount - 1),
          });
        }
      } else {
        await api.fetch(`/follow/${userId}`, { method: "POST" });
        const newState = profileData.isPrivate
          ? { isFollowing: false, isPending: true }
          : { isFollowing: true, isPending: false };
        setProfileData({
          ...profileData,
          ...newState,
        });
        if (profileStats && !profileData.isPrivate) {
          setProfileStats({
            ...profileStats,
            followerCount: profileStats.followerCount + 1,
          });
        }
      }
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleMessageClick = () => {
    navigate(`/messages/${userId}`);
  };

  const handleFollowersClick = () => {
    navigate(`/profile/${userId}/followers`);
  };

  const handleFollowingClick = () => {
    navigate(`/profile/${userId}/following`);
  };

  if (!userId || userId === "_") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">사용자 ID가 필요합니다.</p>
        </div>
      </div>
    );
  }

  if (authLoading || isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingPage variant="profile" />
      </div>
    );
  }

  if (error || !profileData || !profileStats) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-xl border border-destructive bg-destructive/10 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">오류</h2>
          <p className="text-destructive/90">
            {error || "프로필을 찾을 수 없습니다."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProfileHeader
        user={profileData.user}
        stats={profileStats}
        isOwnProfile={false}
        isFollowing={profileData.isFollowing}
        isPending={profileData.isPending}
        isPrivate={profileData.isPrivate}
        onFollowToggle={handleFollowToggle}
        onMessageClick={handleMessageClick}
        onFollowersClick={handleFollowersClick}
        onFollowingClick={handleFollowingClick}
        isFollowLoading={isFollowLoading}
      />

      <ProfileTabs
        posts={posts}
        workouts={workouts}
        crews={crews}
        isLoading={isTabDataLoading}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
