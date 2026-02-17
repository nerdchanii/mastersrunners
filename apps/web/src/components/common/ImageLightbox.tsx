import { useState, useEffect, useCallback } from "react";
import { Dialog } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageLightboxProps {
  images: Array<{ url: string; alt?: string }>;
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageLightbox({ images, initialIndex = 0, open, onOpenChange }: ImageLightboxProps) {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    if (open) setCurrent(initialIndex);
  }, [open, initialIndex]);

  const goPrev = useCallback(() => {
    setCurrent((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const goNext = useCallback(() => {
    setCurrent((i) => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, goPrev, goNext, onOpenChange]);

  if (!open || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={() => onOpenChange(false)}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        onClick={() => onOpenChange(false)}
        aria-label="닫기"
      >
        <X className="size-8" />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm tabular-nums">
          {current + 1} / {images.length}
        </span>
      )}

      {/* Prev */}
      {images.length > 1 && (
        <button
          className="absolute left-2 sm:left-4 text-white/80 hover:text-white transition-colors rounded-full p-2 hover:bg-white/10"
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          aria-label="이전 이미지"
        >
          <ChevronLeft className="size-8" />
        </button>
      )}

      {/* Image */}
      <div
        className="max-w-screen-lg max-h-screen w-full px-16 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[current].url}
          alt={images[current].alt ?? `이미지 ${current + 1}`}
          className="max-h-[90vh] max-w-full object-contain rounded-lg"
        />
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          className="absolute right-2 sm:right-4 text-white/80 hover:text-white transition-colors rounded-full p-2 hover:bg-white/10"
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          aria-label="다음 이미지"
        >
          <ChevronRight className="size-8" />
        </button>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`size-2 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/40"}`}
              aria-label={`이미지 ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
