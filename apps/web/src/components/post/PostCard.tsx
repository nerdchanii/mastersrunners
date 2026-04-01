import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

import { TimeAgo } from "@/components/common/TimeAgo";
import { PostImageGallery } from "@/components/post/PostImageGallery";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLikePost } from "@/hooks/usePosts";
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
  onLikeToggle?: () => void;
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
  onLikeToggle,
  onShare,
}: PostCardProps) {
  const likePost = useLikePost();

  const handleLikeToggle = () => {
    likePost.mutate({ postId: id, isLiked });
    onLikeToggle?.();
  };

  return (
    <article className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar className="size-10">
          {user.profileImage && <AvatarImage src={user.profileImage} alt={user.name} />}
          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">
            <TimeAgo date={createdAt} />
          </p>
        </div>
      </div>

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

      <div className="flex items-center gap-2 border-t border-border/60 pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLikeToggle}
          disabled={likePost.isPending}
          className={cn(
            "h-8 px-2 text-muted-foreground hover:text-destructive",
            isLiked && "text-destructive",
          )}
        >
          <Heart className={cn("size-4", isLiked && "fill-current")} />
          <span className="text-xs">{likesCount > 0 ? likesCount.toLocaleString() : "좋아요"}</span>
        </Button>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MessageCircle className="size-4" />
          <span>{commentsCount > 0 ? `댓글 ${commentsCount.toLocaleString()}개` : "댓글"}</span>
        </div>

        {onShare && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="ml-auto h-8 px-2 text-muted-foreground"
          >
            <Share2 className="size-4" />
            <span className="text-xs">공유</span>
          </Button>
        )}
      </div>
    </article>
  );
}
