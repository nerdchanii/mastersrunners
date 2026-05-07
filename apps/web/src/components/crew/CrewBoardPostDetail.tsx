import { Heart, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AuthGateDialog } from "@/components/common/AuthGateDialog";
import { TimeAgo } from "@/components/common/TimeAgo";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Board } from "@/hooks/useCrewBoards";
import { useBoardPost, useCreateComment, useToggleLike } from "@/hooks/useCrewBoards";
import { useAuth } from "@/lib/auth-context";

export function BoardPostAccessGate({
  isAuthenticated,
  onRequireAuth,
}: {
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}) {
  return (
    <section className="space-y-4 border-t border-border/50 py-8 text-center">
      <div className="mx-auto max-w-sm space-y-2">
        <h3 className="text-base font-semibold">크루 멤버만 읽을 수 있습니다</h3>
        <p className="text-sm text-muted-foreground">
          {isAuthenticated
            ? "크루에 가입하면 게시글 상세를 볼 수 있습니다."
            : "로그인 후 크루에 가입하면 게시글 상세를 볼 수 있습니다."}
        </p>
      </div>
      {!isAuthenticated ? (
        <div className="flex justify-center">
          <Button type="button" onClick={onRequireAuth}>
            로그인하고 보기
          </Button>
        </div>
      ) : null}
    </section>
  );
}

export function BoardPostUnavailable({
  onBack,
  showBackAction = true,
}: {
  onBack?: () => void;
  showBackAction?: boolean;
}) {
  return (
    <section className="space-y-4 border-t border-border/50 py-8 text-center">
      <div className="mx-auto max-w-sm space-y-2">
        <h3 className="text-base font-semibold">게시글을 찾을 수 없습니다</h3>
        <p className="text-sm text-muted-foreground">
          삭제되었거나 현재 게시판 목록에서 확인할 수 없는 글입니다.
        </p>
      </div>
      {showBackAction && onBack ? (
        <Button type="button" variant="outline" onClick={onBack}>
          게시판으로 돌아가기
        </Button>
      ) : null}
    </section>
  );
}

export function CrewBoardPostDetail({
  crewId,
  board,
  postId,
  isMember,
  onBack,
  showUnavailableBackAction = true,
}: {
  crewId: string;
  board: Board;
  postId: string;
  isMember: boolean;
  onBack: () => void;
  showUnavailableBackAction?: boolean;
}) {
  const { data: post, isLoading } = useBoardPost(crewId, board.id, postId);
  const { user } = useAuth();
  const toggleLike = useToggleLike();
  const createComment = useCreateComment();
  const [comment, setComment] = useState("");
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const nextPath =
    typeof window === "undefined"
      ? `/crews/${crewId}`
      : `${window.location.pathname}${window.location.search}${window.location.hash}`;

  const handleLike = () => {
    if (!post) return;
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    toggleLike.mutate({ crewId, boardId: board.id, postId, liked: !!post.liked });
  };

  const handleComment = () => {
    if (!comment.trim()) return;
    createComment.mutate(
      { crewId, boardId: board.id, postId, content: comment.trim() },
      {
        onSuccess: () => {
          setComment("");
          toast.success("댓글이 작성되었습니다.");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!post) {
    return <BoardPostUnavailable onBack={onBack} showBackAction={showUnavailableBackAction} />;
  }

  return (
    <div className="space-y-4">
      <article className="space-y-4 border-t border-border/50 pt-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={post.author} size="sm" linkToProfile />
          <div>
            <p className="font-medium text-sm">{post.author.name}</p>
            <TimeAgo date={post.createdAt} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {board.type === "ANNOUNCEMENT" && (
            <Badge variant="secondary" className="rounded-full px-2 py-0 text-[11px]">
              공지
            </Badge>
          )}
          <h3 className="text-xl font-semibold">{post.title}</h3>
        </div>
        <div className="space-y-4">
          <p className="whitespace-pre-wrap">{post.content}</p>

          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {post.images.map((img) => (
                <img key={img.id} src={img.url} alt="" className="rounded-lg object-cover w-full" />
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 border-t border-border/50 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={post.liked ? "text-red-500" : ""}
            >
              <Heart className={`size-4 mr-1 ${post.liked ? "fill-current" : ""}`} />
              {post._count.likes}
            </Button>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageSquare className="size-4" />
              {post._count.comments}
            </span>
          </div>
        </div>
      </article>

      <section className="space-y-4 border-t border-border/50 pt-4">
        <h3 className="text-base font-semibold">댓글</h3>
        <div className="space-y-4">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((c) => (
              <div key={c.id} className="border-b border-border/40 pb-4 last:border-0">
                <div className="flex items-start gap-2">
                  <UserAvatar user={c.author} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{c.author.name}</span>
                      <TimeAgo date={c.createdAt} />
                    </div>
                    <p className="text-sm mt-0.5">{c.content}</p>
                  </div>
                </div>
                {c.replies && c.replies.length > 0 && (
                  <div className="ml-8 mt-2 space-y-2 border-l-2 pl-3">
                    {c.replies.map((r) => (
                      <div key={r.id} className="flex items-start gap-2">
                        <UserAvatar user={r.author} size="sm" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{r.author.name}</span>
                            <TimeAgo date={r.createdAt} />
                          </div>
                          <p className="text-sm mt-0.5">{r.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">아직 댓글이 없습니다.</p>
          )}

          {isMember && (
            <div className="flex items-center gap-2 border-t border-border/50 pt-2">
              <Input
                className="flex-1"
                placeholder="댓글 남기기"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleComment();
                  }
                }}
              />
              <Button size="icon" onClick={handleComment} disabled={!comment.trim()}>
                <Send className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      <AuthGateDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        nextPath={nextPath}
        title="반응 남기기"
      />
    </div>
  );
}
