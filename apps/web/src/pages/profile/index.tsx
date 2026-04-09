import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { LoadingPage } from "@/components/common/LoadingPage";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { useAuth } from "@/lib/auth-context";

import {
  fetchCrewPostsFromCrews,
  fetchMyFollowersPreview,
  fetchMyProfile,
  fetchMyProfileCrews,
  fetchMyProfilePosts,
  fetchMyProfileWorkouts,
  type FollowUserPreview,
  type ProfileCrewPost,
} from "./profile-api";

interface Post {
  id: string;
  content: string;
  createdAt: string;
  likesCount?: number;
  commentsCount?: number;
  _count?: {
    likes: number;
    comments: number;
  };
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface Workout {
  id: string;
  distance: number;
  duration: number;
  pace: number;
  date: string;
  memo: string | null;
  user?: {
    id: string;
    name: string;
    profileImage: string | null;
  };
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
  user: {
    id: string;
    email: string;
    name: string;
    profileImage: string | null;
    backgroundImage: string | null;
    bio: string | null;
    createdAt: string;
    isPrivate: boolean;
  };
  stats: {
    postCount: number;
    totalWorkouts: number;
    totalDistance: number;
    totalDuration: number;
    averagePace: number;
  };
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
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

  const [profileUser, setProfileUser] = useState<ProfileApiResponse["user"] | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [crewPosts, setCrewPosts] = useState<ProfileCrewPost[]>([]);
  const [followerPreviewUsers, setFollowerPreviewUsers] = useState<FollowUserPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTabDataLoading, setIsTabDataLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      try {
        const [data, membershipCrews, followerPreview] = await Promise.all([
          fetchMyProfile(),
          fetchMyProfileCrews(),
          fetchMyFollowersPreview(),
        ]);
        if (!data) return;
        setProfileUser(data.user);
        setCrews(membershipCrews);
        setFollowerPreviewUsers(followerPreview);
        setProfileStats({
          postCount: data.stats.postCount ?? 0,
          followerCount: data.followersCount,
          followingCount: data.followingCount,
          workoutCount: data.stats.totalWorkouts,
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [authLoading, isAuthenticated, user?.id, navigate]);

  useEffect(() => {
    if (!user?.id || !profileStats) return;

    const fetchTabData = async () => {
      setIsTabDataLoading(true);
      try {
        if (activeTab === "posts") {
          const data = await fetchMyProfilePosts(user.id);
          setPosts(data);
        } else if (activeTab === "workouts") {
          const data = await fetchMyProfileWorkouts(user.id);
          setWorkouts(data);
        } else if (activeTab === "crews") {
          const data = await fetchCrewPostsFromCrews(crews);
          setCrewPosts(data);
        }
      } catch (err) {
        console.error("Failed to fetch tab data:", err);
      } finally {
        setIsTabDataLoading(false);
      }
    };

    fetchTabData();
  }, [activeTab, crews, user?.id, profileStats]);

  const handleFollowersClick = () => {
    if (!user?.id) return;
    navigate(`/profile/${user.id}/connections?tab=followers`);
  };

  const handleFollowingClick = () => {
    if (!user?.id) return;
    navigate(`/profile/${user.id}/connections?tab=following`);
  };

  if (authLoading || isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <LoadingPage variant="profile" />
      </div>
    );
  }

  if (!user || !profileStats) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">프로필을 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-4 space-y-5 pb-8 md:mx-auto md:max-w-4xl md:px-4">
      <ProfileHeader
        user={profileUser || user}
        isOwnProfile={true}
        stats={profileStats}
        crews={crews}
        followerPreviewUsers={followerPreviewUsers}
        onFollowersClick={handleFollowersClick}
        onFollowingClick={handleFollowingClick}
      />

      <ProfileTabs
        posts={posts}
        workouts={workouts.map((workout) => ({
          ...workout,
          user: profileUser || user,
        }))}
        crews={crews}
        crewPosts={crewPosts}
        isLoading={isTabDataLoading}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        desktopStickyTopOffset={56}
      />
    </div>
  );
}
