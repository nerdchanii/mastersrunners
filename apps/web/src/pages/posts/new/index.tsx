import { ChevronLeft, Eye, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWorkouts } from "@/hooks/useWorkouts";
import { cn } from "@/lib/utils";

import {
  POST_COMPOSER_STEPS,
  PostComposerPhotosStep,
  PostComposerPreviewStep,
  PostComposerTextStep,
  PostComposerWorkoutStep,
} from "./post-composer-steps";
import { usePostComposer } from "./use-post-composer";

export default function NewPostPage() {
  const {
    content,
    goBack,
    goNext,
    handleAddImages,
    handleSubmit,
    hashtags,
    images,
    isSubmitting,
    maxImages,
    mentions,
    removeImage,
    selectedWorkoutIds,
    setContent,
    setVisibility,
    step,
    stepIndex,
    toggleWorkout,
    visibility,
  } = usePostComposer();
  const { data: workouts = [] } = useWorkouts();
  const progress = ((stepIndex + 1) / POST_COMPOSER_STEPS.length) * 100;
  const hasUploadingImage = images.some((image) => image.uploading);
  const hasImageError = images.some((image) => image.error);
  const canSubmit = content.trim() || images.length > 0 || selectedWorkoutIds.length > 0;

  const primaryAction = (() => {
    if (step === "workout") {
      return {
        label: "다음",
        onClick: goNext,
        disabled: false,
        badge: selectedWorkoutIds.length > 0 ? selectedWorkoutIds.length : null,
      };
    }

    if (step === "photos") {
      return {
        label: hasUploadingImage ? "업로드 중..." : "다음",
        onClick: goNext,
        disabled: hasUploadingImage || hasImageError,
        badge: images.length > 0 && !hasUploadingImage ? images.length : null,
      };
    }

    if (step === "text") {
      return {
        label: "미리보기",
        onClick: goNext,
        disabled: false,
        badge: null,
      };
    }

    return {
      label: isSubmitting ? "게시 중..." : "게시하기",
      onClick: handleSubmit,
      disabled: isSubmitting || !canSubmit,
      badge: null,
    };
  })();

  const secondaryAction = (() => {
    if (step === "workout") {
      return { label: "워크아웃 없이 진행", onClick: goNext, disabled: false };
    }

    if (step === "photos") {
      return {
        label: "사진 없이 진행",
        onClick: goNext,
        disabled: hasUploadingImage,
      };
    }

    if (step === "preview") {
      return { label: "수정하기", onClick: goBack, disabled: isSubmitting };
    }

    return null;
  })();

  return (
    <div className="mx-auto max-w-xl pb-32">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button type="button" variant="ghost" size="icon" onClick={goBack}>
            <ChevronLeft className="size-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold">새 게시글</h1>
            <p className="text-xs text-muted-foreground">
              사진과 훈련 기록을 한 흐름으로 정리해 공유합니다.
            </p>
          </div>
        </div>

        <div className="mb-4 inline-flex rounded-full bg-muted p-1">
          <Link
            to="/posts/new"
            className="rounded-full bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm"
          >
            게시글
          </Link>
          <Link
            to="/workouts/new"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            운동 기록
          </Link>
        </div>

        <div
          className="h-1 overflow-hidden rounded-full bg-muted"
          aria-label={`게시글 작성 진행률 ${stepIndex + 1}/${POST_COMPOSER_STEPS.length}`}
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={POST_COMPOSER_STEPS.length}
          aria-valuenow={stepIndex + 1}
        >
          <div
            className="h-full rounded-full bg-foreground transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {step === "workout" && (
        <PostComposerWorkoutStep selectedIds={selectedWorkoutIds} onToggle={toggleWorkout} />
      )}

      {step === "photos" && (
        <PostComposerPhotosStep
          images={images}
          maxImages={maxImages}
          onAddImages={handleAddImages}
          onRemoveImage={removeImage}
        />
      )}

      {step === "text" && (
        <PostComposerTextStep
          content={content}
          hashtags={hashtags}
          images={images}
          mentions={mentions}
          onContentChange={setContent}
          visibility={visibility}
          onVisibilityChange={setVisibility}
        />
      )}

      {step === "preview" && (
        <PostComposerPreviewStep
          content={content}
          hashtags={hashtags}
          mentions={mentions}
          visibility={visibility}
          images={images}
          selectedWorkoutIds={selectedWorkoutIds}
          workouts={workouts}
        />
      )}

      <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-20 mt-6 rounded-3xl border border-border/60 bg-background/95 p-3 shadow-lg backdrop-blur md:bottom-4">
        <div className="flex gap-3">
          {secondaryAction && (
            <Button
              type="button"
              variant="outline"
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled}
              className="flex-1"
            >
              {secondaryAction.label}
            </Button>
          )}

          <Button
            type="button"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            className={cn("min-w-0", secondaryAction ? "flex-1" : "w-full")}
          >
            {isSubmitting && step === "preview" ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            {step === "text" ? <Eye className="mr-2 size-4" /> : null}
            {primaryAction.label}
            {primaryAction.badge ? (
              <Badge variant="secondary" className="ml-2">
                {primaryAction.badge}
              </Badge>
            ) : null}
          </Button>
        </div>
      </div>
    </div>
  );
}
