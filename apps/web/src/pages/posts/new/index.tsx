import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

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
    hashtagsInput,
    images,
    isSubmitting,
    maxImages,
    removeImage,
    selectedWorkoutIds,
    setContent,
    setHashtagsInput,
    setVisibility,
    step,
    toggleWorkout,
    visibility,
  } = usePostComposer();
  const { data: workouts = [] } = useWorkouts();

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button type="button" variant="ghost" size="icon" onClick={goBack}>
            <ChevronLeft className="size-5" />
          </Button>
          <h1 className="text-xl font-bold">새 게시글</h1>
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

        <div className="flex gap-1">
          {POST_COMPOSER_STEPS.map((label, i) => (
            <div key={label} className="flex-1">
              <div
                className={cn(
                  "h-1 rounded-full transition-colors",
                  i <= step ? "bg-primary" : "bg-muted",
                )}
              />
              <p
                className={cn(
                  "text-[10px] mt-1 text-center transition-colors",
                  i === step ? "text-primary font-medium" : "text-muted-foreground",
                )}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {step === 0 && (
        <PostComposerWorkoutStep
          selectedIds={selectedWorkoutIds}
          onToggle={toggleWorkout}
          onSkip={goNext}
          onNext={goNext}
        />
      )}

      {step === 1 && (
        <PostComposerPhotosStep
          images={images}
          maxImages={maxImages}
          onAddImages={handleAddImages}
          onRemoveImage={removeImage}
          onSkip={goNext}
          onNext={goNext}
        />
      )}

      {step === 2 && (
        <PostComposerTextStep
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
        <PostComposerPreviewStep
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
