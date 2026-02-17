import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Share2, MoreHorizontal, Flag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatItem } from "@/components/common/StatItem";
import { TimeAgo } from "@/components/common/TimeAgo";
import { LikeButton } from "@/components/social/LikeButton";
import { ImageLightbox } from "@/components/common/ImageLightbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";

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
    images?: Array<{
      id: string;
      url: string;
      order: number;
    }>;
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
  onDelete?: (postId: string) => void;
}

export default function PostFeedCard({ post, onDelete }: PostFeedCardProps) {
  const { user: currentUser } = useAuth();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const isOwner = currentUser?.id === post.user.id;

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("링크가 클립보드에 복사되었습니다.");
    } catch {
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  const handleReport = () => {
    toast.info("신고가 접수되었습니다.");
  };

  const images = post.images ?? [];
  const lightboxImages = images.map((img) => ({ url: img.url, alt: "게시글 이미지" }));

  const handleImageClick = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <article className="border-b bg-card">
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />

      {/* User Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <UserAvatar
          user={post.user}
          showName
          subtitle={<TimeAgo date={post.createdAt} />}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full p-1.5 text-muted-foreground hover:bg-accent">
              <MoreHorizontal className="size-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwner && onDelete && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(post.id)}
              >
                <Trash2 className="size-4 mr-2" />
                삭제
              </DropdownMenuItem>
            )}
            {!isOwner && (
              <DropdownMenuItem onClick={handleReport}>
                <Flag className="size-4 mr-2" />
                신고
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
              <Link
                key={idx}
                to={`/search?hashtag=${encodeURIComponent(tag)}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Badge
                  variant="secondary"
                  className="text-xs font-normal hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                >
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </Link>

      {/* Post Images */}
      {images.length > 0 && (
        <div className="mt-3">
          {images.length === 1 ? (
            <button
              type="button"
              className="w-full text-left"
              onClick={() => handleImageClick(0)}
            >
              <img
                src={images[0].url}
                alt="게시글 이미지"
                loading="lazy"
                className="w-full max-h-96 object-cover"
              />
            </button>
          ) : (
            <div className={`grid gap-0.5 ${images.length === 2 ? "grid-cols-2" : "grid-cols-2 grid-rows-2"}`}>
              {images.slice(0, 4).map((image, idx) => (
                <button
                  key={image.id}
                  type="button"
                  className="relative aspect-square overflow-hidden"
                  onClick={() => handleImageClick(idx)}
                >
                  <img
                    src={image.url}
                    alt={`게시글 이미지 ${idx + 1}번`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  {idx === 3 && images.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        +{images.length - 4}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Attached Workouts */}
      <Link to={`/posts/${post.id}`}>
        {(post.workouts?.length ?? 0) > 0 && (
          <div className="mx-4 mt-3 rounded-xl bg-muted/50 p-3 space-y-2">
            {(post.workouts ?? []).map(({ workout }) => (
              <div key={workout.id} className="grid grid-cols-3 gap-2">
                <StatItem value={formatDistance(workout.distance)} label="km" size="sm" />
                <StatItem value={formatDuration(workout.duration)} label="시간" size="sm" />
                <StatItem value={formatPace(workout.pace)} label="/km" size="sm" />
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
        <button
          type="button"
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent ml-auto"
          onClick={handleShare}
          aria-label="공유"
        >
          <Share2 className="size-5" />
        </button>
      </div>
    </article>
  );
}
