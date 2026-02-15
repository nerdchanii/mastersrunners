"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

interface User {
  id: string;
  name: string;
  profileImage: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
  parentId: string | null;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchComments = useCallback(async (loadMore = false) => {
    try {
      setIsLoading(true);
      const url = `/posts/${postId}/comments?limit=20${cursor && loadMore ? `&cursor=${cursor}` : ""}`;
      const response = await api.fetch<{
        data: Comment[];
        cursor: string | null;
        hasMore: boolean;
      }>(url);

      // Organize comments into parent-reply structure
      const parentComments = response.data.filter((c) => !c.parentId);
      const replyComments = response.data.filter((c) => c.parentId);

      const commentsWithReplies = parentComments.map((parent) => ({
        ...parent,
        replies: replyComments.filter((r) => r.parentId === parent.id),
      }));

      if (loadMore) {
        setComments((prev) => [...prev, ...commentsWithReplies]);
      } else {
        setComments(commentsWithReplies);
      }

      setCursor(response.cursor);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [postId, cursor]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await api.fetch(`/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      });

      setNewComment("");
      await fetchComments(); // Refresh comments
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await api.fetch(`/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({
          content: replyContent.trim(),
          parentId,
        }),
      });

      setReplyContent("");
      setReplyingTo(null);
      await fetchComments(); // Refresh comments
    } catch (error) {
      console.error("Failed to post reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      await api.fetch(`/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
      });

      await fetchComments(); // Refresh comments
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInDays < 7) return `${diffInDays}일 전`;

    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isOwner = user?.id === comment.user.id;

    return (
      <div
        key={comment.id}
        className={`${isReply ? "ml-12 bg-gray-50 rounded-lg p-4" : ""}`}
      >
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.user.profileImage ? (
              <img
                className="h-8 w-8 rounded-full"
                src={comment.user.profileImage}
                alt={comment.user.name}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-medium text-xs">
                  {comment.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900">
                {comment.user.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatTimestamp(comment.createdAt)}
              </p>
            </div>
            <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
              {comment.content}
            </p>

            {/* Actions */}
            <div className="mt-2 flex items-center gap-4">
              {!isReply && (
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  답글
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  삭제
                </button>
              )}
            </div>

            {/* Reply Input */}
            {replyingTo === comment.id && (
              <div className="mt-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="답글을 입력하세요..."
                  rows={2}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2 border"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={!replyContent.trim() || isSubmitting}
                    className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "등록 중..." : "답글 등록"}
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent("");
                    }}
                    disabled={isSubmitting}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">댓글</h2>

      {/* New Comment Form */}
      {user && (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2 border"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "등록 중..." : "댓글 등록"}
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {isLoading && comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">댓글을 불러오는 중...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          첫 댓글을 작성해보세요!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              {renderComment(comment)}
              {comment.replies && comment.replies.length > 0 && (
                <div className="space-y-4">
                  {comment.replies.map((reply) => renderComment(reply, true))}
                </div>
              )}
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => fetchComments(true)}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
              >
                {isLoading ? "불러오는 중..." : "더보기"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
