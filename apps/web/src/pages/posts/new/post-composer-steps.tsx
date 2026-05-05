import { Check, Dumbbell, Image as ImageIcon, Images, Loader2, Plus, X } from "lucide-react";
import { useRef } from "react";

import { UserAvatar } from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

function ComposerFormattedText({ content, emptyText }: { content: string; emptyText: string }) {
  if (!content.trim()) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  const segments = content.split(/(#[\w가-힣]+|@[\w가-힣._]+)/g);

  return (
    <p className="whitespace-pre-wrap break-words text-sm text-foreground">
      {segments.map((segment, index) => {
        if (!segment) {
          return null;
        }

        if (segment.startsWith("#")) {
          return (
            <span
              key={`${segment}-${index}`}
              className="font-medium text-foreground underline decoration-primary/50 underline-offset-4"
            >
              {segment}
            </span>
          );
        }

        if (segment.startsWith("@")) {
          return (
            <span
              key={`${segment}-${index}`}
              className="font-medium text-sky-600 dark:text-sky-400"
            >
              {segment}
            </span>
          );
        }

        return <span key={`${segment}-${index}`}>{segment}</span>;
      })}
    </p>
  );
}

function ComposerSelectedMediaStrip({
  images,
  title = "선택한 사진",
}: {
  images: ImageUpload[];
  title?: string;
}) {
  if (images.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-border/60 bg-muted/30 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-background">
            <Images className="size-4 text-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{images.length}장 선택됨</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((image, index) => (
          <div
            key={image.preview}
            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-background"
          >
            <img
              src={image.preview}
              alt={`선택한 사진 ${index + 1}`}
              className="h-full w-full object-cover"
            />
            {image.uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="size-4 animate-spin text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasError = images.some((image) => image.error);
  const hasUploading = images.some((image) => image.uploading);
  const remainingSlots = Math.max(maxImages - images.length, 0);
  const placeholderCount = Math.max(0, 9 - images.length - (remainingSlots > 0 ? 1 : 0));

  const openPicker = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">사진 선택</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          모바일에서 바로 사진첩을 열어 여러 장을 고르고, 선택한 이미지를 다음 단계에서도 계속
          확인할 수 있습니다.
        </p>
      </div>

      <section className="rounded-3xl border border-border/60 bg-background p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">사진첩에서 선택</p>
            <p className="text-sm text-muted-foreground">
              브라우저가 허용하는 사진첩 선택기를 엽니다. 최대 {maxImages}장까지 첨부할 수 있습니다.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={openPicker}
            disabled={remainingSlots === 0}
          >
            <ImageIcon className="mr-2 size-4" />
            {remainingSlots === 0 ? "최대 첨부 완료" : "사진첩 열기"}
          </Button>
        </div>

        <input
          ref={inputRef}
          id="image-input"
          type="file"
          accept="image/*"
          multiple
          onChange={onAddImages}
          className="sr-only"
        />

        <div className="grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div
              key={image.preview}
              className="relative aspect-square overflow-hidden rounded-2xl border bg-muted"
            >
              <img
                src={image.preview}
                alt={`선택한 사진 ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                {index + 1}
              </div>
              {image.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="size-5 animate-spin text-white" />
                </div>
              )}
              {image.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-destructive/80 p-2 text-center">
                  <span className="text-xs text-white">{image.error}</span>
                </div>
              )}
              {!image.uploading && (
                <button
                  type="button"
                  onClick={() => onRemoveImage(image.preview)}
                  className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
                  aria-label="선택한 사진 제거"
                >
                  <X className="size-3.5" />
                </button>
              )}
              {image.publicUrl && !image.uploading && !image.error && (
                <div className="absolute bottom-2 right-2 flex size-6 items-center justify-center rounded-full bg-green-500">
                  <Check className="size-3.5 text-white" />
                </div>
              )}
            </div>
          ))}

          {remainingSlots > 0 && (
            <button
              type="button"
              onClick={openPicker}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40 text-center transition-colors",
                "hover:border-primary/40 hover:bg-primary/5",
              )}
            >
              <div className="mb-2 flex size-10 items-center justify-center rounded-2xl bg-background">
                <Plus className="size-4 text-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">사진 추가</span>
              <span className="mt-1 text-xs text-muted-foreground">
                {images.length} / {maxImages}
              </span>
            </button>
          )}

          {Array.from({ length: placeholderCount }).map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="aspect-square rounded-2xl border border-dashed border-border/60 bg-muted/20"
              aria-hidden="true"
            />
          ))}
        </div>
      </section>

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          선택한 사진은 다음 내용 작성 단계 상단에도 유지됩니다.
          {hasUploading ? " 업로드가 끝날 때까지 잠시 기다려주세요." : ""}
        </p>
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
  hashtags,
  images,
  mentions,
  visibility,
  onContentChange,
  onVisibilityChange,
}: {
  content: string;
  hashtags: string[];
  images: ImageUpload[];
  mentions: string[];
  visibility: Visibility;
  onContentChange: (value: string) => void;
  onVisibilityChange: (value: Visibility) => void;
}) {
  const maxChars = 2000;
  const charsLeft = maxChars - content.length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">내용 작성</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          내용, 해시태그, 멘션을 한 입력창에서 작성하세요.
        </p>
      </div>

      <ComposerSelectedMediaStrip images={images} title="이 게시글에 첨부될 사진" />

      <div className="space-y-1.5">
        <Label htmlFor="content">텍스트 작성</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          rows={8}
          placeholder="오늘 러닝 어땠나요? #한강 @러너김"
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

      <section className="rounded-3xl border border-border/60 bg-muted/30 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">자동 인식된 태그</p>
            <p className="text-xs text-muted-foreground">
              해시태그와 멘션은 입력문에서 자동으로 추출됩니다.
            </p>
          </div>
          <Badge variant="outline">
            #{hashtags.length} · @{mentions.length}
          </Badge>
        </div>

        {hashtags.length > 0 || mentions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {mentions.map((mention) => (
              <Badge key={mention} variant="outline" className="border-sky-500/40 text-sky-700">
                {mention}
              </Badge>
            ))}
            {hashtags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            아직 감지된 해시태그나 멘션이 없습니다. `#태그`, `@이름` 형식으로 입력해보세요.
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-border/60 bg-background p-4 shadow-sm">
        <div className="mb-3 space-y-1">
          <p className="text-sm font-semibold text-foreground">실시간 미리보기</p>
          <p className="text-xs text-muted-foreground">
            해시태그와 멘션이 실제 게시물 톤으로 어떻게 보일지 바로 확인합니다.
          </p>
        </div>
        <ComposerFormattedText
          content={content}
          emptyText="작성한 텍스트가 여기에 미리보기로 나타납니다."
        />
      </section>

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
  mentions,
  visibility,
  images,
  selectedWorkoutIds,
  workouts,
}: {
  content: string;
  hashtags: string[];
  mentions: string[];
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

          <ComposerFormattedText
            content={content}
            emptyText="텍스트 없이도 사진과 워크아웃만으로 게시할 수 있습니다."
          />

          {mentions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {mentions.map((mention) => (
                <Badge key={mention} variant="outline" className="border-sky-500/40 text-sky-700">
                  {mention}
                </Badge>
              ))}
            </div>
          )}

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hashtags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
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
