import { Check, Dumbbell, Image as ImageIcon, Loader2, X } from "lucide-react";

import { UserAvatar } from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useAuth } from "@/lib/auth-context";
import { formatDistance, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { ImageUpload, Visibility } from "./use-post-composer";

export const POST_COMPOSER_STEPS = ["워크아웃", "사진", "내용", "미리보기"] as const;

export function PostComposerWorkoutStep({
  selectedIds,
  onToggle,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const { data: workouts = [], isLoading } = useWorkouts();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">워크아웃 선택</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          첨부할 워크아웃을 선택하세요. (선택사항)
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : workouts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Dumbbell className="mb-3 size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">등록된 워크아웃이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="max-h-[50vh] space-y-2 overflow-y-auto">
          {workouts.map((workout: any) => {
            const selected = selectedIds.includes(workout.id);
            return (
              <button
                key={workout.id}
                type="button"
                onClick={() => onToggle(workout.id)}
                className={cn(
                  "w-full rounded-lg border p-3 text-left transition-colors",
                  "flex items-center gap-3",
                  selected ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50",
                )}
              >
                <div
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                    selected ? "border-primary bg-primary" : "border-muted-foreground",
                  )}
                >
                  {selected && <Check className="size-3 text-primary-foreground" />}
                </div>
                <div className="min-w-0 flex-1">
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
    </div>
  );
}

export function PostComposerPhotosStep({
  images,
  maxImages,
  onAddImages,
  onRemoveImage,
}: {
  images: ImageUpload[];
  maxImages: number;
  onAddImages: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (preview: string) => void;
}) {
  const hasError = images.some((image) => image.error);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">사진 선택</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          게시글에 첨부할 사진을 선택하세요. (최대 {maxImages}개, 선택사항)
        </p>
      </div>

      {images.length < maxImages && (
        <Label
          htmlFor="image-input"
          className={cn(
            "flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
            "border-muted-foreground/30 hover:border-primary/50 hover:bg-accent/30",
          )}
        >
          <ImageIcon className="mb-2 size-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">클릭하여 사진 선택</span>
          <span className="mt-1 text-xs text-muted-foreground">
            {images.length} / {maxImages}
          </span>
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

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image) => (
            <div
              key={image.preview}
              className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              <img src={image.preview} alt="미리보기" className="h-full w-full object-cover" />
              {image.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="size-5 animate-spin text-white" />
                </div>
              )}
              {image.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-destructive/80">
                  <span className="text-xs text-white">{image.error}</span>
                </div>
              )}
              {!image.uploading && (
                <button
                  type="button"
                  onClick={() => onRemoveImage(image.preview)}
                  className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
                >
                  <X className="size-3" />
                </button>
              )}
              {image.publicUrl && !image.uploading && !image.error && (
                <div className="absolute bottom-1 right-1 flex size-5 items-center justify-center rounded-full bg-green-500">
                  <Check className="size-3 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {hasError && (
        <p className="text-xs text-destructive">
          업로드 실패한 이미지가 있습니다. 제거 후 다시 시도해주세요.
        </p>
      )}
    </div>
  );
}

export function PostComposerTextStep({
  content,
  hashtagsInput,
  visibility,
  onContentChange,
  onHashtagsChange,
  onVisibilityChange,
}: {
  content: string;
  hashtagsInput: string;
  visibility: Visibility;
  onContentChange: (value: string) => void;
  onHashtagsChange: (value: string) => void;
  onVisibilityChange: (value: Visibility) => void;
}) {
  const maxChars = 2000;
  const charsLeft = maxChars - content.length;
  const hashtags = hashtagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">내용 작성</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">게시글 내용을 입력해주세요.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          rows={6}
          placeholder="무슨 생각을 하고 계신가요?"
          maxLength={maxChars}
          autoFocus
        />
        <p
          className={cn(
            "text-right text-xs",
            charsLeft < 100 ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {charsLeft.toLocaleString()} / {maxChars.toLocaleString()}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hashtags">해시태그 (선택)</Label>
        <Input
          id="hashtags"
          value={hashtagsInput}
          onChange={(event) => onHashtagsChange(event.target.value)}
          placeholder="러닝, 마라톤, 훈련 (쉼표로 구분)"
        />
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {hashtags.map((tag, index) => (
              <Badge key={`${tag}-${index}`} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>공개 설정</Label>
        <Select
          value={visibility}
          onValueChange={(value) => onVisibilityChange(value as Visibility)}
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
      </div>
    </div>
  );
}

export function PostComposerPreviewStep({
  content,
  hashtags,
  visibility,
  images,
  selectedWorkoutIds,
  workouts,
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
}) {
  const { user } = useAuth();
  const selectedWorkouts = workouts.filter((workout) => selectedWorkoutIds.includes(workout.id));
  const visibilityLabel = {
    PRIVATE: "비공개",
    FOLLOWERS: "팔로워 공개",
    PUBLIC: "전체 공개",
  }[visibility];
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">미리보기</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">게시 전 내용을 확인하세요.</p>
      </div>

      <Card>
        <CardContent className="space-y-3 pt-4">
          {user && (
            <UserAvatar
              user={{ id: user.id, name: user.name, profileImage: user.profileImage ?? null }}
              showName
            />
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5">
              {images.map((image) => (
                <div
                  key={image.preview}
                  className="aspect-square overflow-hidden rounded-lg border bg-muted"
                >
                  <img
                    src={image.preview}
                    alt="첨부 이미지"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {content && <p className="whitespace-pre-wrap text-sm">{content}</p>}

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hashtags.map((tag, index) => (
                <Badge key={`${tag}-${index}`} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {selectedWorkouts.length > 0 && (
            <div className="space-y-1.5 border-t pt-1">
              {selectedWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Dumbbell className="size-3.5" />
                  <span>{workout.workoutType?.name ?? "워크아웃"}</span>
                  <span className="text-xs">
                    · {formatDistance(workout.distance)} km · {formatDuration(workout.duration)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-1 text-xs text-muted-foreground">
            <span>공개 설정</span>
            <Badge variant="outline">{visibilityLabel}</Badge>
          </div>
        </CardContent>
      </Card>

      {!content.trim() && images.length === 0 && selectedWorkoutIds.length === 0 && (
        <p className="text-center text-sm text-destructive">
          내용, 이미지, 워크아웃 중 하나 이상을 추가해야 합니다.
        </p>
      )}
    </div>
  );
}
