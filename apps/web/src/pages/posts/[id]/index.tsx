import { ArrowLeft, ArrowRight, Edit } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { LoadingPage } from "@/components/common/LoadingPage";
import { CommentSection } from "@/components/post/CommentSection";
import { PostCard } from "@/components/post/PostCard";
import { Button } from "@/components/ui/button";
import { useDeletePost, usePost } from "@/hooks/usePosts";
import { useAuth } from "@/lib/auth-context";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";
import { shareLink } from "@/lib/share-link";

export default function PostDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const postId = params.id as string;

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const { data: post, isLoading, error } = usePost(postId);
  const deletePost = useDeletePost();

  const handleDelete = async () => {
    if (!postId) return;
    try {
      await deletePost.mutateAsync(postId);
      toast.success("게시글이 삭제되었습니다.");
      navigate("/feed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
    setConfirmDeleteOpen(false);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${postId}`;

    try {
      const result = await shareLink({
        title: `${post?.user.name ?? "러너"}님의 게시글`,
        text: post?.content.slice(0, 120),
        url,
      });

      if (result === "copied") {
        toast.success("링크가 클립보드에 복사되었습니다.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "공유에 실패했습니다.");
    }
  };

  if (!postId || postId === "_") {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-muted-foreground">게시글 ID가 필요합니다.</p>
        <Button onClick={() => navigate("/feed")} variant="link" className="mt-4">
          피드로 돌아가기
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingPage variant="detail" />;
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-3xl border border-destructive/40 bg-destructive/5 px-5 py-5">
          <h2 className="mb-2 text-lg font-semibold text-destructive">오류</h2>
          <p className="text-destructive/80">
            {error instanceof Error ? error.message : "게시글을 찾을 수 없습니다."}
          </p>
          <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === post.user.id;
  const flatWorkouts =
    post.workouts
      ?.map(
        (pw: {
          workout: {
            id: string;
            distance: number;
            duration: number;
            pace: number;
            date: string;
            workoutType?: { name: string };
          };
        }) => pw.workout,
      )
      .filter(Boolean) ?? [];
  const likesCount = post._count?.likes ?? 0;
  const commentsCount = post._count?.comments ?? 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="게시글 삭제"
        description="이 게시글을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다."
        confirmLabel="삭제"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deletePost.isPending}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="-ml-3">
            <ArrowLeft className="size-4" />
            피드
          </Button>
          {isOwner && (
            <div className="flex gap-2">
              <Button onClick={() => navigate(`/posts/${postId}/edit`)} variant="outline" size="sm">
                <Edit className="size-4" />
                수정
              </Button>
              <Button
                onClick={() => setConfirmDeleteOpen(true)}
                variant="destructive"
                size="sm"
                disabled={deletePost.isPending}
              >
                {deletePost.isPending ? "삭제 중..." : "삭제"}
              </Button>
            </div>
          )}
        </div>

        <article
          data-testid="post-detail-document"
          className="overflow-hidden border-y border-border/60 bg-background"
        >
          <section className="px-1 py-5 sm:px-2">
            <PostCard
              id={post.id}
              user={post.user}
              content={post.content}
              hashtags={post.hashtags}
              images={post.images}
              likesCount={likesCount}
              commentsCount={commentsCount}
              isLiked={post.isLiked ?? false}
              createdAt={post.createdAt}
              onShare={handleShare}
            />
          </section>

          {flatWorkouts.length > 0 && (
            <section
              data-testid="post-detail-workouts"
              className="border-t border-border/60 px-1 py-5 sm:px-2"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">연결된 훈련</h2>
                  <p className="text-xs text-muted-foreground">
                    누르면 워크아웃 상세의 안전 요약으로 이동합니다.
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {flatWorkouts.length.toLocaleString()}개
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/15">
                {flatWorkouts.map(
                  (workout: {
                    id: string;
                    distance: number;
                    duration: number;
                    pace: number;
                    date: string;
                    workoutType?: { name: string };
                  }) => (
                    <Link
                      key={workout.id}
                      to={`/workouts/${encodeURIComponent(workout.id)}`}
                      aria-label={`워크아웃 ${workout.workoutType?.name ?? "런닝"} 상세 열기`}
                      className="group flex flex-col gap-4 border-b border-border/60 px-4 py-4 transition-colors last:border-b-0 hover:bg-accent/25 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {workout.workoutType?.name || "런닝"}
                          </p>
                          <span className="rounded-full border border-border/60 bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                            워크아웃 열기
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(workout.date).toLocaleDateString("ko-KR")}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-sm sm:min-w-[18rem] sm:text-right">
                        <div>
                          <p className="text-[11px] text-muted-foreground">거리</p>
                          <p className="font-medium">{formatDistance(workout.distance)} km</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">시간</p>
                          <p className="font-medium">{formatDuration(workout.duration)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">평균 페이스</p>
                          <p className="font-medium">
                            {workout.distance > 0
                              ? formatPace(workout.duration / (workout.distance / 1000))
                              : "-"}{" "}
                            /km
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground sm:justify-end">
                        <span>상세</span>
                        <ArrowRight className="size-3.5" />
                      </div>
                    </Link>
                  ),
                )}
              </div>
            </section>
          )}

          <section
            data-testid="post-detail-comments"
            className="border-t border-border/60 px-1 py-5 sm:px-2"
          >
            <CommentSection postId={postId} />
          </section>
        </article>
      </div>
    </div>
  );
}
