import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useUpdatePost } from "@/hooks/usePosts";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";
import { LoadingPage } from "@/components/common/LoadingPage";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: string;
  name: string;
  profileImage: string | null;
}

interface Workout {
  id: string;
  distance: number;
  duration: number;
  date: string;
  title?: string;
  workoutType?: { name: string };
}

interface PostImage {
  id: string;
  imageUrl: string;
}

interface PostWorkoutRelation {
  workout: Workout;
}

interface Post {
  id: string;
  content: string;
  hashtags?: string[];
  visibility: string;
  createdAt: string;
  user: User;
  workouts?: PostWorkoutRelation[];
  images?: PostImage[];
}

export default function EditPostPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "FOLLOWERS" | "PUBLIC">("PUBLIC");
  const [hashtagsInput, setHashtagsInput] = useState("");

  const updatePost = useUpdatePost(postId);

  const maxChars = 2000;
  const charsLeft = maxChars - content.length;

  const parseHashtags = (input: string): string[] =>
    input.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0);

  const hashtags = parseHashtags(hashtagsInput);
  const flatWorkouts = post?.workouts?.map((pw) => pw.workout).filter(Boolean) ?? [];

  useEffect(() => {
    if (!postId || postId === "_") {
      navigate("/feed");
      return;
    }

    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const data = await api.fetch<Post>(`/posts/${postId}`);

        if (user && data.user.id !== user.id) {
          setFetchError("본인의 게시글만 수정할 수 있습니다.");
          setIsLoading(false);
          return;
        }

        setPost(data);
        setContent(data.content);
        setVisibility(data.visibility as "PRIVATE" | "FOLLOWERS" | "PUBLIC");
        setHashtagsInput(data.hashtags ? data.hashtags.join(", ") : "");
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : "게시글을 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    if (content.length > maxChars) {
      toast.error(`내용은 ${maxChars}자 이내로 입력해주세요.`);
      return;
    }

    try {
      await updatePost.mutateAsync({
        content: content.trim(),
        visibility,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
      });
      toast.success("게시글이 수정되었습니다.");
      navigate(`/posts/${postId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    }
  };

  if (!postId || postId === "_") return null;

  if (isLoading) return <LoadingPage variant="detail" />;

  if (fetchError || !post) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-destructive/50">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-destructive mb-2">오류</h2>
            <p className="text-destructive/80">{fetchError || "게시글을 찾을 수 없습니다."}</p>
            <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
              돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="게시글 수정"
        description="게시글 내용과 설정을 변경할 수 있습니다."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Content */}
            <div className="space-y-1.5">
              <Label htmlFor="content">
                내용 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                placeholder="무슨 생각을 하고 계신가요?"
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>마음껏 작성해주세요</span>
                <span className={charsLeft < 100 ? "text-destructive" : ""}>
                  {charsLeft.toLocaleString()} / {maxChars.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Hashtags */}
            <div className="space-y-1.5">
              <Label htmlFor="hashtags">해시태그 (선택)</Label>
              <Input
                type="text"
                id="hashtags"
                value={hashtagsInput}
                onChange={(e) => setHashtagsInput(e.target.value)}
                placeholder="러닝, 마라톤, 훈련 (쉼표로 구분)"
              />
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag, index) => (
                    <Badge key={index} variant="secondary">#{tag}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Visibility */}
            <div className="space-y-1.5">
              <Label>공개 설정</Label>
              <Select
                value={visibility}
                onValueChange={(val) => setVisibility(val as "PRIVATE" | "FOLLOWERS" | "PUBLIC")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIVATE">비공개</SelectItem>
                  <SelectItem value="FOLLOWERS">팔로워 공개</SelectItem>
                  <SelectItem value="PUBLIC">전체 공개</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                누가 이 게시글을 볼 수 있는지 설정합니다.
              </p>
            </div>

            {/* Attached Workouts (Read-only) */}
            {flatWorkouts.length > 0 && (
              <div className="space-y-1.5">
                <Label>첨부된 워크아웃</Label>
                <div className="space-y-2 p-3 bg-muted rounded-lg">
                  {flatWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between p-3 bg-background rounded-md border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {workout.title || workout.workoutType?.name || "워크아웃"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(workout.date).toLocaleDateString("ko-KR")}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{formatDistance(workout.distance)} km</span>
                          <span>{formatDuration(workout.duration)}</span>
                          <span>
                            {workout.distance > 0
                              ? formatPace(workout.duration / (workout.distance / 1000))
                              : "-"}{" "}
                            /km
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">워크아웃은 수정할 수 없습니다.</p>
              </div>
            )}

            {/* Attached Images (Read-only) */}
            {post.images && post.images.length > 0 && (
              <div className="space-y-1.5">
                <Label>첨부된 이미지</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-muted rounded-lg">
                  {post.images.map((img) => (
                    <div
                      key={img.id}
                      className="relative aspect-square bg-muted-foreground/10 rounded-lg overflow-hidden border"
                    >
                      <img
                        src={img.imageUrl}
                        alt="Post attachment"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">이미지는 수정할 수 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            onClick={() => navigate(`/posts/${postId}`)}
            disabled={updatePost.isPending}
            variant="outline"
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={updatePost.isPending || !content.trim()}
          >
            {updatePost.isPending ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </div>
  );
}
