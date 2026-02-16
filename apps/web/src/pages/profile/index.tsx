import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { LoadingPage } from "@/components/common/LoadingPage";

interface User {
  id: string;
  email: string;
  name: string;
  profileImage: string | null;
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

interface ProfileStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
  workoutCount: number;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();

  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTabDataLoading, setIsTabDataLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchProfileStats = async () => {
      try {
        if (!user?.id) return;
        const stats = await api.fetch<ProfileStats>(`/profile/${user.id}/stats`);
        setProfileStats(stats);
      } catch (err) {
        console.error("Failed to fetch profile stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileStats();
  }, [authLoading, isAuthenticated, user?.id, navigate]);

  useEffect(() => {
    if (!user?.id || !profileStats) return;

    const fetchTabData = async () => {
      setIsTabDataLoading(true);
      try {
        if (activeTab === "posts") {
          const data = await api.fetch<Post[]>(`/posts?userId=${user.id}&limit=12`);
          setPosts(Array.isArray(data) ? data : []);
        } else if (activeTab === "workouts") {
          const data = await api.fetch<Workout[]>(`/workouts?userId=${user.id}&limit=20`);
          setWorkouts(Array.isArray(data) ? data : []);
        } else if (activeTab === "crews") {
          const data = await api.fetch<{ data: Crew[] }>("/crews?my=true");
          setCrews(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch tab data:", err);
      } finally {
        setIsTabDataLoading(false);
      }
    };

    fetchTabData();
  }, [activeTab, user?.id, profileStats]);

  const handleFollowersClick = () => {
    if (!user?.id) return;
    navigate(`/profile/${user.id}/followers`);
  };

  const handleFollowingClick = () => {
    if (!user?.id) return;
    navigate(`/profile/${user.id}/following`);
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingPage variant="profile" />
      </div>
    );
  }

  if (!user || !profileStats) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">프로필을 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="rounded-xl border bg-card p-6">
        <ProfileHeader user={user} isOwnProfile={true} />
      </div>

      <div className="rounded-xl border bg-card">
        <ProfileStats
          postCount={profileStats.postCount}
          followerCount={profileStats.followerCount}
          followingCount={profileStats.followingCount}
          onFollowersClick={handleFollowersClick}
          onFollowingClick={handleFollowingClick}
        />
      </div>

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
