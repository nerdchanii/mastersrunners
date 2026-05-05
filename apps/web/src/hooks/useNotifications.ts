import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { useRealtime } from "@/lib/realtime-context";

import { notificationKeys } from "./notification-keys";

export interface Notification {
  id: string;
  type:
    | "POST_LIKE"
    | "POST_COMMENT"
    | "WORKOUT_LIKE"
    | "WORKOUT_COMMENT"
    | "FOLLOW_REQUEST"
    | "FOLLOW_ACCEPTED"
    | "CREW_JOIN"
    | "CREW_INVITE"
    | "DM_RECEIVED"
    | "COMMENT_REPLY"
    | "MENTION";
  isRead: boolean;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    profileImage: string | null;
  } | null;
  referenceId: string | null;
  referenceType: string | null;
  message: string;
}

export interface NotificationPage {
  items: Notification[];
  nextCursor: string | null;
  total?: number;
}

export interface UnreadCountResponse {
  count: number;
}

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(),
    queryFn: ({ pageParam }) => {
      const cursor = pageParam ? `&cursor=${pageParam}` : "";
      return api.fetch<NotificationPage>(`/notifications?limit=20${cursor}`);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    staleTime: 1000 * 30,
  });
}

export function useUnreadNotificationCount(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => api.fetch<UnreadCountResponse>("/notifications/unread-count"),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 30,
    select: (data) => data?.count ?? 0,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { markNotificationRead } = useRealtime();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      try {
        return await markNotificationRead(notificationId);
      } catch {
        await api.fetch(`/notifications/${notificationId}/read`, { method: "PATCH" });
        return null;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      if (result && typeof result.unreadCount === "number") {
        queryClient.setQueryData(notificationKeys.unreadCount(), result.unreadCount);
        return;
      }

      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { markAllNotificationsRead } = useRealtime();

  return useMutation({
    mutationFn: async () => {
      try {
        return await markAllNotificationsRead();
      } catch {
        await api.fetch("/notifications/read-all", { method: "PATCH" });
        return null;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      if (result && typeof result.unreadCount === "number") {
        queryClient.setQueryData(notificationKeys.unreadCount(), result.unreadCount);
        return;
      }

      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}
