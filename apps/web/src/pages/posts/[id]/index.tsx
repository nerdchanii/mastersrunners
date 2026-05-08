import { ArrowLeft, Edit } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { LoadingPage } from "@/components/common/LoadingPage";
import { CommentSection } from "@/components/post/CommentSection";
import { PostCard } from "@/components/post/PostCard";
import { Button } from "@/components/ui/button";
import { WorkoutAttachmentPreview } from "@/components/workout/WorkoutAttachmentPreview";
import { useDeletePost, usePost } from "@/hooks/usePosts";
import { useAuth } from "@/lib/auth-context";
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
      <div className="mx-auto max-w-2xl">
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
            elevationGain?: number | null;
            avgHeartRate?: number | null;
            avgCadence?: number | null;
            calories?: number | null;
            workoutType?: { name: string };
            route?: { encodedPolyline: string } | null;
          };
        }) => pw.workout,
      )
      .filter(Boolean) ?? [];
  const likesCount = post._count?.likes ?? 0;
  const commentsCount = post._count?.comments ?? 0;

  return (
    <div className="mx-auto max-w-2xl">
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
              commentHref="#post-comments"
              onShare={handleShare}
            />
          </section>

          {flatWorkouts.length > 0 && (
            <section
              data-testid="post-detail-workouts"
              className="border-t border-border/60 px-1 py-5 sm:px-2"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">연결된 훈련</h2>
                <span className="text-xs text-muted-foreground">
                  {flatWorkouts.length.toLocaleString()}개
                </span>
              </div>

              <div className="space-y-3">
                {flatWorkouts.map(
                  (workout: {
                    id: string;
                    distance: number;
                    duration: number;
                    pace: number;
                    date: string;
                    elevationGain?: number | null;
                    avgHeartRate?: number | null;
                    avgCadence?: number | null;
                    calories?: number | null;
                    workoutType?: { name: string };
                    route?: { encodedPolyline: string } | null;
                  }) => (
                    <WorkoutAttachmentPreview key={workout.id} workout={workout} />
                  ),
                )}
              </div>
            </section>
          )}

          <section
            id="post-comments"
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
