import { StatItem } from "@/components/common/StatItem";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ProfileStatsProps {
  postCount: number;
  followerCount: number;
  followingCount: number;
  workoutCount?: number;
  crewCount?: number;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
  className?: string;
}

export function ProfileStats({
  postCount,
  followerCount,
  followingCount,
  workoutCount,
  crewCount,
  onFollowersClick,
  onFollowingClick,
  className,
}: ProfileStatsProps) {
  const finalItem = {
    label: crewCount !== undefined ? "크루" : "워크아웃",
    value: crewCount ?? workoutCount ?? 0,
  };

  return (
    <section
      className={cn(
        "grid grid-cols-2 gap-y-4 border-b border-border/60 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-x-4 sm:px-6",
        className,
      )}
    >
      <ProfileStat value={postCount} label="게시물" />
      <Separator
        orientation="vertical"
        className="hidden h-10 justify-self-center bg-border/60 sm:block"
      />
      <ProfileStat
        value={followerCount}
        label="팔로워"
        onClick={onFollowersClick}
        clickableLabel="팔로워 목록 보기"
      />
      <Separator
        orientation="vertical"
        className="hidden h-10 justify-self-center bg-border/60 sm:block"
      />
      <ProfileStat
        value={followingCount}
        label="팔로잉"
        onClick={onFollowingClick}
        clickableLabel="팔로잉 목록 보기"
      />
      <Separator
        orientation="vertical"
        className="hidden h-10 justify-self-center bg-border/60 sm:block"
      />
      <ProfileStat value={finalItem.value} label={finalItem.label} />
    </section>
  );
}

interface ProfileStatProps {
  value: number;
  label: string;
  onClick?: () => void;
  clickableLabel?: string;
}

function ProfileStat({ value, label, onClick, clickableLabel }: ProfileStatProps) {
  const content = (
    <StatItem
      value={value}
      label={label}
      size="default"
      valueClassName="text-xl font-semibold sm:text-2xl"
      labelClassName="tracking-[0.12em]"
    />
  );

  if (!onClick) {
    return content;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={clickableLabel}
      className="rounded-2xl px-2 py-1 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      {content}
    </button>
  );
}
