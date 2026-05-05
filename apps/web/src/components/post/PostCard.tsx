import { MessageCircle, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

import { TimeAgo } from "@/components/common/TimeAgo";
import { UserAvatar } from "@/components/common/UserAvatar";
import { PostImageGallery } from "@/components/post/PostImageGallery";
import { LikeButton } from "@/components/social/LikeButton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  profileImage: string | null;
}

interface PostCardProps {
  id: string;
  user: User;
  content: string;
  hashtags?: string[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
  images?: Array<{
    id: string;
    url: string;
    order: number;
  }>;
  commentHref?: string;
  onShare?: () => void;
}

export function PostCard({
  id,
  user,
  content,
  hashtags = [],
  likesCount,
  commentsCount,
  isLiked,
  createdAt,
  images = [],
  commentHref,
  onShare,
}: PostCardProps) {
  const actionButtonClassName = cn(
    buttonVariants({ variant: "ghost", size: "sm" }),
    "h-9 rounded-full px-3 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60",
  );
  const commentActionContent = (
    <>
      <MessageCircle className="size-4" />
      {commentsCount > 0 && (
        <span className="text-sm tabular-nums">{commentsCount.toLocaleString()}</span>
      )}
    </>
  );

  return (
    <article className="space-y-4">
      <UserAvatar
        user={user}
        showName
        subtitle={<TimeAgo date={createdAt} />}
        className="size-10"
      />

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{content}</p>

      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {hashtags.map((tag, index) => (
            <Link
              key={index}
              to={`/search?hashtag=${encodeURIComponent(tag)}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
              >
                #{tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <PostImageGallery images={images} />

      <div className="flex items-center gap-1.5 border-t border-border/60 pt-3">
        <LikeButton
          entityType="post"
          entityId={id}
          initialLiked={isLiked}
          initialCount={likesCount}
        />

        {commentHref ? (
          <a href={commentHref} className={actionButtonClassName} aria-label="댓글로 이동">
            {commentActionContent}
          </a>
        ) : (
          <div className={actionButtonClassName} aria-hidden>
            {commentActionContent}
          </div>
        )}

        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className={cn(actionButtonClassName, "ml-auto opacity-80 hover:opacity-100")}
            aria-label="공유"
          >
            <Share2 className="size-4" />
          </button>
        )}
      </div>
    </article>
  );
}
