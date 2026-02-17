import { toast } from "sonner";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useCreatePost } from "@/hooks/usePosts";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useAuth } from "@/lib/auth-context";
import { formatDistance, formatDuration } from "@/lib/format";
import {
  Check,
  ChevronLeft,
  X,
  Loader2,
  Image as ImageIcon,
  Dumbbell,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── 타입 ────────────────────────────────────────────────────
interface ImageUpload {
  file: File;
  preview: string;
  publicUrl?: string;
  uploading: boolean;
  error?: string;
}

type Visibility = "PRIVATE" | "FOLLOWERS" | "PUBLIC";

const STEPS = ["워크아웃", "사진", "내용", "미리보기"] as const;
type Step = 0 | 1 | 2 | 3;

// ─── Step 1: 워크아웃 선택 ───────────────────────────────────
function StepWorkout({
  selectedIds,
  onToggle,
  onSkip,
  onNext,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSkip: () => void;
  onNext: () => void;
}) {
  const { data: workouts = [], isLoading } = useWorkouts();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">워크아웃 선택</h2>
        <p className="text-sm text-muted-foreground mt-0.5">첨부할 워크아웃을 선택하세요. (선택사항)</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : workouts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Dumbbell className="size-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">등록된 워크아웃이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {workouts.map((workout: any) => {
            const selected = selectedIds.includes(workout.id);
            return (
              <button
                key={workout.id}
                type="button"
                onClick={() => onToggle(workout.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent/50"
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 size-5 rounded-full border-2 flex items-center justify-center",
                    selected ? "border-primary bg-primary" : "border-muted-foreground"
                  )}
                >
                  {selected && <Check className="size-3 text-primary-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{workout.workoutType?.name ?? "워크아웃"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistance(workout.distance)} km · {formatDuration(workout.duration)} ·{" "}
                    {new Date(workout.date).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSkip} className="flex-1">
          워크아웃 없이 진행
        </Button>
        <Button type="button" onClick={onNext} className="flex-1">
          다음
          {selectedIds.length > 0 && (
            <Badge variant="secondary" className="ml-2">{selectedIds.length}</Badge>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Step 2: 사진 선택 ───────────────────────────────────────
function StepPhotos({
  images,
  onAddImages,
  onRemoveImage,
  onSkip,
  onNext,
}: {
  images: ImageUpload[];
  onAddImages: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (preview: string) => void;
  onSkip: () => void;
  onNext: () => void;
}) {
  const maxImages = 5;
  const isUploading = images.some((img) => img.uploading);
  const hasError = images.some((img) => img.error);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">사진 선택</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          게시글에 첨부할 사진을 선택하세요. (최대 {maxImages}개, 선택사항)
        </p>
      </div>

      {/* 업로드 버튼 */}
      {images.length < maxImages && (
        <Label
          htmlFor="image-input"
          className={cn(
            "flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            "border-muted-foreground/30 hover:border-primary/50 hover:bg-accent/30"
          )}
        >
          <ImageIcon className="size-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">클릭하여 사진 선택</span>
          <span className="text-xs text-muted-foreground mt-1">{images.length} / {maxImages}</span>
          <input
            id="image-input"
            type="file"
            accept="image/*"
            multiple
            onChange={onAddImages}
            className="sr-only"
          />
        </Label>
      )}

      {/* 이미지 그리드 */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <div
              key={img.preview}
              className="relative aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              <img src={img.preview} alt="미리보기" className="w-full h-full object-cover" />
              {img.uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-white" />
                </div>
              )}
              {img.error && (
                <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center">
                  <span className="text-white text-xs">{img.error}</span>
                </div>
              )}
              {!img.uploading && (
                <button
                  type="button"
                  onClick={() => onRemoveImage(img.preview)}
                  className="absolute top-1 right-1 size-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black"
                >
                  <X className="size-3" />
                </button>
              )}
              {img.publicUrl && !img.uploading && !img.error && (
                <div className="absolute bottom-1 right-1 size-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="size-3 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {hasError && (
        <p className="text-xs text-destructive">업로드 실패한 이미지가 있습니다. 제거 후 다시 시도해주세요.</p>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSkip} className="flex-1" disabled={isUploading}>
          사진 없이 진행
        </Button>
        <Button type="button" onClick={onNext} className="flex-1" disabled={isUploading || hasError}>
          {isUploading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              업로드 중...
            </>
          ) : "다음"}
          {images.length > 0 && !isUploading && (
            <Badge variant="secondary" className="ml-2">{images.length}</Badge>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3: 텍스트 + 설정 ───────────────────────────────────
function StepText({
  content,
  onContentChange,
  hashtagsInput,
  onHashtagsChange,
  visibility,
  onVisibilityChange,
  onNext,
}: {
  content: string;
  onContentChange: (v: string) => void;
  hashtagsInput: string;
  onHashtagsChange: (v: string) => void;
  visibility: Visibility;
  onVisibilityChange: (v: Visibility) => void;
  onNext: () => void;
}) {
  const maxChars = 2000;
  const charsLeft = maxChars - content.length;

  const hashtags = hashtagsInput
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">내용 작성</h2>
        <p className="text-sm text-muted-foreground mt-0.5">게시글 내용을 입력해주세요.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          rows={6}
          placeholder="무슨 생각을 하고 계신가요?"
          maxLength={maxChars}
          autoFocus
        />
        <p className={cn(
          "text-xs text-right",
          charsLeft < 100 ? "text-destructive" : "text-muted-foreground"
        )}>
          {charsLeft.toLocaleString()} / {maxChars.toLocaleString()}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hashtags">해시태그 (선택)</Label>
        <Input
          id="hashtags"
          value={hashtagsInput}
          onChange={(e) => onHashtagsChange(e.target.value)}
          placeholder="러닝, 마라톤, 훈련 (쉼표로 구분)"
        />
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {hashtags.map((tag, i) => (
              <Badge key={i} variant="secondary">#{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>공개 설정</Label>
        <Select value={visibility} onValueChange={(v) => onVisibilityChange(v as Visibility)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PRIVATE">비공개</SelectItem>
            <SelectItem value="FOLLOWERS">팔로워 공개</SelectItem>
            <SelectItem value="PUBLIC">전체 공개</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="button" onClick={onNext} className="w-full">
        미리보기
        <Eye className="size-4 ml-2" />
      </Button>
    </div>
  );
}

// ─── Step 4: 미리보기 + 게시 ─────────────────────────────────
function StepPreview({
  content,
  hashtags,
  visibility,
  images,
  selectedWorkoutIds,
  workouts,
  onSubmit,
  isSubmitting,
}: {
  content: string;
  hashtags: string[];
  visibility: Visibility;
  images: ImageUpload[];
  selectedWorkoutIds: string[];
  workouts: Array<{
    id: string;
    distance: number;
    duration: number;
    date: string;
    workoutType?: { name: string };
  }>;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const { user } = useAuth();
  const selectedWorkouts = workouts.filter((w) => selectedWorkoutIds.includes(w.id));
  const visibilityLabel = {
    PRIVATE: "비공개",
    FOLLOWERS: "팔로워 공개",
    PUBLIC: "전체 공개",
  }[visibility];

  const canPost = content.trim() || images.length > 0 || selectedWorkoutIds.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">미리보기</h2>
        <p className="text-sm text-muted-foreground mt-0.5">게시 전 내용을 확인하세요.</p>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-3">
          {/* 작성자 */}
          {user && (
            <UserAvatar
              user={{ id: user.id, name: user.name, profileImage: user.profileImage ?? null }}
              showName
            />
          )}

          {/* 이미지 */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5">
              {images.map((img) => (
                <div key={img.preview} className="aspect-square rounded-lg overflow-hidden border bg-muted">
                  <img src={img.preview} alt="첨부 이미지" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* 내용 */}
          {content && (
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          )}

          {/* 해시태그 */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hashtags.map((tag, i) => (
                <Badge key={i} variant="secondary">#{tag}</Badge>
              ))}
            </div>
          )}

          {/* 워크아웃 */}
          {selectedWorkouts.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t">
              {selectedWorkouts.map((workout) => (
                <div key={workout.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Dumbbell className="size-3.5" />
                  <span>{workout.workoutType?.name ?? "워크아웃"}</span>
                  <span className="text-xs">· {formatDistance(workout.distance)} km · {formatDuration(workout.duration)}</span>
                </div>
              ))}
            </div>
          )}

          {/* 공개 설정 */}
          <div className="flex items-center justify-between pt-1 border-t text-xs text-muted-foreground">
            <span>공개 설정</span>
            <Badge variant="outline">{visibilityLabel}</Badge>
          </div>
        </CardContent>
      </Card>

      {!canPost && (
        <p className="text-sm text-destructive text-center">
          내용, 이미지, 워크아웃 중 하나 이상을 추가해야 합니다.
        </p>
      )}

      <Button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting || !canPost}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            게시 중...
          </>
        ) : "게시하기"}
      </Button>
    </div>
  );
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────
export default function NewPostPage() {
  const navigate = useNavigate();
  const createPost = useCreatePost();
  const { data: workouts = [] } = useWorkouts();

  const [step, setStep] = useState<Step>(0);
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState<string[]>([]);
  const [images, setImages] = useState<ImageUpload[]>([]);
  const [content, setContent] = useState("");
  const [hashtagsInput, setHashtagsInput] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxImages = 5;
  const hashtags = hashtagsInput.split(",").map((t) => t.trim()).filter((t) => t.length > 0);

  // 브라우저 back 버튼 처리
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    const handlePopState = () => {
      if (stepRef.current > 0) {
        setStep((prev) => (prev - 1) as Step);
        window.history.pushState(null, "", "/posts/new");
      }
    };

    window.history.pushState(null, "", "/posts/new");
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const goNext = useCallback(() => {
    window.history.pushState(null, "", "/posts/new");
    setStep((prev) => (prev + 1) as Step);
  }, []);

  const goBack = useCallback(() => {
    if (step === 0) {
      navigate(-1);
    } else {
      setStep((prev) => (prev - 1) as Step);
      window.history.pushState(null, "", "/posts/new");
    }
  }, [step, navigate]);

  // 이미지 업로드
  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = maxImages - images.length;
    const toUpload = files.slice(0, remaining);

    for (const file of toUpload) {
      if (!file.type.startsWith("image/")) continue;
      const preview = URL.createObjectURL(file);
      setImages((prev) => [...prev, { file, preview, uploading: true }]);
      try {
        const { uploadUrl, publicUrl } = await api.fetch<{
          uploadUrl: string;
          key: string;
          publicUrl: string;
        }>("/uploads/presign", {
          method: "POST",
          body: JSON.stringify({ filename: file.name, contentType: file.type, folder: "posts" }),
        });
        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        setImages((prev) =>
          prev.map((img) => img.preview === preview ? { ...img, publicUrl, uploading: false } : img)
        );
      } catch {
        setImages((prev) =>
          prev.map((img) =>
            img.preview === preview ? { ...img, uploading: false, error: "업로드 실패" } : img
          )
        );
      }
    }
    e.target.value = "";
  };

  const removeImage = (preview: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.preview === preview);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.preview !== preview);
    });
  };

  // cleanup
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    const imageUrls = images.filter((img) => img.publicUrl).map((img) => img.publicUrl!);
    setIsSubmitting(true);
    try {
      await createPost.mutateAsync({
        content: content.trim(),
        visibility,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
        workoutIds: selectedWorkoutIds.length > 0 ? selectedWorkoutIds : undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      });
      toast.success("게시글이 작성되었습니다.");
      navigate("/feed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      {/* 헤더 + 스텝 인디케이터 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button type="button" variant="ghost" size="icon" onClick={goBack}>
            <ChevronLeft className="size-5" />
          </Button>
          <h1 className="text-xl font-bold">새 게시글</h1>
        </div>

        {/* 스텝 바 */}
        <div className="flex gap-1">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1">
              <div
                className={cn(
                  "h-1 rounded-full transition-colors",
                  i <= step ? "bg-primary" : "bg-muted"
                )}
              />
              <p className={cn(
                "text-[10px] mt-1 text-center transition-colors",
                i === step ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Step 콘텐츠 */}
      {step === 0 && (
        <StepWorkout
          selectedIds={selectedWorkoutIds}
          onToggle={(id) =>
            setSelectedWorkoutIds((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            )
          }
          onSkip={goNext}
          onNext={goNext}
        />
      )}

      {step === 1 && (
        <StepPhotos
          images={images}
          onAddImages={handleAddImages}
          onRemoveImage={removeImage}
          onSkip={goNext}
          onNext={goNext}
        />
      )}

      {step === 2 && (
        <StepText
          content={content}
          onContentChange={setContent}
          hashtagsInput={hashtagsInput}
          onHashtagsChange={setHashtagsInput}
          visibility={visibility}
          onVisibilityChange={setVisibility}
          onNext={goNext}
        />
      )}

      {step === 3 && (
        <StepPreview
          content={content}
          hashtags={hashtags}
          visibility={visibility}
          images={images}
          selectedWorkoutIds={selectedWorkoutIds}
          workouts={workouts}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
