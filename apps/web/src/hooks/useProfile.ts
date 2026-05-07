import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";

import { cleanQueryParams, invalidateQueryKeys, type QueryParams } from "./query-key-utils";

export interface ProfileUser {
  id: string;
  email: string;
  name: string;
  profileImage: string | null;
  backgroundImage: string | null;
  bio: string | null;
  isPrivate: boolean;
  workoutSharingDefault?: "PRIVATE" | "FOLLOWERS" | "PUBLIC";
  region?: string | null;
  subRegion?: string | null;
  pb5kSeconds?: number | null;
  pb10kSeconds?: number | null;
  pbHalfMarathonSeconds?: number | null;
  pbMarathonSeconds?: number | null;
  createdAt: string;
}

export interface ProfileApiResponse {
  user: ProfileUser;
  stats: {
    postCount?: number;
    totalWorkouts: number;
    totalDistance: number;
    totalDuration: number;
    averagePace: number;
  };
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

export interface ProfileStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
  workoutCount: number;
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
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

export interface ProfileWorkout {
  id: string;
  distance: number;
  duration: number;
  pace: number;
  date: string;
  memo: string | null;
  user?: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  workoutType?: {
    id: string;
    name: string;
  };
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
  recentPosts: CrewPostResponseItem[];
}

interface CrewPostsResponse {
  items: CrewPostResponseItem[];
  nextCursor: string | null;
}

interface CrewPostResponseItem {
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

export interface ProfileCrewsTabData {
  crews: ProfileCrew[];
  crewPosts: ProfileCrewPost[];
}

export interface FollowUserPreview {
  id: string;
  name: string;
  profileImage: string | null;
}

type ProfileTabData = ProfilePost[] | ProfileWorkout[] | ProfileCrewsTabData | FollowUserPreview[];

interface UpdateProfileDto {
  name?: string;
  bio?: string | null;
  profileImage?: string | null;
  backgroundImage?: string | null;
  region?: string | null;
  subRegion?: string | null;
  isPrivate?: boolean;
  workoutSharingDefault?: "PRIVATE" | "FOLLOWERS" | "PUBLIC";
  pb5kSeconds?: number | null;
  pb10kSeconds?: number | null;
  pbHalfMarathonSeconds?: number | null;
  pbMarathonSeconds?: number | null;
}

export type ProfileTab = "posts" | "workouts" | "crews" | "followers" | "following";
export type ProfileTabParams = QueryParams;
type ProfileQueryOptions = {
  enabled?: boolean;
};

export const profileKeys = {
  all: ["profile"] as const,
  mine: () => [...profileKeys.all, "mine"] as const,
  detail: (id: string) => [...profileKeys.all, "detail", id] as const,
  stats: (id: string) => [...profileKeys.detail(id), "stats"] as const,
  tabFamily: (id: string) => [...profileKeys.detail(id), "tab"] as const,
  tab: (id: string, tab: ProfileTab, params?: ProfileTabParams) =>
    [...profileKeys.tabFamily(id), tab, cleanQueryParams(params)] as const,
  user: (id: string) => profileKeys.detail(id),
};

export const profileInvalidationTargets = {
  edit: (userId: string) => [
    profileKeys.mine(),
    profileKeys.detail(userId),
    profileKeys.stats(userId),
    profileKeys.tabFamily(userId),
  ],
  follow: (userId: string) => [
    profileKeys.detail(userId),
    profileKeys.stats(userId),
    profileKeys.tabFamily(userId),
  ],
};

export const profileQueries = {
  mine: (options: ProfileQueryOptions = {}) =>
    queryOptions({
      queryKey: profileKeys.mine(),
      queryFn: () => api.fetch<ProfileApiResponse>("/profile"),
      enabled: options.enabled ?? true,
    }),
  detail: (id: string, options: ProfileQueryOptions = {}) =>
    queryOptions({
      queryKey: profileKeys.detail(id),
      queryFn: () => api.fetch<ProfileApiResponse>(`/profile/${id}`),
      enabled: isEnabledProfileId(id, options.enabled),
    }),
  stats: (id: string, options: ProfileQueryOptions = {}) =>
    queryOptions({
      queryKey: profileKeys.stats(id),
      queryFn: async () => {
        const data = await api.fetch<ProfileApiResponse>("/profile");
        return toProfileStats(data);
      },
      enabled: isEnabledProfileId(id, options.enabled),
    }),
  followersPreview: (id: string, options: ProfileQueryOptions = {}) =>
    queryOptions({
      queryKey: profileKeys.tab(id, "followers", { limit: 3 }),
      queryFn: fetchFollowersPreview,
      enabled: isEnabledProfileId(id, options.enabled),
    }),
  crews: (id: string, options: ProfileQueryOptions = {}) =>
    queryOptions({
      queryKey: profileKeys.tab(id, "crews", { surface: "header" }),
      queryFn: fetchMyProfileCrews,
      enabled: isEnabledProfileId(id, options.enabled),
    }),
  tab: (
    id: string,
    tab: ProfileTab,
    params?: ProfileTabParams,
    options: ProfileQueryOptions = {},
  ) =>
    queryOptions({
      queryKey: profileKeys.tab(id, tab, params),
      queryFn: () => fetchProfileTabData(id, tab, params),
      enabled: isEnabledProfileId(id, options.enabled) && canReadProfileTab(tab),
    }),
};

export function useProfile(options: ProfileQueryOptions = {}) {
  return useQuery(profileQueries.mine(options));
}

export function useUserProfile(id: string, options: ProfileQueryOptions = {}) {
  return useQuery(profileQueries.detail(id, options));
}

export function useProfileStats(id: string, options: ProfileQueryOptions = {}) {
  return useQuery(profileQueries.stats(id, options));
}

export function useProfileFollowersPreview(id: string, options: ProfileQueryOptions = {}) {
  return useQuery(profileQueries.followersPreview(id, options));
}

export function useProfileCrews(id: string, options: ProfileQueryOptions = {}) {
  return useQuery(profileQueries.crews(id, options));
}

export function useProfileTab(
  id: string,
  tab: ProfileTab,
  params?: ProfileTabParams,
  options: ProfileQueryOptions = {},
) {
  return useQuery(profileQueries.tab(id, tab, params, options));
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProfileDto) =>
      api.fetch<ProfileApiResponse>("/profile", {
        method: "PATCH",
        body: JSON.stringify(dto),
      }),
    onSuccess: (profile) =>
      invalidateQueryKeys(queryClient, profileInvalidationTargets.edit(profile.user.id)),
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) =>
      api.fetch(`/follow/${userId}`, {
        method: isFollowing ? "DELETE" : "POST",
      }),
    onSuccess: (_data, { userId }) =>
      invalidateQueryKeys(queryClient, profileInvalidationTargets.follow(userId)),
  });
}

