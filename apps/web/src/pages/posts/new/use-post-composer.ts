import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { type FunnelHistory, useFunnel } from "@/components/ui/funnel";
import { useCreatePost } from "@/hooks/usePosts";
import { api } from "@/lib/api-client";

export interface ImageUpload {
  file: File;
  preview: string;
  publicUrl?: string;
  uploading: boolean;
  error?: string;
}

export type Visibility = "PRIVATE" | "FOLLOWERS" | "PUBLIC";
export type PostComposerStep = (typeof POST_COMPOSER_FUNNEL_STEPS)[number];

type PostComposerFunnel = {
  workout: { selectedWorkoutIds: string[] };
  photos: { selectedWorkoutIds: string[]; images: ImageUpload[] };
  text: {
    selectedWorkoutIds: string[];
    images: ImageUpload[];
    content: string;
    visibility: Visibility;
  };
  preview: {
    selectedWorkoutIds: string[];
    images: ImageUpload[];
    content: string;
    visibility: Visibility;
  };
};

const MAX_IMAGES = 5;
const POST_COMPOSER_FUNNEL_STEPS = ["workout", "photos", "text", "preview"] as const;
const HASHTAG_PATTERN = /(^|\s)#([\w가-힣]+)/g;
const MENTION_PATTERN = /(^|\s)@([\w가-힣._]+)/g;

function extractUniqueMatches(content: string, pattern: RegExp, prefix: string) {
  const matches = Array.from(content.matchAll(pattern), (match) => match[2]?.trim()).filter(
    (value): value is string => Boolean(value),
  );

  return Array.from(new Set(matches)).map((value) => `${prefix}${value}`);
}

function replaceStepContext(
  history: FunnelHistory<PostComposerFunnel>,
  step: PostComposerStep,
  state: {
    selectedWorkoutIds: string[];
    images: ImageUpload[];
    content: string;
    visibility: Visibility;
  },
): void {
  if (step === "workout") {
    history.replace("workout", { selectedWorkoutIds: state.selectedWorkoutIds });
    return;
  }

  if (step === "photos") {
    history.replace("photos", {
      selectedWorkoutIds: state.selectedWorkoutIds,
      images: state.images,
    });
    return;
  }

  if (step === "text") {
    history.replace("text", {
      selectedWorkoutIds: state.selectedWorkoutIds,
      images: state.images,
      content: state.content,
      visibility: state.visibility,
    });
    return;
  }

  history.replace("preview", {
    selectedWorkoutIds: state.selectedWorkoutIds,
    images: state.images,
    content: state.content,
    visibility: state.visibility,
  });
}

