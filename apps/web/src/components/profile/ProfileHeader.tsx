import { MessageCircle, Settings } from "lucide-react";
import { Link } from "react-router-dom";

import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
    backgroundImage?: string | null;
    bio?: string | null;
    pb5kSeconds?: number | null;
    pb10kSeconds?: number | null;
    pbHalfMarathonSeconds?: number | null;
    pbMarathonSeconds?: number | null;
  };
  isOwnProfile: boolean;
  isFollowing?: boolean;
  isPending?: boolean;
  isPrivate?: boolean;
  stats?: {
    postCount: string | number;
    followerCount: string | number;
    followingCount: string | number;
    workoutCount?: string | number;
    crewCount?: string | number;
  };
  crews?: Array<{
    id: string;
    name: string;
  }>;
  followerPreviewUsers?: Array<{
    id: string;
    name: string;
    profileImage: string | null;
  }>;
  onFollowToggle?: () => void;
  onMessageClick?: () => void;
  isFollowLoading?: boolean;
  isMessageLoading?: boolean;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

export function ProfileHeader({
  user,
  isOwnProfile,
  isFollowing,
  isPending,
  isPrivate,
  stats,
  crews = [],
  followerPreviewUsers = [],
  onFollowToggle,
  onMessageClick,
  isFollowLoading,
  isMessageLoading,
  onFollowersClick,
}: ProfileHeaderProps) {
  const getFollowButtonText = () => {
    if (isPending) return "요청됨";
    if (isFollowing) return "팔로잉";
    if (isPrivate && !isFollowing) return "팔로우 요청";
    return "팔로우";
  };

  const getFollowButtonVariant = () => {
    if (isFollowing || isPending) return "outline" as const;
    return "default" as const;
  };

  const personalBests = [
    { label: "5K", value: user.pb5kSeconds },
    { label: "10K", value: user.pb10kSeconds },
    { label: "21K", value: user.pbHalfMarathonSeconds },
    { label: "42K", value: user.pbMarathonSeconds },
  ].filter((item) => item.value != null);

  return (
    <section data-testid="profile-header" className="border-b border-border/60 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-start gap-4 sm:gap-5">
              <div data-testid="profile-header-avatar" className="shrink-0">
                <UserAvatar
                  user={user}
                  size="xl"
                  linkToProfile={false}
                  className="size-24 border border-border/60 bg-muted sm:size-28"
                />
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <div className="space-y-1">
                  <h1 className="truncate text-sm font-bold tracking-tight text-foreground">
                    {user.name}
                  </h1>
                  {personalBests.length > 0 ? (
                    <div className="text-sm leading-4 text-muted-foreground">
                      <p className="whitespace-pre-line">
                        {personalBests.map((record, index) => (
                          <span key={record.label}>
                            <span className="font-semibold uppercase text-foreground">
                              {record.label}
                            </span>{" "}
                            <span className="tabular-nums text-foreground">
                              {formatDuration(record.value ?? 0)}
                            </span>
                            {index < personalBests.length - 1 ? "\n" : ""}
                          </span>
                        ))}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-1.5 space-y-1.5">
              {user.bio ? (
                <p className="max-w-2xl whitespace-pre-wrap text-sm leading-6 text-muted-foreground sm:text-[15px]">
                  {user.bio}
                </p>
              ) : null}

              {crews.length > 0 ? (
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                  {crews.map((crew) => (
                    <Link
                      key={crew.id}
                      to={`/crews/${crew.id}`}
                      className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      @{crew.name}
                    </Link>
                  ))}
                </div>
              ) : null}

              {stats ? (
                <ProfileFollowerSummary
                  followerCount={stats.followerCount}
                  previewUsers={followerPreviewUsers}
                  onClick={onFollowersClick}
                />
              ) : null}
            </div>
          </div>

          <div className="w-full lg:hidden">
            <ProfileHeaderActions
              isOwnProfile={isOwnProfile}
              isFollowing={isFollowing}
              isPending={isPending}
              isPrivate={isPrivate}
              onFollowToggle={onFollowToggle}
              onMessageClick={onMessageClick}
              isFollowLoading={isFollowLoading}
              isMessageLoading={isMessageLoading}
              getFollowButtonText={getFollowButtonText}
              getFollowButtonVariant={getFollowButtonVariant}
            />
          </div>

          <div className="hidden lg:flex lg:min-h-9 lg:items-center lg:gap-2 lg:justify-end">
            <ProfileHeaderActions
              isOwnProfile={isOwnProfile}
              isFollowing={isFollowing}
              isPending={isPending}
              isPrivate={isPrivate}
              onFollowToggle={onFollowToggle}
              onMessageClick={onMessageClick}
              isFollowLoading={isFollowLoading}
              isMessageLoading={isMessageLoading}
              getFollowButtonText={getFollowButtonText}
              getFollowButtonVariant={getFollowButtonVariant}
              compact
            />
          </div>
        </div>
      </div>
    </section>
  );
}

interface ProfileHeaderActionsProps {
  isOwnProfile: boolean;
  isFollowing?: boolean;
  isPending?: boolean;
  isPrivate?: boolean;
  onFollowToggle?: () => void;
  onMessageClick?: () => void;
  isFollowLoading?: boolean;
  isMessageLoading?: boolean;
  compact?: boolean;
  getFollowButtonText: () => string;
  getFollowButtonVariant: () => "outline" | "default";
}

function ProfileHeaderActions({
  isOwnProfile,
  isFollowing,
  isPending,
  onFollowToggle,
  onMessageClick,
  isFollowLoading,
  isMessageLoading,
  compact = false,
  getFollowButtonText,
  getFollowButtonVariant,
}: ProfileHeaderActionsProps) {
  if (isOwnProfile) {
    return (
      <Button variant="outline" size="sm" asChild className={cn("w-full", compact && "w-auto")}>
        <Link to="/settings/profile">
          <Settings className="size-4" />
          <span>프로필 수정</span>
        </Link>
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "grid w-full gap-2",
        onMessageClick ? "grid-cols-2" : "grid-cols-1",
        compact && "flex w-auto items-center",
      )}
    >
      <Button
        variant={getFollowButtonVariant()}
        size="sm"
        onClick={onFollowToggle}
        disabled={isFollowLoading || isPending}
        className={cn(
          "w-full",
          compact && "min-w-[112px] w-auto",
          isFollowing &&
            "hover:border-destructive hover:bg-destructive hover:text-destructive-foreground",
        )}
      >
        {isFollowLoading ? "처리 중..." : getFollowButtonText()}
      </Button>
      {onMessageClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onMessageClick}
          disabled={isMessageLoading}
          className={cn("w-full", compact && "w-auto")}
        >
          <MessageCircle className="size-4" />
          <span>메시지</span>
        </Button>
      )}
    </div>
  );
}

function ProfileFollowerSummary({
  followerCount,
  previewUsers,
  onClick,
}: {
  followerCount: string | number;
  previewUsers: Array<{
    id: string;
    name: string;
    profileImage: string | null;
  }>;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "mt-2 flex items-center gap-3 text-left text-muted-foreground transition-colors",
        onClick &&
          "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
      )}
    >
      {previewUsers.length > 0 ? (
        <div className="flex -space-x-2">
          {previewUsers.slice(0, 3).map((user) => (
            <div key={user.id} className="rounded-full ring-2 ring-background">
              <UserAvatar user={user} size="sm" linkToProfile={false} />
            </div>
          ))}
        </div>
      ) : null}
      <span className="text-sm text-muted-foreground">
        팔로워 <span className="tabular-nums">{followerCount}</span>명
      </span>
    </button>
  );
}
