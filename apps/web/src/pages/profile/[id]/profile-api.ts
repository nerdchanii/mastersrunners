import { api } from "@/lib/api-client";

export type ProfileAccessLevel = "FULL" | "LOCKED";

export interface ProfileUser {
  id: string;
  email: string;
  name: string;
  profileImage: string | null;
  backgroundImage: string | null;
  bio: string | null;
  isPrivate?: boolean;
}

export interface ProfilePost {
  id: string;
  content: string;
  createdAt: string;
  likesCount?: number;
  commentsCount?: number;
  _count?: {
    likes: number;
    comments: number;
  };
  user: ProfileUser;
}

export interface ProfileCrew {
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
    user: { id: string; name: string; profileImage: string | null };
    images?: Array<{
      id: string;
      imageUrl?: string;
      url?: string;
      sortOrder?: number;
      order?: number;
    }>;
    _count: { likes: number; comments: number };
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
    user: { id: string; name: string; profileImage: string | null };
    images?: Array<{
      id: string;
      imageUrl?: string;
      url?: string;
      sortOrder?: number;
      order?: number;
    }>;
    _count: { likes: number; comments: number };
  }>;
  nextCursor: string | null;
}

export interface ProfileCrewPost {
  id: string;
  crewId: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; profileImage: string | null };
  _count: { likes: number; comments: number };
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

export interface ProfileStats {
  postCount: number;
  totalWorkouts: number;
  totalDistance: number;
  totalDuration: number;
  averagePace: number;
}

export interface ProfileApiResponse {
  accessLevel: ProfileAccessLevel;
  user: ProfileUser & {
    workoutSharingDefault?: "PRIVATE" | "FOLLOWERS" | "PUBLIC";
    region?: string | null;
    subRegion?: string | null;
    pb5kSeconds?: number | null;
    pb10kSeconds?: number | null;
    pbHalfMarathonSeconds?: number | null;
    pbMarathonSeconds?: number | null;
    createdAt?: string;
  };
  stats: ProfileStats | null;
  followersCount: number | null;
  followingCount: number | null;
  crewCount: number | null;
  isFollowing?: boolean;
  isPending?: boolean;
  isPrivate?: boolean;
}

function normalizeCollection<T>(data: T[] | { data: T[] } | { items: T[] }) {
  if (Array.isArray(data)) {
    return data;
  }

  if ("data" in data) {
    return data.data;
  }

  if ("items" in data) {
    return data.items;
  }

  return [];
}

export async function fetchUserProfile(userId: string) {
  return api.fetch<ProfileApiResponse>(`/profile/${userId}`);
}

export async function fetchUserPosts(userId: string) {
  const data = await api.fetch<ProfilePost[] | { data: ProfilePost[] }>(
    `/posts?userId=${userId}&limit=12`,
  );
  return normalizeCollection(data);
}

export async function fetchUserCrews(userId: string) {
  const data = await api.fetch<ProfileCrew[] | { data: ProfileCrew[] }>(`/crews?userId=${userId}`);
  return normalizeCollection(data);
}

export async function fetchCrewPostsFromCrews(crews: ProfileCrew[]) {
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

async function fetchAllCrewPosts(crew: ProfileCrew) {
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

export async function toggleFollowUser(userId: string, isFollowing: boolean) {
  await api.fetch(`/follow/${userId}`, {
    method: isFollowing ? "DELETE" : "POST",
  });
}

export async function startConversation(userId: string) {
  return api.fetch<{ id: string }>("/conversations", {
    method: "POST",
    body: JSON.stringify({ participantId: userId }),
  });
}
