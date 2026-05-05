import { api } from "@/lib/api-client";

interface Post {
  id: string;
  content: string;
  createdAt: string;
  likesCount?: number;
  commentsCount?: number;
  _count?: {
    likes: number;
    comments: number;
  };
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface Workout {
  id: string;
  distance: number;
  duration: number;
  pace: number;
  date: string;
  memo: string | null;
  workoutType?: {
    id: string;
    name: string;
  };
}

interface Crew {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  _count: {
    members: number;
  };
}

interface CrewProfileResponse {
  crew: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
  recentPosts: Array<{
    id: string;
    userId: string;
    crewId: string;
    content: string;
    visibility: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      profileImage: string | null;
    };
    images?: Array<{
      id: string;
      imageUrl?: string;
      url?: string;
      sortOrder?: number;
      order?: number;
    }>;
    _count: {
      likes: number;
      comments: number;
    };
  }>;
}

interface CrewPostsResponse {
  items: Array<{
    id: string;
    userId: string;
    crewId: string;
    content: string;
    visibility: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      profileImage: string | null;
    };
    images?: Array<{
      id: string;
      imageUrl?: string;
      url?: string;
      sortOrder?: number;
      order?: number;
    }>;
    _count: {
      likes: number;
      comments: number;
    };
  }>;
  nextCursor: string | null;
}

export interface ProfileCrewPost {
  id: string;
  crewId: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
  images: Array<{
    id: string;
    url: string;
    order: number;
  }>;
  crew: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

export interface FollowUserPreview {
  id: string;
  name: string;
  profileImage: string | null;
}

interface ProfileApiResponse {
  user: {
    id: string;
    email: string;
    name: string;
    profileImage: string | null;
    backgroundImage: string | null;
    bio: string | null;
    createdAt: string;
    isPrivate: boolean;
    pb5kSeconds?: number | null;
    pb10kSeconds?: number | null;
    pbHalfMarathonSeconds?: number | null;
    pbMarathonSeconds?: number | null;
  };
  stats: {
    postCount: number;
    totalWorkouts: number;
    totalDistance: number;
    totalDuration: number;
    averagePace: number;
  };
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

function normalizeCollection<T>(data: T[] | { data: T[] }) {
  return Array.isArray(data) ? data : (data?.data ?? []);
}

export async function fetchMyProfile() {
  return api.fetch<ProfileApiResponse>("/profile");
}

export async function fetchMyProfilePosts(userId: string) {
  const data = await api.fetch<Post[] | { data: Post[] }>(`/posts?userId=${userId}&limit=12`);
  return normalizeCollection(data);
}

export async function fetchMyProfileWorkouts(userId: string) {
  const data = await api.fetch<Workout[] | { data: Workout[] }>(`/workouts?userId=${userId}`);
  return normalizeCollection(data);
}

export async function fetchMyProfileCrews() {
  const data = await api.fetch<Crew[] | { data: Crew[] }>("/crews/my");
  return normalizeCollection(data);
}

export async function fetchMyFollowersPreview() {
  const data = await api.fetch<Array<{ follower?: FollowUserPreview }> | FollowUserPreview[]>(
    "/follow/followers",
  );

  const items = Array.isArray(data) ? data : [];
  return items
    .map((item) =>
      "follower" in item && item.follower ? item.follower : (item as FollowUserPreview),
    )
    .slice(0, 3);
}

export async function fetchCrewPostsFromCrews(crews: Crew[]) {
  const crewProfiles = await Promise.all(
    crews.map(async (crew) => {
      try {
        const fullFeedPosts = await fetchAllCrewPosts(crew);
        if (fullFeedPosts.length > 0) {
          return fullFeedPosts;
        }
      } catch {
        // Fall through to the public profile summary preview.
      }

      try {
        const data = await api.fetch<CrewProfileResponse>(`/crews/${crew.id}/profile`);
        return data.recentPosts.map((post) =>
          normalizeCrewPost(post, {
            id: data.crew.id,
            name: data.crew.name,
            imageUrl: data.crew.imageUrl,
          }),
        );
      } catch {
        return [];
      }
    }),
  );

  return crewProfiles
    .flat()
    .filter((post) => post.images.every((image) => image.url.length > 0))
    .sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
}

async function fetchAllCrewPosts(crew: Crew) {
  const items: CrewPostsResponse["items"] = [];
  let cursor: string | null = null;

  do {
    const query: string = cursor ? `?cursor=${cursor}` : "";
    const response: CrewPostsResponse = await api.fetch(`/crews/${crew.id}/posts${query}`);
    items.push(...response.items);
    cursor = response.nextCursor;
  } while (cursor);

  return items.map((post) =>
    normalizeCrewPost(post, {
      id: crew.id,
      name: crew.name,
      imageUrl: crew.imageUrl,
    }),
  );
}

function normalizeCrewPost(
  post: CrewProfileResponse["recentPosts"][number] | CrewPostsResponse["items"][number],
  crew: ProfileCrewPost["crew"],
): ProfileCrewPost {
  return {
    id: post.id,
    crewId: post.crewId,
    content: post.content,
    createdAt: post.createdAt,
    user: post.user,
    _count: post._count,
    images: (post.images ?? []).map((image) => ({
      id: image.id,
      url: image.url ?? image.imageUrl ?? "",
      order: image.order ?? image.sortOrder ?? 0,
    })),
    crew,
  };
}
