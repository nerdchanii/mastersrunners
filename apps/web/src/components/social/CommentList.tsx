import { useState, useEffect, useRef } from "react";
import { Send, Trash2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { UserAvatar } from "@/components/common/UserAvatar";
import { TimeAgo } from "@/components/common/TimeAgo";
import { CommentContent } from "@/components/social/MentionLink";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

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
  const inputRef = useRef<HTMLInputElement>(null);

  const endpoint =
    entityType === "workout"
      ? `/workouts/${entityId}/comments`
      : `/posts/${entityId}/comments`;

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const data = await api.fetch<{ data: Comment[]; cursor: string | null; hasMore: boolean } | Comment[]>(
        `${endpoint}?limit=50`
      );

      const items = Array.isArray(data) ? data : (data.data ?? []);

      // Organize into parent-reply structure
      const parents = items.filter((c) => !c.parentId);
      const replies = items.filter((c) => c.parentId);

      const organized = parents.map((parent) => ({
        ...parent,
        replies: replies.filter((r) => r.parentId === parent.id),
      }));

      setComments(organized);
    } catch {
      // silent
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
      const body: Record<string, string> = { content: newComment.trim() };
      if (replyingTo) {
        body.parentId = replyingTo.id;
        body.mentionedUserId = replyingTo.user.id;
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
    <div
      key={comment.id}
      className={isReply ? "ml-10 mt-2" : ""}
    >
      <div className="flex gap-2.5">
        <UserAvatar
          user={comment.user}
          size="sm"
          linkToProfile
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-foreground">
              {comment.user.name}
            </span>
            <TimeAgo date={comment.createdAt} />
          </div>
          <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap break-words">
            <CommentContent content={comment.content} />
          </p>
          <div className="flex items-center gap-3 mt-1">
            {!isReply && (
              <button
                onClick={() => handleReply(comment)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                답글 달기
              </button>
            )}
            {user?.id === comment.user.id && (
              <button
                onClick={() => setDeleteTarget(comment.id)}
                className="text-xs text-muted-foreground hover:text-destructive"
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
        <p className="text-sm text-muted-foreground text-center py-4">
          로딩 중...
        </p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          첫 댓글을 작성해보세요
        </p>
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
      {user && (
        <form onSubmit={handleSubmit} className="border-t pt-3">
          {replyingTo && (
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
              <span>
                {replyingTo.user.name}님에게 답글 작성 중
              </span>
              <button
                type="button"
                onClick={handleCancelReply}
                className="text-primary hover:underline"
              >
                취소
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <UserAvatar user={user} size="sm" linkToProfile={false} />
            <input
              ref={inputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글 달기..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
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
    </div>
  );
}
