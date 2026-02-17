
import { Heart, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLikePost } from "@/hooks/usePosts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimeAgo } from "@/components/common/TimeAgo";
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
  onLikeToggle?: () => void;
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
  onLikeToggle,
}: PostCardProps) {
  const likePost = useLikePost();

  const handleLikeToggle = () => {
    likePost.mutate({ postId: id, isLiked });
    onLikeToggle?.();
  };

  return (
    <Card className="rounded-lg shadow-sm">
      <CardContent className="p-5">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="size-10">
            {user.profileImage && (
              <AvatarImage src={user.profileImage} alt={user.name} />
            )}
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">
              <TimeAgo date={createdAt} />
            </p>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-foreground whitespace-pre-wrap mb-3">{content}</p>

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {hashtags.map((tag, index) => (
              <Link
                key={index}
                to={`/search?hashtag=${encodeURIComponent(tag)}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Badge
                  variant="secondary"
                  className="hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                >
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLikeToggle}
            disabled={likePost.isPending}
            className={cn(
              "flex items-center gap-1.5 px-2 h-8 text-muted-foreground hover:text-destructive",
              isLiked && "text-destructive"
            )}
          >
            <Heart
              className={cn("size-4", isLiked && "fill-current")}
            />
            <span className="text-xs">
              {likesCount > 0 ? likesCount.toLocaleString() : "좋아요"}
            </span>
          </Button>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageCircle className="size-4" />
            <span>{commentsCount > 0 ? `댓글 ${commentsCount.toLocaleString()}개` : "댓글"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