function isEnabledProfileId(id: string, enabled = true) {
  return enabled && !!id && id !== "_";
}

function canReadProfileTab(tab: ProfileTab) {
  return tab === "posts" || tab === "workouts" || tab === "crews" || tab === "followers";
}

function toProfileStats(data: ProfileApiResponse): ProfileStats {
  return {
    postCount: data.stats.postCount ?? 0,
    followerCount: data.followersCount,
    followingCount: data.followingCount,
    workoutCount: data.stats.totalWorkouts,
  };
}

function normalizeCollection<T>(data: T[] | { data: T[] }) {
  return Array.isArray(data) ? data : (data?.data ?? []);
}

async function fetchProfilePosts(userId: string, params?: ProfileTabParams) {
  const data = await api.fetch<ProfilePost[] | { data: ProfilePost[] }>(
    `/posts?userId=${userId}&limit=${params?.limit ?? 12}`,
  );
  return normalizeCollection(data);
}

async function fetchProfileWorkouts(userId: string) {
  const data = await api.fetch<ProfileWorkout[] | { data: ProfileWorkout[] }>(
    `/workouts?userId=${userId}`,
  );
  return normalizeCollection(data);
}

async function fetchMyProfileCrews() {
  const data = await api.fetch<ProfileCrew[] | { data: ProfileCrew[] }>("/crews/my");
  return normalizeCollection(data);
}

async function fetchFollowersPreview() {
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

async function fetchProfileTabData(
  userId: string,
  tab: ProfileTab,
  params?: ProfileTabParams,
): Promise<ProfileTabData> {
  if (tab === "posts") {
    return fetchProfilePosts(userId, params);
  }

  if (tab === "workouts") {
    return fetchProfileWorkouts(userId);
  }

  if (tab === "crews") {
    const crews = await fetchMyProfileCrews();
    return {
      crews,
      crewPosts: await fetchCrewPostsFromCrews(crews),
    };
  }

  if (tab === "followers") {
    return fetchFollowersPreview();
  }

  throw new Error(`Unsupported profile tab: ${tab}`);
}

async function fetchCrewPostsFromCrews(crews: ProfileCrew[]) {
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
  post: CrewPostResponseItem,
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
