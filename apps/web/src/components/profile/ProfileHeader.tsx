import { Link } from "react-router-dom";
import { Settings, MessageCircle, MoreHorizontal } from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
    backgroundImage?: string | null;
    bio?: string | null;
  };
  stats?: {
    postCount: number;
    followerCount: number;
    followingCount: number;
    workoutCount: number;
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

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      {/* Cover Image */}
      <div className="relative aspect-[3/1] w-full">
        {user.backgroundImage ? (
          <img
            src={user.backgroundImage}
            alt="커버 이미지"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-blue-500 to-purple-600" />
        )}
      </div>

      {/* Profile Info Section */}
      <div className="relative px-4 pb-5 sm:px-6">
        {/* Avatar overlapping cover */}
        <div className="-mt-12 sm:-mt-14 mb-3">
          <Avatar className="size-24 sm:size-28 ring-4 ring-card">
            {user.profileImage && (
              <AvatarImage src={user.profileImage} alt={user.name} />
            )}
            <AvatarFallback className="text-3xl sm:text-4xl bg-muted">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name + Actions Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-foreground truncate sm:text-2xl">
              {user.name}
            </h1>
            {user.bio && (
              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                {user.bio}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
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
                    "min-w-[80px]",
                    isFollowing &&
                      "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                  )}
                >
                  {isFollowLoading ? "처리 중..." : getFollowButtonText()}
                </Button>
                {isFollowing && onMessageClick && (
                  <Button variant="outline" size="sm" onClick={onMessageClick}>
                    <MessageCircle className="size-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="size-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="mt-4 flex items-center gap-5">
            <div className="text-sm">
              <span className="font-bold text-foreground tabular-nums">
                {stats.postCount}
              </span>{" "}
              <span className="text-muted-foreground">게시물</span>
            </div>
            <button
              type="button"
              onClick={onFollowersClick}
              className="text-sm hover:underline"
            >
              <span className="font-bold text-foreground tabular-nums">
                {stats.followerCount}
              </span>{" "}
              <span className="text-muted-foreground">팔로워</span>
            </button>
            <button
              type="button"
              onClick={onFollowingClick}
              className="text-sm hover:underline"
            >
              <span className="font-bold text-foreground tabular-nums">
                {stats.followingCount}
              </span>{" "}
              <span className="text-muted-foreground">팔로잉</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
