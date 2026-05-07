import { Send, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AuthGateDialog } from "@/components/common/AuthGateDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TimeAgo } from "@/components/common/TimeAgo";
import { UserAvatar } from "@/components/common/UserAvatar";
import { CommentContent } from "@/components/social/MentionLink";
import { Button } from "@/components/ui/button";
import {
  type Comment,
  type CommentEntityType,
  useComments,
  useCreateComment,
  useDeleteComment,
} from "@/hooks/useComments";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface CommentListProps {
  entityType: CommentEntityType;
  entityId: string;
}

const COMMENT_LIST_PARAMS = { limit: 50 };

export function CommentList({ entityType, entityId }: CommentListProps) {
  const { user } = useAuth();
  const commentsQuery = useComments(entityType, entityId, COMMENT_LIST_PARAMS);
  const createComment = useCreateComment({ entityType, entityId, params: COMMENT_LIST_PARAMS });
  const deleteComment = useDeleteComment({ entityType, entityId, params: COMMENT_LIST_PARAMS });
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const comments = commentsQuery.data ?? [];
  const nextPath =
    typeof window === "undefined"
      ? entityType === "workout"
        ? `/workouts/${entityId}`
        : `/posts/${entityId}`
      : `${window.location.pathname}${window.location.search}${window.location.hash}`;

  const authGateTitle = "댓글 남기기";
  const guestEntryDescription =
    entityType === "workout"
      ? "로그인 후 이 기록에서 바로 대화를 이어갈 수 있습니다."
      : "로그인 후 이 글에서 바로 대화를 이어갈 수 있습니다.";
  const authGateDescription =
    entityType === "workout"
      ? "현재 보고 있는 기록 위치를 그대로 유지한 채 바로 이어서 작성할 수 있습니다."
      : "현재 보고 있는 글 위치를 그대로 유지한 채 바로 이어서 작성할 수 있습니다.";

  useEffect(() => {
    setCreateError(null);
    setDeleteError(null);
  }, [entityType, entityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || createComment.isPending) return;

    setCreateError(null);
    try {
      await createComment.mutateAsync({
        content: newComment.trim(),
        mentionedUserIds: replyingTo ? [replyingTo.user.id] : undefined,
        parentId: replyingTo?.id,
      });

      setNewComment("");
      setReplyingTo(null);
    } catch {
      setCreateError("댓글을 등록하지 못했습니다. 입력 내용을 확인하고 다시 시도해 주세요.");
    }
  };

  const handleReply = (comment: Comment) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    setReplyingTo(comment);
    setNewComment(`@${comment.user.name} `);
    setCreateError(null);
    inputRef.current?.focus();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setNewComment("");
    setCreateError(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteComment.mutateAsync({ commentId: deleteTarget });
      setDeleteTarget(null);
    } catch {
      setDeleteError("댓글을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.");
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
      {commentsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-4">로딩 중...</p>
      ) : commentsQuery.isError ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            댓글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void commentsQuery.refetch()}
            disabled={commentsQuery.isFetching}
          >
            다시 시도
          </Button>
        </div>
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
              onChange={(e) => {
                setNewComment(e.target.value);
                setCreateError(null);
              }}
              placeholder="댓글 달기..."
              className="h-10 flex-1 bg-transparent py-2 text-sm leading-5 outline-none placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              disabled={!newComment.trim() || createComment.isPending}
              className="shrink-0"
            >
              <Send className="size-4" />
            </Button>
          </div>
          {createError && <p className="mt-2 text-xs text-destructive">{createError}</p>}
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
        loading={deleteComment.isPending}
      />
      {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}

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
