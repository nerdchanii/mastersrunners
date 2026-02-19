import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

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
  createdAt?: string;
  creator?: { id: string; name: string; profileImage: string | null };
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

export const eventKeys = {
  all: ["events"] as const,
  list: (params?: Record<string, string>) =>
    [...eventKeys.all, "list", params] as const,
  detail: (id: string) => [...eventKeys.all, "detail", id] as const,
  my: () => [...eventKeys.all, "my"] as const,
  tab: (tab: EventTab) => [...eventKeys.all, "tab", tab] as const,
};

export function useEvents(params?: Record<string, string>) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return api.fetch<Event[]>(`/events${qs}`);
    },
    select: (data) => (Array.isArray(data) ? data : []),
  });
}

export function useInfiniteEvents(tab: EventTab = "upcoming") {
  return useInfiniteQuery({
    queryKey: eventKeys.tab(tab),
    queryFn: ({ pageParam }) => {
      let base: string;
      if (tab === "my") {
        base = "/events/my?limit=12";
      } else {
        base = `/events?limit=12&upcoming=${tab === "upcoming"}`;
      }
      const path = pageParam ? `${base}&cursor=${encodeURIComponent(pageParam as string)}` : base;
      return api.fetch<EventListResponse>(path);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage.nextCursor : undefined,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => api.fetch<EventDetail>(`/events/${id}`),
    enabled: !!id,
  });
}

export function useJoinEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) =>
      api.fetch(`/events/${eventId}/register`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useLeaveEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) =>
      api.fetch(`/events/${eventId}/cancel`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}
