import {
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "@/lib/api-client";

import {
  cleanQueryParams,
  cursorlessQueryParams,
  invalidateQueryKeys,
  type QueryParams,
  toQueryString,
} from "./query-key-utils";

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  maxParticipants: number | null;
  _count?: { participants: number };
  // 확장 필드 (detail용)
  isPublic?: boolean;
  eventType?: string | null;
  distance?: number | null;
  registrationDeadline?: string | null;
  externalUrl?: string | null;
  organizerId?: string;
  createdAt?: string;
  creator?: { id: string; name: string; profileImage: string | null };
  isRegistered?: boolean;
  isParticipating?: boolean;
}

export interface EventDetail extends Event {
  participants?: Array<{
    id: string;
    joinedAt: string;
    user: { id: string; name: string; profileImage: string | null };
  }>;
}

interface EventListResponse {
  items: Event[];
  nextCursor: string | null;
  hasMore: boolean;
}

type EventTab = "upcoming" | "past" | "my";
export type EventListParams = QueryParams;
export type EventInfiniteListParams = QueryParams & {
  cursor?: string | null;
  limit?: number;
  tab: EventTab;
};

export const eventKeys = {
  all: ["events"] as const,
  listFamily: () => [...eventKeys.all, "list"] as const,
  list: (params?: EventListParams) =>
    [...eventKeys.listFamily(), cleanQueryParams(params)] as const,
  infiniteListFamily: () => [...eventKeys.all, "infinite-list"] as const,
  infiniteList: (params: EventInfiniteListParams) =>
    [...eventKeys.infiniteListFamily(), cursorlessQueryParams(params)] as const,
  detail: (id: string) => [...eventKeys.all, "detail", id] as const,
  myResult: (id: string) => [...eventKeys.detail(id), "my-result"] as const,
  results: (id: string) => [...eventKeys.detail(id), "results"] as const,
  my: () => [...eventKeys.all, "my"] as const,
  tab: (tab: EventTab, params?: Omit<EventInfiniteListParams, "tab">) =>
    eventKeys.infiniteList({ limit: 12, ...params, tab }),
};

export const eventInvalidationTargets = {
  register: (eventId: string) => [
    eventKeys.detail(eventId),
    eventKeys.myResult(eventId),
    eventKeys.listFamily(),
    eventKeys.infiniteListFamily(),
  ],
  cancel: (eventId: string) => [
    eventKeys.detail(eventId),
    eventKeys.myResult(eventId),
    eventKeys.listFamily(),
    eventKeys.infiniteListFamily(),
  ],
  submitResult: (eventId: string) => [
    eventKeys.detail(eventId),
    eventKeys.myResult(eventId),
    eventKeys.results(eventId),
  ],
  linkWorkout: (eventId: string) => [eventKeys.detail(eventId), eventKeys.myResult(eventId)],
  unlinkWorkout: (eventId: string) => [eventKeys.detail(eventId), eventKeys.myResult(eventId)],
  delete: () => [eventKeys.all],
};

export const eventQueries = {
  detail: (id: string) =>
    queryOptions({
      queryKey: eventKeys.detail(id),
      queryFn: () => api.fetch<EventDetail>(`/events/${id}`),
    }),
};

export function useEvents(params?: EventListParams) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => api.fetch<Event[]>(`/events${toQueryString(params)}`),
    select: (data) => (Array.isArray(data) ? data : []),
  });
}

export function useInfiniteEvents(tab: EventTab = "upcoming") {
  const baseParams = { limit: 12, tab };

  return useInfiniteQuery({
    queryKey: eventKeys.infiniteList(baseParams),
    queryFn: ({ pageParam }) => {
      let base: string;
      if (tab === "my") {
        base = `/events/my${toQueryString({ limit: baseParams.limit })}`;
      } else {
        base = `/events${toQueryString({
          limit: baseParams.limit,
          upcoming: tab === "upcoming",
        })}`;
      }
      const path = pageParam ? `${base}&cursor=${encodeURIComponent(pageParam as string)}` : base;
      return api.fetch<EventListResponse>(path);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage?.hasMore ? lastPage.nextCursor : undefined),
  });
}

export function useEvent(id: string) {
  return useQuery({
    ...eventQueries.detail(id),
    enabled: !!id && id !== "_",
  });
}

export function useJoinEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => api.fetch(`/events/${eventId}/register`, { method: "POST" }),
    onSuccess: (_result, eventId) =>
      invalidateQueryKeys(queryClient, eventInvalidationTargets.register(eventId)),
  });
}

export function useLeaveEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => api.fetch(`/events/${eventId}/cancel`, { method: "DELETE" }),
    onSuccess: (_result, eventId) =>
      invalidateQueryKeys(queryClient, eventInvalidationTargets.cancel(eventId)),
  });
}
