import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AuthGateDialog } from "@/components/common/AuthGateDialog";
import { LoadingPage } from "@/components/common/LoadingPage";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

import {
  fetchUserCrews,
  fetchUserPosts,
  fetchUserProfile,
  type ProfileApiResponse,
  type ProfileCrew,
  type ProfilePost,
  startConversation,
  toggleFollowUser,
} from "./profile-api";

interface ProfileHeaderStats {
  crewCount?: number;
  followerCount: number;
  followingCount: number;
  postCount: number;
  workoutCount: number;
}

export default function UserProfilePage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const userId = params.id as string;

  const [profileData, setProfileData] = useState<ProfileApiResponse | null>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [crews, setCrews] = useState<ProfileCrew[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTabDataLoading, setIsTabDataLoading] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authDialogTitle, setAuthDialogTitle] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!userId || userId === "_") return;

    if (currentUser?.id === userId) {
      navigate("/profile", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await fetchUserProfile(userId);
        setProfileData(data);
        setActiveTab("posts");
      } catch (err) {
        setError(err instanceof Error ? err.message : "프로필을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProfile();
  }, [authLoading, currentUser?.id, navigate, userId]);

  useEffect(() => {
    if (!userId || !profileData || profileData.accessLevel !== "FULL") {
      return;
    }

    const fetchTabData = async () => {
      setIsTabDataLoading(true);
      try {
        if (activeTab === "posts") {
          const data = await fetchUserPosts(userId);
          setPosts(data);
        } else if (activeTab === "crews") {
          const data = await fetchUserCrews(userId);
          setCrews(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "프로필 목록을 불러오지 못했습니다.");
      } finally {
        setIsTabDataLoading(false);
      }
    };

    void fetchTabData();
  }, [activeTab, profileData, userId]);

  const handleFollowToggle = async () => {
    if (!profileData || isFollowLoading || profileData.isPending) return;
    if (!isAuthenticated) {
      setAuthDialogTitle(profileData.isPrivate ? "팔로우 요청" : "팔로우");
      return;
    }

    setIsFollowLoading(true);
    try {
      const wasFollowing = !!profileData.isFollowing;
      await toggleFollowUser(userId, wasFollowing);

      setProfileData((prev) => {
        if (!prev) return prev;

        const nextFollowing = wasFollowing ? false : !prev.isPrivate;
        const nextPending = wasFollowing ? false : !!prev.isPrivate;
        const followerDelta = wasFollowing ? -1 : prev.isPrivate ? 0 : 1;

        return {
          ...prev,
          isFollowing: nextFollowing,
          isPending: nextPending,
          followersCount:
            prev.followersCount === null ? null : Math.max(0, prev.followersCount + followerDelta),
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "팔로우 상태를 바꾸지 못했습니다.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleMessageClick = async () => {
    if (!profileData) return;
    if (!isAuthenticated) {
      setAuthDialogTitle("메시지 보내기");
      return;
    }
    if (isMessageLoading) return;

    setIsMessageLoading(true);
    try {
      const conversation = await startConversation(userId);
      if (!conversation?.id) {
        throw new Error("대화를 시작할 수 없습니다.");
      }
      navigate(`/messages/${conversation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "메시지를 시작하지 못했습니다.");
    } finally {
      setIsMessageLoading(false);
    }
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

  if (error || !profileData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-xl border border-destructive bg-destructive/10 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">오류</h2>
          <p className="text-destructive/90">{error || "프로필을 찾을 수 없습니다."}</p>
        </div>
      </div>
    );
  }

  const headerStats: ProfileHeaderStats | undefined =
    profileData.accessLevel === "FULL" &&
    profileData.stats &&
    profileData.followersCount !== null &&
    profileData.followingCount !== null
      ? {
          postCount: profileData.stats.postCount,
          followerCount: profileData.followersCount,
          followingCount: profileData.followingCount,
          workoutCount: 0,
          crewCount: profileData.crewCount ?? 0,
        }
      : undefined;

  const nextPath =
    typeof window === "undefined"
      ? `/profile/${userId}`
      : `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const canShowMessage = profileData.accessLevel === "FULL";

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6 px-4 pb-8">
        <ProfileHeader
          user={profileData.user}
          stats={headerStats}
          isOwnProfile={false}
          isFollowing={profileData.isFollowing}
          isPending={profileData.isPending}
          isPrivate={profileData.isPrivate}
          onFollowToggle={handleFollowToggle}
          onMessageClick={canShowMessage ? handleMessageClick : undefined}
          isFollowLoading={isFollowLoading}
          isMessageLoading={isMessageLoading}
        />

        {profileData.accessLevel === "LOCKED" ? (
          <Card className="border-border/60">
            <CardContent className="flex flex-col gap-3 py-8">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-foreground">
                <Lock className="size-4" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">비공개 프로필입니다</h2>
                <p className="text-sm text-muted-foreground">
                  팔로우가 승인되면 게시글과 크루를 확인할 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ProfileTabs
            posts={posts}
            workouts={[]}
            crews={crews}
            isLoading={isTabDataLoading}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            showWorkoutsTab={false}
            postsEmptyDescription="표시할 게시글이 없습니다."
            crewsEmptyTitle="표시할 크루가 없습니다"
            crewsEmptyDescription="공개로 읽을 수 있는 크루가 없습니다."
          />
        )}
      </div>

      <AuthGateDialog
        open={authDialogTitle !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAuthDialogTitle(null);
          }
        }}
        nextPath={nextPath}
        title={authDialogTitle ?? "로그인"}
      />
    </>
  );
}
