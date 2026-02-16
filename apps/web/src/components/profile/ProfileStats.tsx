import { StatItem } from "@/components/common/StatItem";
import { cn } from "@/lib/utils";

interface ProfileStatsProps {
  postCount: number;
  followerCount: number;
  followingCount: number;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
  className?: string;
}

export function ProfileStats({
  postCount,
  followerCount,
  followingCount,
  onFollowersClick,
  onFollowingClick,
  className,
}: ProfileStatsProps) {
  return (
    <div className={cn("flex items-center justify-around gap-4 py-4", className)}>
      <StatItem value={postCount} label="게시물" size="sm" />

      <button
        onClick={onFollowersClick}
        className="flex flex-col items-center hover:opacity-70 transition-opacity"
        type="button"
      >
        <StatItem value={followerCount} label="팔로워" size="sm" />
      </button>

      <button
        onClick={onFollowingClick}
        className="flex flex-col items-center hover:opacity-70 transition-opacity"
        type="button"
      >
        <StatItem value={followingCount} label="팔로잉" size="sm" />
      </button>
    </div>
  );
}
