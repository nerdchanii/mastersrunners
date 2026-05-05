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

type RawPostWorkout = {
  workout?: (Record<string, unknown> & { encodedPolyline?: string | null }) | null;
};

type PostWithWorkouts = {
  workouts?: RawPostWorkout[] | null;
};

type PostReadImage = {
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

function mapPostWorkoutForRead(workoutEntry: RawPostWorkout): RawPostWorkout {
  const workout = workoutEntry.workout;
  if (!workout) {
    return workoutEntry;
  }

  const { encodedPolyline, route: _route, ...restWorkout } = workout;
  return {
    ...workoutEntry,
    workout: {
      ...restWorkout,
      route:
        typeof encodedPolyline === "string" && encodedPolyline.length > 0
          ? { encodedPolyline }
          : null,
    },
  };
}

export function mapPostForRead<T extends PostWithImages>(
  post: T,
): Omit<T, "images"> & { images: PostReadImage[] } {
  const workouts = (post as T & PostWithWorkouts).workouts;

  return {
    ...post,
    ...(workouts ? { workouts: workouts.map(mapPostWorkoutForRead) } : {}),
    images: (post.images ?? []).map((image, index) => mapPostImageForRead(image, index)),
  };
}

export function mapPostsForRead<T extends PostWithImages>(
  posts: T[],
): Array<Omit<T, "images"> & { images: PostReadImage[] }> {
  return posts.map((post) => mapPostForRead(post));
}
