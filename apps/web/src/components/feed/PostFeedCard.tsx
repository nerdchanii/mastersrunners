import { Link } from "react-router-dom";
import { MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatItem } from "@/components/common/StatItem";
import { TimeAgo } from "@/components/common/TimeAgo";
import { LikeButton } from "@/components/social/LikeButton";
import { Badge } from "@/components/ui/badge";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";

interface PostFeedCardProps {
  post: {
    id: string;
    content: string;
    visibility: string;
    hashtags: string[];
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
    workouts: Array<{
      workout: {
        id: string;
        distance: number;
        duration: number;
        pace: number;
        date: string;
      };
    }>;
  };
}

export default function PostFeedCard({ post }: PostFeedCardProps) {
  return (
    <article className="border-b bg-card">
      {/* User Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <UserAvatar
          user={post.user}
          showName
          subtitle={<TimeAgo date={post.createdAt} />}
        />
        <button className="rounded-full p-1.5 text-muted-foreground hover:bg-accent">
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      {/* Content */}
      <Link to={`/posts/${post.id}`}>
        <div className="px-4">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        </div>

        {/* Hashtags */}
        {(post.hashtags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5 px-4 pt-2">
            {(post.hashtags ?? []).map((tag, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-xs font-normal"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Attached Workouts */}
        {(post.workouts?.length ?? 0) > 0 && (
          <div className="mx-4 mt-3 rounded-xl bg-muted/50 p-3 space-y-2">
            {(post.workouts ?? []).map(({ workout }) => (
              <div
                key={workout.id}
                className="grid grid-cols-3 gap-2"
              >
                <StatItem
                  value={formatDistance(workout.distance)}
                  label="km"
                  size="sm"
                />
                <StatItem
                  value={formatDuration(workout.duration)}
                  label="시간"
                  size="sm"
                />
                <StatItem
                  value={formatPace(workout.pace)}
                  label="/km"
                  size="sm"
                />
              </div>
            ))}
          </div>
        )}
      </Link>

      {/* Action Bar */}
      <div className="flex items-center gap-1 px-2 py-1">
        <LikeButton
          entityType="post"
          entityId={post.id}
          initialLiked={post.isLiked}
          initialCount={post._count?.likes ?? 0}
        />
        <Link
          to={`/posts/${post.id}`}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-muted-foreground hover:bg-accent"
        >
          <MessageCircle className="size-5" />
          {(post._count?.comments ?? 0) > 0 && (
            <span className="text-sm font-medium tabular-nums">
              {post._count.comments}
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
