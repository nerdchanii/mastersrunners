import { toast } from "sonner";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { usePost, useDeletePost } from "@/hooks/usePosts";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { LoadingPage } from "@/components/common/LoadingPage";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";
import { PostCard } from "@/components/post/PostCard";
import { CommentSection } from "@/components/post/CommentSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";

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
      <div className="max-w-2xl mx-auto">
        <Card className="border-destructive/50">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-destructive mb-2">오류</h2>
            <p className="text-destructive/80">
              {error instanceof Error ? error.message : "게시글을 찾을 수 없습니다."}
            </p>
            <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
              돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = user?.id === post.user.id;
  const flatWorkouts = post.workouts?.map((pw) => pw.workout).filter(Boolean) ?? [];
  const likesCount = post._count?.likes ?? 0;
  const commentsCount = post._count?.comments ?? 0;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
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

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button onClick={() => navigate(-1)} variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          돌아가기
        </Button>
        {isOwner && (
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(`/posts/${postId}/edit`)}
              variant="outline"
              size="sm"
            >
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

      <PostCard
        id={post.id}
        user={post.user}
        content={post.content}
        hashtags={post.hashtags}
        likesCount={likesCount}
        commentsCount={commentsCount}
        isLiked={post.isLiked ?? false}
        createdAt={post.createdAt}
      />

      {flatWorkouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">첨부된 훈련 기록</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {flatWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{workout.workoutType?.name || "런닝"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(workout.date).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-right">
                    <div>
                      <p className="text-muted-foreground text-xs">거리</p>
                      <p className="font-medium">{formatDistance(workout.distance)} km</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">시간</p>
                      <p className="font-medium">{formatDuration(workout.duration)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">페이스</p>
                      <p className="font-medium">
                        {workout.distance > 0
                          ? formatPace(workout.duration / (workout.distance / 1000))
                          : "-"}{" "}
                        /km
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <CommentSection postId={postId} />
        </CardContent>
      </Card>
    </div>
  );
}
