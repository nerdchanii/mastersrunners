import { Send, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AuthGateDialog } from "@/components/common/AuthGateDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TimeAgo } from "@/components/common/TimeAgo";
import { UserAvatar } from "@/components/common/UserAvatar";
import { CommentContent } from "@/components/social/MentionLink";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
  mentionedUserId?: string | null;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  replies?: Comment[];
}

interface CommentListProps {
  entityType: "post" | "workout";
  entityId: string;
}

export function CommentList({ entityType, entityId }: CommentListProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextPath =
    typeof window === "undefined"
      ? entityType === "workout"
        ? `/workouts/${entityId}`
        : `/posts/${entityId}`
      : `${window.location.pathname}${window.location.search}${window.location.hash}`;

  const endpoint =
    entityType === "workout" ? `/workouts/${entityId}/comments` : `/posts/${entityId}/comments`;
  const authGateTitle = "댓글을 남기려면 로그인해 주세요";
  const guestEntryDescription =
    entityType === "workout"
      ? "로그인 후 이 기록에서 바로 대화를 이어갈 수 있습니다."
      : "로그인 후 이 글에서 바로 대화를 이어갈 수 있습니다.";
  const authGateDescription =
    entityType === "workout"
      ? "현재 보고 있는 기록 위치를 그대로 유지한 채 바로 이어서 작성할 수 있습니다."
      : "현재 보고 있는 글 위치를 그대로 유지한 채 바로 이어서 작성할 수 있습니다.";

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const data = await api.fetchSession<
        { data: Comment[]; cursor: string | null; hasMore: boolean } | Comment[]
      >(`${endpoint}?limit=50`);

      const items = Array.isArray(data) ? data : (data?.data ?? []);

      // Backend already returns top-level comments with nested replies
      setComments(items);
      setLoadError(null);
    } catch {
      setComments([]);
      setLoadError("댓글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const body: Record<string, unknown> = { content: newComment.trim() };
      if (replyingTo) {
        body.parentId = replyingTo.id;
        if (entityType === "workout") {
          body.mentionedUserIds = [replyingTo.user.id];
        } else {
          body.mentionedUserId = replyingTo.user.id;
        }
      }

      await api.fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      setNewComment("");
      setReplyingTo(null);
      await fetchComments();
    } catch {
      // silent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (comment: Comment) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    setReplyingTo(comment);
    setNewComment(`@${comment.user.name} `);
    inputRef.current?.focus();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setNewComment("");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.fetch(`${endpoint}/${deleteTarget}`, { method: "DELETE" });
      setDeleteTarget(null);
      await fetchComments();
    } catch {
      // silent
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={isReply ? "ml-10 mt-2" : ""}>
      <div className="flex gap-2.5">
        <UserAvatar user={comment.user} size="sm" linkToProfile className="mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-foreground">{comment.user.name}</span>
            <TimeAgo date={comment.createdAt} />
          </div>
          <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap break-words">
            <CommentContent content={comment.content} />
          </p>
          <div className="flex items-center gap-3 mt-1">
            {!isReply && (
              <button
                type="button"
                onClick={() => handleReply(comment)}
                className="rounded-full px-2 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                답글 달기
              </button>
            )}
            {user?.id === comment.user.id && (
              <button
                type="button"
                onClick={() => setDeleteTarget(comment.id)}
                className="rounded-full p-1 text-xs text-muted-foreground outline-none transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="댓글 삭제"
              >
                <Trash2 className="size-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Comment list */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-4">로딩 중...</p>
      ) : loadError ? (
        <p className="text-sm text-muted-foreground text-center py-6">{loadError}</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">첫 댓글을 작성해보세요</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id}>
              {renderComment(comment)}
              {comment.replies?.map((reply) => renderComment(reply, true))}
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      {user ? (
        <form onSubmit={handleSubmit} className="border-t pt-3">
          {replyingTo && (
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
              <span>{replyingTo.user.name}님에게 답글 작성 중</span>
              <button
                type="button"
                onClick={handleCancelReply}
                className="text-primary hover:underline"
              >
                취소
              </button>
            </div>
          )}
          <div className="flex min-h-10 items-center gap-2">
            <UserAvatar user={user} size="sm" linkToProfile={false} />
            <input
              ref={inputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글 달기..."
              className="h-10 flex-1 bg-transparent py-2 text-sm leading-5 outline-none placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              disabled={!newComment.trim() || isSubmitting}
              className="shrink-0"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </form>
      ) : (
        <div className="border-t pt-3">
          <button
            type="button"
            onClick={() => setShowAuthDialog(true)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border border-border/70 px-3 py-2.5 text-left transition-colors",
              "hover:border-border hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">댓글 남기기</p>
              <p className="text-xs text-muted-foreground">{guestEntryDescription}</p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">로그인 필요</span>
          </button>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="댓글 삭제"
        description="이 댓글을 삭제하시겠습니까?"
        confirmLabel="삭제"
        variant="destructive"
        onConfirm={handleDelete}
      />

      <AuthGateDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        nextPath={nextPath}
        title={authGateTitle}
        description={authGateDescription}
      />
    </div>
  );
}
