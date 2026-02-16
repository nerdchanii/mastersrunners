import { Link } from "react-router-dom";
import { Settings, MessageCircle, MoreHorizontal } from "lucide-react";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
    bio?: string | null;
  };
  isOwnProfile: boolean;
  isFollowing?: boolean;
  isPending?: boolean;
  isPrivate?: boolean;
  onFollowToggle?: () => void;
  onMessageClick?: () => void;
  isFollowLoading?: boolean;
}

export function ProfileHeader({
  user,
  isOwnProfile,
  isFollowing,
  isPending,
  isPrivate,
  onFollowToggle,
  onMessageClick,
  isFollowLoading,
}: ProfileHeaderProps) {
  const getFollowButtonText = () => {
    if (isPending) return "요청됨";
    if (isFollowing) return "팔로잉";
    if (isPrivate && !isFollowing) return "팔로우 요청";
    return "팔로우";
  };

  const getFollowButtonVariant = () => {
    if (isFollowing) return "outline";
    return "default";
  };

  return (
    <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
      <UserAvatar
        user={user}
        size="xl"
        linkToProfile={false}
        className="shrink-0"
      />

      <div className="flex-1 min-w-0 w-full sm:w-auto">
        <div className="flex items-center gap-4 mb-3">
          <h1 className="text-2xl font-bold text-foreground truncate">
            {user.name}
          </h1>

          {isOwnProfile ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/settings/profile">
                  <Settings className="size-4" />
                  <span className="hidden sm:inline">설정</span>
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant={getFollowButtonVariant()}
                size="sm"
                onClick={onFollowToggle}
                disabled={isFollowLoading || isPending}
                className={cn(
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
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-3">{user.email}</p>

        {user.bio && (
          <p className="text-sm text-foreground whitespace-pre-wrap mb-3">
            {user.bio}
          </p>
        )}
      </div>
    </div>
  );
}
