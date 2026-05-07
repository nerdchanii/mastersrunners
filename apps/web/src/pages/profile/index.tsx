import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { LoadingPage } from "@/components/common/LoadingPage";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { Button } from "@/components/ui/button";
import {
  type ProfileCrewPost,
  type ProfileCrewsTabData,
  type ProfilePost,
  type ProfileTab,
  type ProfileWorkout,
  useProfile,
  useProfileCrews,
  useProfileFollowersPreview,
  useProfileStats,
  useProfileTab,
} from "@/hooks/useProfile";
import { useAuth } from "@/lib/auth-context";

type ProfileContentTab = Extract<ProfileTab, "posts" | "workouts" | "crews">;

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();
  const userId = user?.id ?? "_";
  const canFetchProfile = isAuthenticated && !!user?.id;

  const [activeTab, setActiveTab] = useState<ProfileContentTab>("posts");
  const profileQuery = useProfile({ enabled: canFetchProfile });
  const profileStatsQuery = useProfileStats(userId, { enabled: canFetchProfile });
  const crewsQuery = useProfileCrews(userId, { enabled: canFetchProfile });
  const followerPreviewQuery = useProfileFollowersPreview(userId, { enabled: canFetchProfile });
  const profileTabQuery = useProfileTab(
    userId,
    activeTab,
    activeTab === "posts" ? { limit: 12 } : undefined,
    { enabled: canFetchProfile && !!profileStatsQuery.data },
  );

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleFollowersClick = () => {
    if (!user?.id) return;
    navigate(`/profile/${user.id}/connections?tab=followers`);
  };

  const handleFollowingClick = () => {
    if (!user?.id) return;
    navigate(`/profile/${user.id}/connections?tab=following`);
  };

  const isRequiredProfileLoading =
    canFetchProfile &&
    (profileQuery.isPending ||
      profileStatsQuery.isPending ||
      (crewsQuery.isPending && !crewsQuery.isError) ||
      (followerPreviewQuery.isPending && !followerPreviewQuery.isError));

  if (authLoading || isRequiredProfileLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <LoadingPage variant="profile" />
      </div>
    );
  }

  const profileUser = profileQuery.data?.user;
  const profileStats = profileStatsQuery.data;

  if (!user || !profileUser || !profileStats) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">프로필을 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const crews = crewsQuery.data ?? [];
  const followerPreviewUsers = followerPreviewQuery.data ?? [];
  const tabData = profileTabQuery.data;
  const crewTabData = isProfileCrewsTabData(tabData) ? tabData : null;
  const posts = activeTab === "posts" && Array.isArray(tabData) ? (tabData as ProfilePost[]) : [];
  const workouts =
    activeTab === "workouts" && Array.isArray(tabData) ? (tabData as ProfileWorkout[]) : [];
  const crewPosts: ProfileCrewPost[] = activeTab === "crews" ? (crewTabData?.crewPosts ?? []) : [];

  return (
    <div className="space-y-5 pb-8 md:mx-auto md:max-w-4xl md:px-4">
      <ProfileHeader
        user={profileUser}
        isOwnProfile={true}
        stats={profileStats}
        crews={crews}
        followerPreviewUsers={followerPreviewUsers}
        onFollowersClick={handleFollowersClick}
        onFollowingClick={handleFollowingClick}
      />

      <ProfileAuxiliaryNotices
        crewsError={crewsQuery.isError}
        followerPreviewError={followerPreviewQuery.isError}
        onRetryCrews={() => void crewsQuery.refetch()}
        onRetryFollowerPreview={() => void followerPreviewQuery.refetch()}
      />

      <ProfileTabs
        posts={posts}
        workouts={workouts.map((workout) => ({
          ...workout,
          user: profileUser,
        }))}
        crews={crews}
        crewPosts={crewPosts}
        isLoading={profileTabQuery.isPending || profileTabQuery.isFetching}
        error={profileTabQuery.isError ? "탭 콘텐츠를 불러오지 못했습니다." : null}
        onRetry={() => void profileTabQuery.refetch()}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(toProfileContentTab(tab))}
        desktopStickyTopOffset={56}
      />
    </div>
  );
}

function isProfileCrewsTabData(data: unknown): data is ProfileCrewsTabData {
  return typeof data === "object" && data !== null && "crewPosts" in data;
}

function toProfileContentTab(tab: string): ProfileContentTab {
  return tab === "workouts" || tab === "crews" ? tab : "posts";
}

function ProfileAuxiliaryNotices({
  crewsError,
  followerPreviewError,
  onRetryCrews,
  onRetryFollowerPreview,
}: {
  crewsError: boolean;
  followerPreviewError: boolean;
  onRetryCrews: () => void;
  onRetryFollowerPreview: () => void;
}) {
  if (!crewsError && !followerPreviewError) {
    return null;
  }

  return (
    <div className="space-y-2 px-4 sm:px-6" aria-label="프로필 보조 정보 오류">
      {crewsError ? (
        <ProfileAuxiliaryNotice message="크루 정보를 불러오지 못했습니다." onRetry={onRetryCrews} />
      ) : null}
      {followerPreviewError ? (
        <ProfileAuxiliaryNotice
          message="팔로워 미리보기를 불러오지 못했습니다."
          onRetry={onRetryFollowerPreview}
        />
      ) : null}
    </div>
  );
}

function ProfileAuxiliaryNotice({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
      <p>{message}</p>
      <Button type="button" variant="outline" size="xs" onClick={onRetry}>
        다시 시도
      </Button>
    </div>
  );
}
