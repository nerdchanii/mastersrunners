type RawPostImage = {
  id: string;
  imageUrl?: string;
  sortOrder?: number;
  url?: string;
  order?: number;
};

type PostWithImages = {
  images?: RawPostImage[] | null;
};

export type PostReadImage = {
  id: string;
  url: string;
  order: number;
};

function mapPostImageForRead(image: RawPostImage, fallbackOrder: number): PostReadImage {
  return {
    id: image.id,
    url: image.url ?? image.imageUrl ?? "",
    order: image.order ?? image.sortOrder ?? fallbackOrder,
  };
}

export function mapPostForRead<T extends PostWithImages>(
  post: T,
): Omit<T, "images"> & { images: PostReadImage[] } {
  return {
    ...post,
    images: (post.images ?? []).map((image, index) => mapPostImageForRead(image, index)),
  };
}

export function mapPostsForRead<T extends PostWithImages>(
  posts: T[],
): Array<Omit<T, "images"> & { images: PostReadImage[] }> {
  return posts.map((post) => mapPostForRead(post));
}
