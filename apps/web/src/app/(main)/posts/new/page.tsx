"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

interface Workout {
  id: string;
  distance: number;
  duration: number;
  date: string;
  title?: string;
  workoutType?: { name: string };
}

interface ImageUpload {
  file: File;
  preview: string;
  publicUrl?: string;
  uploading: boolean;
  error?: string;
}

export default function NewPostPage() {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "FOLLOWERS" | "PUBLIC">("PUBLIC");
  const [hashtagsInput, setHashtagsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Workout attachment state
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState<string[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [showWorkoutPicker, setShowWorkoutPicker] = useState(false);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);

  // Image upload state
  const [images, setImages] = useState<ImageUpload[]>([]);

  const maxChars = 2000;
  const charsLeft = maxChars - content.length;
  const maxImages = 5;

  const parseHashtags = (input: string): string[] => {
    return input
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  };

  const hashtags = parseHashtags(hashtagsInput);

  // Load workouts when picker is opened
  useEffect(() => {
    if (showWorkoutPicker && workouts.length === 0) {
      loadWorkouts();
    }
  }, [showWorkoutPicker]);

  const loadWorkouts = async () => {
    setLoadingWorkouts(true);
    try {
      const data = await api.fetch<Workout[]>("/workouts");
      setWorkouts(data);
    } catch (err) {
      console.error("Failed to load workouts:", err);
    } finally {
      setLoadingWorkouts(false);
    }
  };

  const toggleWorkoutSelection = (workoutId: string) => {
    setSelectedWorkoutIds((prev) =>
      prev.includes(workoutId)
        ? prev.filter((id) => id !== workoutId)
        : [...prev, workoutId]
    );
  };

  const removeWorkout = (workoutId: string) => {
    setSelectedWorkoutIds((prev) => prev.filter((id) => id !== workoutId));
  };

  const selectedWorkouts = workouts.filter((w) =>
    selectedWorkoutIds.includes(w.id)
  );

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      setError(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`);
      return;
    }

    const toUpload = files.slice(0, remaining);

    for (const file of toUpload) {
      if (!file.type.startsWith("image/")) {
        continue;
      }

      const preview = URL.createObjectURL(file);
      const newImage: ImageUpload = { file, preview, uploading: true };

      setImages((prev) => [...prev, newImage]);

      try {
        // Request presigned URL
        const { uploadUrl, publicUrl } = await api.fetch<{
          uploadUrl: string;
          key: string;
          publicUrl: string;
        }>("/uploads/presign", {
          method: "POST",
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            folder: "posts",
          }),
        });

        // Upload to R2
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!uploadRes.ok) {
          throw new Error("Upload failed");
        }

        // Update state with publicUrl
        setImages((prev) =>
          prev.map((img) =>
            img.preview === preview
              ? { ...img, publicUrl, uploading: false }
              : img
          )
        );
      } catch (err) {
        console.error("Image upload failed:", err);
        setImages((prev) =>
          prev.map((img) =>
            img.preview === preview
              ? {
                  ...img,
                  uploading: false,
                  error: "업로드 실패",
                }
              : img
          )
        );
      }
    }

    // Reset input
    e.target.value = "";
  };

  const removeImage = (preview: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.preview === preview);
      if (img) {
        URL.revokeObjectURL(img.preview);
      }
      return prev.filter((i) => i.preview !== preview);
    });
  };

  const isUploading = images.some((img) => img.uploading);
  const hasUploadErrors = images.some((img) => img.error);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }

    if (content.length > maxChars) {
      setError(`내용은 ${maxChars}자 이내로 입력해주세요.`);
      return;
    }

    if (isUploading) {
      setError("이미지 업로드가 완료될 때까지 기다려주세요.");
      return;
    }

    if (hasUploadErrors) {
      setError("업로드 실패한 이미지가 있습니다. 제거 후 다시 시도해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrls = images
        .filter((img) => img.publicUrl)
        .map((img) => img.publicUrl!);

      await api.fetch("/posts", {
        method: "POST",
        body: JSON.stringify({
          content: content.trim(),
          visibility,
          hashtags: hashtags.length > 0 ? hashtags : undefined,
          workoutIds:
            selectedWorkoutIds.length > 0 ? selectedWorkoutIds : undefined,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        }),
      });

      // Clean up object URLs
      images.forEach((img) => URL.revokeObjectURL(img.preview));

      router.push("/feed");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">새 게시글</h1>
        <p className="mt-2 text-sm text-gray-600">
          러닝에 대한 이야기를 나눠보세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            {/* Content Textarea */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                placeholder="무슨 생각을 하고 계신가요?"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              />
              <div className="mt-1 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  마음껏 작성해주세요
                </p>
                <p
                  className={`text-xs ${
                    charsLeft < 100 ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  {charsLeft.toLocaleString()} / {maxChars.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Hashtags Input */}
            <div>
              <label htmlFor="hashtags" className="block text-sm font-medium text-gray-700">
                해시태그 (선택)
              </label>
              <input
                type="text"
                id="hashtags"
                value={hashtagsInput}
                onChange={(e) => setHashtagsInput(e.target.value)}
                placeholder="러닝, 마라톤, 훈련 (쉼표로 구분)"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              />
              {hashtags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {hashtags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Workout Attachment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                워크아웃 첨부 (선택)
              </label>
              <button
                type="button"
                onClick={() => setShowWorkoutPicker(!showWorkoutPicker)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                워크아웃 첨부
              </button>

              {/* Selected Workouts Display */}
              {selectedWorkouts.length > 0 && (
                <div className="mt-3 space-y-2">
                  {selectedWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {workout.title || workout.workoutType?.name || "워크아웃"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(workout.date).toLocaleDateString("ko-KR")}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-1 text-xs text-gray-600">
                          <span>{(workout.distance / 1000).toFixed(2)} km</span>
                          <span>
                            {Math.floor(workout.duration / 60)}:
                            {String(workout.duration % 60).padStart(2, "0")}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeWorkout(workout.id)}
                        className="ml-3 text-gray-400 hover:text-red-500"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Workout Picker Panel */}
              {showWorkoutPicker && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                  {loadingWorkouts ? (
                    <div className="flex items-center justify-center py-8">
                      <svg
                        className="animate-spin h-8 w-8 text-indigo-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                  ) : workouts.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      워크아웃이 없습니다.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {workouts.map((workout) => (
                        <label
                          key={workout.id}
                          className="flex items-center p-3 bg-white rounded-md border border-gray-200 hover:border-indigo-300 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedWorkoutIds.includes(workout.id)}
                            onChange={() => toggleWorkoutSelection(workout.id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {workout.title || workout.workoutType?.name || "워크아웃"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(workout.date).toLocaleDateString("ko-KR")}
                              </span>
                            </div>
                            <div className="flex gap-3 mt-1 text-xs text-gray-600">
                              <span>{(workout.distance / 1000).toFixed(2)} km</span>
                              <span>
                                {Math.floor(workout.duration / 60)}:
                                {String(workout.duration % 60).padStart(2, "0")}
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이미지 첨부 (선택, 최대 {maxImages}개)
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 cursor-pointer focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  이미지 선택
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    disabled={images.length >= maxImages}
                    className="sr-only"
                  />
                </label>
                <span className="text-xs text-gray-500">
                  {images.length} / {maxImages}
                </span>
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img) => (
                    <div
                      key={img.preview}
                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                    >
                      <img
                        src={img.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />

                      {/* Upload Status Overlay */}
                      {img.uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <svg
                            className="animate-spin h-8 w-8 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        </div>
                      )}

                      {/* Error Overlay */}
                      {img.error && (
                        <div className="absolute inset-0 bg-red-500 bg-opacity-90 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {img.error}
                          </span>
                        </div>
                      )}

                      {/* Remove Button */}
                      {!img.uploading && (
                        <button
                          type="button"
                          onClick={() => removeImage(img.preview)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}

                      {/* Success Indicator */}
                      {img.publicUrl && !img.uploading && !img.error && (
                        <div className="absolute top-2 left-2 p-1 bg-green-500 text-white rounded-full">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Visibility Select */}
            <div>
              <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                공개 설정
              </label>
              <select
                id="visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as "PRIVATE" | "FOLLOWERS" | "PUBLIC")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              >
                <option value="PRIVATE">비공개</option>
                <option value="FOLLOWERS">팔로워 공개</option>
                <option value="PUBLIC">전체 공개</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                누가 이 게시글을 볼 수 있는지 설정합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                게시 중...
              </>
            ) : (
              "게시"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
