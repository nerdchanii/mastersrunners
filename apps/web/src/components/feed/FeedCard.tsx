import { Link } from "react-router-dom";
import { MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatItem } from "@/components/common/StatItem";
import { TimeAgo } from "@/components/common/TimeAgo";
import { LikeButton } from "@/components/social/LikeButton";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";

interface FeedCardProps {
  workout: {
    id: string;
    distance: number;
    duration: number;
    pace: number;
    date: string;
    visibility: string;
    memo: string | null;
    createdAt: string;
    user: {
      id: string;
      name: string;
      profileImage: string | null;
    };
    _count: {
      likes: number;
      comments: number;
    };
    isLiked?: boolean;
  };
}

export default function FeedCard({ workout }: FeedCardProps) {
  return (
    <article className="border-b bg-card">
      {/* User Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <UserAvatar
          user={workout.user}
          showName
          subtitle={<TimeAgo date={workout.createdAt} />}
        />
        <button className="rounded-full p-1.5 text-muted-foreground hover:bg-accent">
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      {/* Workout Hero Stats — Strava style */}
      <Link to={`/workouts/detail?id=${workout.id}`}>
        <div className="mx-4 rounded-xl bg-muted/50 p-4">
          <div className="grid grid-cols-3 gap-2">
            <StatItem
              value={formatDistance(workout.distance)}
              label="km"
              size="lg"
            />
            <StatItem
              value={formatDuration(workout.duration)}
              label="시간"
              size="lg"
            />
            <StatItem
              value={formatPace(workout.pace)}
              label="/km"
              size="lg"
            />
          </div>
        </div>
      </Link>

      {/* Memo */}
      {workout.memo && (
        <div className="px-4 pt-3">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {workout.memo}
          </p>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center gap-1 px-2 py-1">
        <LikeButton
          entityType="workout"
          entityId={workout.id}
          initialLiked={workout.isLiked}
          initialCount={workout._count?.likes ?? 0}
        />
        <Link
          to={`/workouts/detail?id=${workout.id}`}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-muted-foreground hover:bg-accent"
        >
          <MessageCircle className="size-5" />
          {(workout._count?.comments ?? 0) > 0 && (
            <span className="text-sm font-medium tabular-nums">
              {workout._count.comments}
            </span>
          )}
        </Link>
        <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent ml-auto">
          <Share2 className="size-5" />
        </button>
      </div>
    </article>
  );
}
