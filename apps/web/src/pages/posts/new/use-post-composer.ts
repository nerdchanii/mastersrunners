import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

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
export type Step = 0 | 1 | 2 | 3;

const MAX_IMAGES = 5;

export function usePostComposer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createPost = useCreatePost();
  const preselectedWorkoutId = searchParams.get("workoutId");

  const [step, setStep] = useState<Step>(0);
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState<string[]>(
    preselectedWorkoutId ? [preselectedWorkoutId] : [],
  );
  const [images, setImages] = useState<ImageUpload[]>([]);
  const [content, setContent] = useState("");
  const [hashtagsInput, setHashtagsInput] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hashtags = hashtagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

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
    if (stepRef.current === 0) {
      navigate(-1);
      return;
    }

    setStep((prev) => (prev - 1) as Step);
    window.history.pushState(null, "", "/posts/new");
  }, [navigate]);

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
        hashtags: hashtags.length > 0 ? hashtags : undefined,
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
    selectedWorkoutIds,
    images,
    content,
    hashtagsInput,
    hashtags,
    visibility,
    isSubmitting,
    setContent,
    setHashtagsInput,
    setVisibility,
    toggleWorkout,
    goNext,
    goBack,
    handleAddImages,
    removeImage,
    handleSubmit,
  };
}
