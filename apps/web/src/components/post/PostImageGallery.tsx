import { useMemo, useState } from "react";

import { ImageLightbox } from "@/components/common/ImageLightbox";
import { cn } from "@/lib/utils";

interface PostImageGalleryProps {
  images: Array<{
    id: string;
    url: string;
    order: number;
  }>;
  className?: string;
}

export function PostImageGallery({ images, className }: PostImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const orderedImages = useMemo(
    () => [...images].sort((left, right) => left.order - right.order),
    [images],
  );

  if (orderedImages.length === 0) {
    return null;
  }

  const lightboxImages = orderedImages.map((image, index) => ({
    url: image.url,
    alt: orderedImages.length === 1 ? "게시글 이미지" : `게시글 이미지 ${index + 1}번`,
  }));

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />

      <div className={cn(className)}>
        {orderedImages.length === 1 ? (
          <button type="button" className="w-full text-left" onClick={() => handleImageClick(0)}>
            <img
              src={orderedImages[0].url}
              alt="게시글 이미지"
              loading="lazy"
              className="w-full max-h-96 object-cover"
            />
          </button>
        ) : (
          <div
            className={cn(
              "grid gap-0.5",
              orderedImages.length === 2 ? "grid-cols-2" : "grid-cols-2 grid-rows-2",
            )}
          >
            {orderedImages.slice(0, 4).map((image, index) => (
              <button
                key={image.id}
                type="button"
                className="relative aspect-square overflow-hidden"
                onClick={() => handleImageClick(index)}
              >
                <img
                  src={image.url}
                  alt={`게시글 이미지 ${index + 1}번`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                {index === 3 && orderedImages.length > 4 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-xl font-bold text-white">
                      +{orderedImages.length - 4}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