export function usePostComposer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createPost = useCreatePost();
  const preselectedWorkoutId = searchParams.get("workoutId");
  const initialSelectedWorkoutIds = preselectedWorkoutId ? [preselectedWorkoutId] : [];

  const funnel = useFunnel<PostComposerFunnel>({
    id: "post-composer",
    initialStep: "workout",
    initialContext: { selectedWorkoutIds: initialSelectedWorkoutIds },
    steps: POST_COMPOSER_FUNNEL_STEPS,
    sync: "history",
  });

  const initialContext = funnel.context as Partial<
    PostComposerFunnel["workout"] &
      PostComposerFunnel["photos"] &
      PostComposerFunnel["text"] &
      PostComposerFunnel["preview"]
  >;
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState<string[]>(
    Array.isArray(initialContext.selectedWorkoutIds)
      ? initialContext.selectedWorkoutIds
      : initialSelectedWorkoutIds,
  );
  const [images, setImages] = useState<ImageUpload[]>(
    Array.isArray(initialContext.images) ? initialContext.images : [],
  );
  const [content, setContent] = useState(
    typeof initialContext.content === "string" ? initialContext.content : "",
  );
  const [visibility, setVisibility] = useState<Visibility>(
    initialContext.visibility === "PRIVATE" ||
      initialContext.visibility === "FOLLOWERS" ||
      initialContext.visibility === "PUBLIC"
      ? initialContext.visibility
      : "PUBLIC",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hashtags = extractUniqueMatches(content, HASHTAG_PATTERN, "#");
  const mentions = extractUniqueMatches(content, MENTION_PATTERN, "@");

  const step = funnel.step;
  const stepIndex = POST_COMPOSER_FUNNEL_STEPS.indexOf(step);
  const stepRef = useRef<PostComposerStep>(step);
  stepRef.current = step;

  useEffect(() => {
    const context = funnel.context as Partial<
      PostComposerFunnel["workout"] &
        PostComposerFunnel["photos"] &
        PostComposerFunnel["text"] &
        PostComposerFunnel["preview"]
    >;

    if (Array.isArray(context.selectedWorkoutIds)) {
      setSelectedWorkoutIds(context.selectedWorkoutIds);
    }

    if ("images" in context && Array.isArray(context.images)) {
      setImages(context.images);
    }

    if ("content" in context && typeof context.content === "string") {
      setContent(context.content);
    }

    if (
      context.visibility === "PRIVATE" ||
      context.visibility === "FOLLOWERS" ||
      context.visibility === "PUBLIC"
    ) {
      setVisibility(context.visibility);
    }
  }, [funnel.context, step]);

  useEffect(() => {
    replaceStepContext(funnel.history, step, {
      selectedWorkoutIds,
      images,
      content,
      visibility,
    });
  }, [content, funnel.history, images, selectedWorkoutIds, step, visibility]);

  const goNext = useCallback(() => {
    if (stepRef.current === "workout") {
      funnel.history.push("photos", {
        selectedWorkoutIds,
        images,
      });
      return;
    }

    if (stepRef.current === "photos") {
      funnel.history.push("text", {
        selectedWorkoutIds,
        images,
        content,
        visibility,
      });
      return;
    }

    if (stepRef.current === "text") {
      funnel.history.push("preview", {
        selectedWorkoutIds,
        images,
        content,
        visibility,
      });
    }
  }, [content, funnel.history, images, selectedWorkoutIds, visibility]);

  const goBack = useCallback(() => {
    if (stepRef.current === "workout") {
      navigate(-1);
      return;
    }

    funnel.history.back();
  }, [funnel.history, navigate]);

  const toggleWorkout = useCallback((id: string) => {
    setSelectedWorkoutIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const handleAddImages = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (!files.length) return;

      const remaining = MAX_IMAGES - images.length;
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
            prev.map((image) =>
              image.preview === preview ? { ...image, publicUrl, uploading: false } : image,
            ),
          );
        } catch {
          setImages((prev) =>
            prev.map((image) =>
              image.preview === preview
                ? { ...image, uploading: false, error: "업로드 실패" }
                : image,
            ),
          );
        }
      }

      event.target.value = "";
    },
    [images.length],
  );

  const removeImage = useCallback((preview: string) => {
    setImages((prev) => {
      const target = prev.find((image) => image.preview === preview);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((image) => image.preview !== preview);
    });
  }, []);

  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

  const handleSubmit = useCallback(async () => {
    const imageUrls = images.filter((image) => image.publicUrl).map((image) => image.publicUrl!);
    setIsSubmitting(true);

    try {
      await createPost.mutateAsync({
        content: content.trim(),
        visibility,
        hashtags: hashtags.length > 0 ? hashtags.map((tag) => tag.replace(/^#/, "")) : undefined,
        workoutIds: selectedWorkoutIds.length > 0 ? selectedWorkoutIds : undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      });
      toast.success("게시글이 작성되었습니다.");
      navigate("/feed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }, [content, createPost, hashtags, images, navigate, selectedWorkoutIds, visibility]);

  return {
    maxImages: MAX_IMAGES,
    step,
    stepIndex,
    selectedWorkoutIds,
    images,
    content,
    hashtags,
    mentions,
    visibility,
    isSubmitting,
    setContent,
    setVisibility,
    toggleWorkout,
    goNext,
    goBack,
    handleAddImages,
    removeImage,
    handleSubmit,
  };
}
