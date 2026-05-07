import {
  type QueryClient,
  type QueryKey,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";

import { api } from "@/lib/api-client";

import {
  cleanQueryParams,
  cursorlessQueryParams,
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

interface EventUser {
  id: string;
  name: string;
  profileImage: string | null;
}

export interface EventResult {
  resultRank: number | null;
  bibNumber: string | null;
  resultTime: number | null;
  status: string;
  user: EventUser;
  workoutId?: string | null;
}

export interface MyResult {
  resultRank: number | null;
  bibNumber: string | null;
  resultTime: number | null;
  status: string;
  workoutId: string | null;
  goalTime?: number | null;
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
  myResult: (id: string) =>
    queryOptions({
      queryKey: eventKeys.myResult(id),
      queryFn: () => api.fetch<MyResult>(`/events/${id}/results/me`),
    }),
  results: (id: string) =>
    queryOptions({
      queryKey: eventKeys.results(id),
      queryFn: async () => {
        const data = await api.fetch<EventResult[]>(`/events/${id}/results`);
        return Array.isArray(data) ? data : [];
      },
    }),
};

function isEventDetailScopedKey(queryKey: QueryKey) {
  return queryKey[0] === eventKeys.all[0] && queryKey[1] === "detail";
}

function invalidateEventMutationTargets(queryClient: QueryClient, queryKeys: readonly QueryKey[]) {
  return Promise.all(
    queryKeys.map((queryKey) =>
      queryClient.invalidateQueries(
        isEventDetailScopedKey(queryKey) ? { queryKey, exact: true } : { queryKey },
      ),
    ),
  );
}

export function useInvalidateEventMutationTargets() {
  const queryClient = useQueryClient();

  return useCallback(
    (queryKeys: readonly QueryKey[]) => invalidateEventMutationTargets(queryClient, queryKeys),
    [queryClient],
  );
}

export function useInvalidateDeletedEvents() {
  const invalidateEventMutationTargets = useInvalidateEventMutationTargets();

  return useCallback(
    () => invalidateEventMutationTargets(eventInvalidationTargets.delete()),
    [invalidateEventMutationTargets],
  );
}

type EventQueryOptions = {
  enabled?: boolean;
};

type SubmitEventResultVariables = {
  body: Record<string, unknown>;
  eventId: string;
};

type LinkEventWorkoutVariables = {
  eventId: string;
  workoutId: string;
};

type UnlinkEventWorkoutVariables = {
  eventId: string;
};

function isEnabledEventId(id: string, enabled = true) {
  return enabled && !!id && id !== "_";
}

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
    enabled: isEnabledEventId(id),
  });
}

export function useEventMyResult(id: string, options: EventQueryOptions = {}) {
  return useQuery({
    ...eventQueries.myResult(id),
    enabled: isEnabledEventId(id, options.enabled),
  });
}

export function useEventResults(id: string, options: EventQueryOptions = {}) {
  return useQuery({
    ...eventQueries.results(id),
    enabled: isEnabledEventId(id, options.enabled),
  });
}

export function useRegisterEvent() {
  const invalidateEventMutationTargets = useInvalidateEventMutationTargets();
  return useMutation({
    mutationFn: (eventId: string) => api.fetch(`/events/${eventId}/register`, { method: "POST" }),
    onSuccess: (_result, eventId) =>
      invalidateEventMutationTargets(eventInvalidationTargets.register(eventId)),
  });
}

export function useJoinEvent() {
  return useRegisterEvent();
}

export function useCancelEventRegistration() {
  const invalidateEventMutationTargets = useInvalidateEventMutationTargets();
  return useMutation({
    mutationFn: (eventId: string) => api.fetch(`/events/${eventId}/cancel`, { method: "DELETE" }),
    onSuccess: (_result, eventId) =>
      invalidateEventMutationTargets(eventInvalidationTargets.cancel(eventId)),
  });
}

export function useCancelRegistration() {
  return useCancelEventRegistration();
}

export function useLeaveEvent() {
  return useCancelEventRegistration();
}

export function useSubmitEventResult() {
  const invalidateEventMutationTargets = useInvalidateEventMutationTargets();
  return useMutation({
    mutationFn: ({ body, eventId }: SubmitEventResultVariables) =>
      api.fetch(`/events/${eventId}/results`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: (_result, { eventId }) =>
      invalidateEventMutationTargets(eventInvalidationTargets.submitResult(eventId)),
  });
}

export function useLinkEventWorkout() {
  const invalidateEventMutationTargets = useInvalidateEventMutationTargets();
  return useMutation({
    mutationFn: ({ eventId, workoutId }: LinkEventWorkoutVariables) =>
      api.fetch(`/events/${eventId}/link-workout`, {
        method: "POST",
        body: JSON.stringify({ workoutId }),
      }),
    onSuccess: (_result, { eventId }) =>
      invalidateEventMutationTargets(eventInvalidationTargets.linkWorkout(eventId)),
  });
}

export function useUnlinkEventWorkout() {
  const invalidateEventMutationTargets = useInvalidateEventMutationTargets();
  return useMutation({
    mutationFn: ({ eventId }: UnlinkEventWorkoutVariables) =>
      api.fetch(`/events/${eventId}/link-workout`, { method: "DELETE" }),
    onSuccess: (_result, { eventId }) =>
      invalidateEventMutationTargets(eventInvalidationTargets.unlinkWorkout(eventId)),
  });
}

export function useDeleteEvent() {
  return useMutation({
    mutationFn: (eventId: string) => api.fetch(`/events/${eventId}`, { method: "DELETE" }),
  });
}
