import { MessageCircle, MoreHorizontal, Settings } from "lucide-react";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  stats?: {
    postCount: number;
    followerCount: number;
    followingCount: number;
    workoutCount: number;
    crewCount?: number;
  };
  isOwnProfile: boolean;
  isFollowing?: boolean;
  isPending?: boolean;
  isPrivate?: boolean;
  onFollowToggle?: () => void;
  onMessageClick?: () => void;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
  isFollowLoading?: boolean;
  isMessageLoading?: boolean;
}

export function ProfileHeader({
  user,
  stats,
  isOwnProfile,
  isFollowing,
  isPending,
  isPrivate,
  onFollowToggle,
  onMessageClick,
  onFollowersClick,
  onFollowingClick,
  isFollowLoading,
  isMessageLoading,
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

  const initials = user.name.charAt(0).toUpperCase();
  const personalBests = [
    { label: "5K", value: user.pb5kSeconds },
    { label: "10K", value: user.pb10kSeconds },
    { label: "하프", value: user.pbHalfMarathonSeconds },
    { label: "풀", value: user.pbMarathonSeconds },
  ].filter((item) => item.value != null);

  return (
    <section data-testid="profile-header" className="border-b border-border/60 px-4 py-5 sm:px-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Avatar
              data-testid="profile-header-avatar"
              className="size-20 shrink-0 border border-border/60 bg-muted sm:size-24"
            >
              {user.profileImage && <AvatarImage src={user.profileImage} alt={user.name} />}
              <AvatarFallback className="bg-muted text-2xl font-semibold sm:text-3xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 space-y-3 pt-1">
              <div className="space-y-1.5">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {user.name}
                </h1>
                {user.bio ? (
                  <p className="max-w-2xl whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {user.bio}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">아직 자기소개가 없습니다.</p>
                )}
              </div>

              {personalBests.length > 0 ? (
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {personalBests.map((record) => (
                    <div key={record.label} className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        {record.label}
                      </p>
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        {formatDuration(record.value ?? 0)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isOwnProfile ? (
              <Button variant="outline" size="sm" asChild>
                <Link to="/settings/profile">
                  <Settings className="size-4" />
                  <span>프로필 수정</span>
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  variant={getFollowButtonVariant()}
                  size="sm"
                  onClick={onFollowToggle}
                  disabled={isFollowLoading || isPending}
                  className={cn(
                    "min-w-[88px]",
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
                  >
                    <MessageCircle className="size-4" />
                    <span>메시지</span>
                  </Button>
                )}
                <Button variant="ghost" size="icon-sm" aria-label="더보기">
                  <MoreHorizontal className="size-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-4 gap-x-3 gap-y-3 border-t border-border/60 pt-4">
            <ProfileStat label="게시물" value={stats.postCount} />
            <ProfileStat label="팔로워" value={stats.followerCount} onClick={onFollowersClick} />
            <ProfileStat label="팔로잉" value={stats.followingCount} onClick={onFollowingClick} />
            <ProfileStat
              label={stats.crewCount !== undefined ? "크루" : "워크아웃"}
              value={stats.crewCount ?? stats.workoutCount}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function ProfileStat({
  label,
  value,
  onClick,
}: {
  label: string;
  value: number;
  onClick?: () => void;
}) {
  const body = (
    <>
      <span className="text-lg font-semibold tabular-nums text-foreground sm:text-xl">{value}</span>
      <span className="text-[11px] text-muted-foreground sm:text-xs">{label}</span>
    </>
  );

  if (!onClick) {
    return <div className="flex min-w-0 flex-col gap-1">{body}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 flex-col gap-1 text-left transition-opacity hover:opacity-75"
    >
      {body}
    </button>
  );
}
